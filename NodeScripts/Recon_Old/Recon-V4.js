const sql = require('mssql/msnodesqlv8');
const fs = require('fs');
const yaml = require('js-yaml');
const sprintf = require("sprintf-js");

const dbConfig = yaml.safeLoad(fs.readFileSync('recon-config.yml', 'utf8'));
const outputDbConfig = dbConfig.output;
const inputDbConfig = dbConfig.input;
const reconConfig = yaml.safeLoad(fs.readFileSync('recon-view.yml', 'utf8'));


//main('vMember');
main('vSuperAccount');

async function main(viewName) {
    const startDate = new Date();
    console.log(sprintf.sprintf("Start %-30s\t%-30s", startDate, viewName));

    let inputTable = reconConfig[viewName].input;
    let inputColumns = await GetTableColumns(inputTable, isInput = true);
    let outputColumns = await GetTableColumns(viewName, isInput = false);
    let ignoreInputColumns = reconConfig[viewName].ignoreColumns;
    ignoreInputColumns = (ignoreInputColumns == null)?["Dummy"]:ignoreInputColumns;
    console.log(inputColumns, outputColumns, ignoreInputColumns );
    let columnMap = SchemaCheck(outputColumns, inputColumns, ignoreInputColumns);
    console.log("Schema Checked Successful! Loading data for full reconciliation...");

    let viewResult = await RunSql(outputDbConfig, reconConfig[viewName].outputDataSql);
    let tableResult = await RunSql(inputDbConfig, reconConfig[viewName].inputDataSql);

    if (viewResult.length != tableResult.length) {
        console.log("Row Count Checked fail! Input Row Count: %s vs Output Row Count", tableResult.length, viewResult.length);
        return;
    }

    console.log("Row Count Checked Successful! Performing field by field checking for %s rows....", tableResult.length);

    await genMatchByKeyFunc(reconConfig[viewName].keyColumns, "./tmpFunc.js");
    const matchFunc = require('./tmpFunc');

    let rowCount = 0;
    const outputFormat = "%-120s";
    let tempTableResult = tableResult.slice(0, 1000);
    viewResult.forEach(v => {
        let mr = tempTableResult.find(t => matchFunc.isMatchedByKeys(v, t));

        if (mr instanceof Array)
            console.log(sprintf.sprintf(outputFormat, `ERROR: externalReference:${v.ExternalReference} has more than one source.`));
        else if (mr == undefined)
            console.log(sprintf.sprintf(outputFormat, `ERROR: externalReference:${v.ExternalReference} has NO source found.`));
        else {
            Reflect.ownKeys(v).forEach(key => {
                if (key in columnMap) {
                    let outputValue = JSON.stringify(v[key]);
                    let inputKey = columnMap[key].sourceColumn;
                    let inputValue = JSON.stringify(mr[inputKey]);
                    if (outputValue != inputValue) {
                        columnMap[key].errorCount++;
                        console.log(sprintf.sprintf(outputFormat, `${key}: output:${outputValue}  -- input:${inputValue}`));
                    }
                    columnMap[key].totalCount++;
                }
            });
        }

        if (rowCount++ % 1000 === 0) {
            tempTableResult = tableResult.slice(rowCount - 1, rowCount + 1000);
            if (((rowCount - 1) % 10000 === 0) && rowCount > 1)
                console.log(sprintf.sprintf(outputFormat, `${rowCount - 1} row Checked`));
        }
    });

    console.log("\n\n");
    const reportFormat = "%-36s\t%-60s\t%-12s\t%-12s";
    console.log(sprintf.sprintf(reportFormat, "OutputColumn", "InputColumn", "Error Count", "Total Count"));
    console.log(sprintf.sprintf(reportFormat, "------------", "-----------", "-----------", "-----------"));
    //console.log(columnMap);
    Object.keys(columnMap).forEach(k => {
        console.log(sprintf.sprintf(reportFormat, k, `${columnMap[k].sourceTable}.${columnMap[k].sourceColumn}`
            , columnMap[k].errorCount, columnMap[k].totalCount));
    })

    const endDate = new Date();
    console.log(sprintf.sprintf("%-20s  ---- Process Duration %-10s Seconds", endDate, (endDate.getTime() - startDate.getTime()) / 1000));
}

async function genMatchByKeyFunc(keyColumns, tempFuncFile) {
    let s = sprintf.sprintf("function isMatchedByKeys (v,t) {  \n\t return ");
    let i = 0;
    keyColumns.forEach(k => {
        let andOp = (i++ == 0) ? "" : " && ";
        s = s + andOp + `v.${k} === t.${k}`;
    });
    s = s + sprintf.sprintf(";\r\n}\r\nexports.isMatchedByKeys = isMatchedByKeys;");
    await fs.writeFileSync(tempFuncFile, s, e => { if(e) return console.log(e);} );
}


function SchemaCheck(outputColumns, inputColumns, ignoreInputColumns) {
    let columnMap = [];
    const outputFormat = '%-36s%-60s%s';
    console.log(sprintf.sprintf(outputFormat, 'Output View Column', 'Input Column', 'Comment'));
    console.log(sprintf.sprintf(outputFormat, '------------------', '------------', '-------'));
    outputColumns.forEach(r => {
        if ( !ignoreInputColumns.includes(r.columnName)){
            let nameChangedInfo = "";
            let im = inputColumns.find(ir => ir.columnName === r.columnName);
            if (im == undefined) {
                im = inputColumns.find(ir => ir.columnName.toUpperCase() === r.columnName.toUpperCase());
                if (im != undefined)
                    nameChangedInfo = `Info: Column name changed:  ${im.columnName} vs ${r.columnName}; `;
            }

            if (im instanceof Array)
                console.log(sprintf.sprintf(outputFormat, r.columnName, "N/A", "More Than One Value"));
            else if (im == undefined)
                console.log(sprintf.sprintf(outputFormat, r.columnName, "N/A", "Not input Column matched"));
            else {
                let warning = (im.system_type_id == r.system_type_id
                    && im.precision == r.precision
                    && im.max_length == r.max_length)
                    ? `${nameChangedInfo}` :
                    `${nameChangedInfo}WARNING: Data Type Not Match! DataType:${im.system_type_id} vs ${r.system_type_id}` +
                    ` -- max_length :${im.max_length} vs ${r.max_length} -- precision :${im.precision} vs ${r.precision}`;

                console.log(sprintf.sprintf(outputFormat, r.columnName, `${im.tableName}.${im.columnName}`, warning));
                columnMap[r.columnName] = { sourceTable: im.tableName, sourceColumn: im.columnName, errorCount: 0, totalCount: 0 };
            }
        }
        else {
            console.log(sprintf.sprintf(outputFormat, r.columnName, "N/A", "Ignored"));
        } 
    });
    return columnMap;
}

async function GetTableColumns(tables, isInput) {
    let objecttype = isInput ? 'U' : 'V';
    let currentDbConfig = isInput ? inputDbConfig : outputDbConfig;
    let nameString = isInput ? tables.map((t) => `'${t}'`).join(",") : `'${tables}'`;

    const command = `
    select o.[name] as tablename, c.[name] as columnname, c.system_type_id, c.max_length, c.[precision]  from sys.objects o join sys.columns  c on o.object_id = c.object_id\
    where o.type='${objecttype}'  and o.name in (${nameString}) order by tablename, c.column_id`;

    let tableSchema = await RunSql(currentDbConfig, command);

    let colArray = [];
    tableSchema.forEach((r) => colArray.push({
        tableName: r.tablename,
        columnName: r.columnname,
        system_type_id: r.system_type_id,
        max_length: r.max_length,
        precision: r.precision
    }));

    return colArray;
}

async function RunSql(dbConfig, command) {
    let result;
    try {
        let pool = await sql.connect(dbConfig)
        result = await pool.request().query(command);
        await sql.close();
    } catch (err) {
        console.log(err);
    }
    return result.recordset;
}



