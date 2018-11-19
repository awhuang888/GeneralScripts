const sql = require('mssql/msnodesqlv8');
const fs = require('fs');
const yaml = require('js-yaml');
const dbConfig = yaml.safeLoad(fs.readFileSync('recon-config.yml', 'utf8'));
const sprintf = require("sprintf-js");


const outputDbConfig = dbConfig.output;
const inputDbConfig = dbConfig.input;
const reconConfig = yaml.safeLoad(fs.readFileSync('recon-view.yml', 'utf8'));


// const comm = 'select top 2 * from LegalEntity';
// const comm = `select top 2 * from LegalEntity le 
//             join LegalEntityType let 
//             on le.LegalEntityTypeId = let.LegalEntityTypeId`;

main();


async function main() {
    console.log(reconConfig);
    console.log(reconConfig["vMember"].input);
    let inputTable = reconConfig["vMember"].input;

    let inputColumns = await GetTableColumns(inputTable, isInput = true);
    let outputColumns = await GetTableColumns('vMember', isInput = false);

    let columnMap = SchemaCheck(outputColumns, inputColumns);
    //console.log(columnMap['Fax']);
    // let viewResult = await RunSql(outputDbConfig, "select  * from vMember where ExternalReference between '430000000' and '440000000' and Gender is not null  order by ExternalReference");
    // let tableResult = await RunSql(inputDbConfig, "select  * from Recreo_Extracts..MemberExtract where ExternalReference between '430000000' and '440000000' and Gender is not null  order by ExternalReference");
    //console.log(sqlResult);
    let viewResult = await RunSql(outputDbConfig, reconConfig["vMember"].outputDataSet);
    let tableResult = await RunSql(inputDbConfig, reconConfig["vMember"].inputDataSet);

    const outputFormat = "%-120s";
    viewResult.forEach( v => {
        let mr = tableResult.find(t => t.ExternalReference == v.ExternalReference);
        if (mr instanceof Array)
            console.log(sprintf.sprintf(outputFormat, `ERROR: externalReference:${v.ExternalReference} has more than one source.` ));
        else if (mr == undefined)
            console.log(sprintf.sprintf(outputFormat, `ERROR: externalReference:${v.ExternalReference} has NO source found.`));
        else {
            console.log(sprintf.sprintf(outputFormat, `------------------------------Found: externalReference:${v.ExternalReference} source found.`));
            Reflect.ownKeys(v).forEach(key => {
                // console.log(mr);
                if(key in columnMap)
                {
                    let outputValue = JSON.stringify(v[key]);
                    let inputValue = JSON.stringify(mr[key]);
                    if (outputValue != inputValue)
                    {
                        columnMap[key].errorCount++;
                        console.log(sprintf.sprintf(outputFormat,`${key}: output:${outputValue}  -- input:${inputValue}`));
                        //console.log(typeof outputValue, typeof inputValue)
                    }
                    columnMap[key].totalCount++;
                }
            });
        }
    });

    console.log(columnMap);
}


function SchemaCheck(outputColumns, inputColumns) {
    let columnMap = [];
    const outputFormat = '%-36s%-60s%s';
    console.log(sprintf.sprintf(outputFormat, 'Output View Column', 'Input Column', 'Comment'));
    console.log(sprintf.sprintf(outputFormat, '------------------', '------------', '-------'));
    outputColumns.forEach(r => {
        let im = inputColumns.find(ir => ir.columnName == r.columnName);
        //console.log(inputMatch);
        if (im instanceof Array)
            console.log(sprintf.sprintf(outputFormat, r.columnName, "N/A", "More Than One Value"));
        else if (im == undefined)
            console.log(sprintf.sprintf(outputFormat, r.columnName, "N/A", "Not input Column matched"));
        else {
            let warning = (im.system_type_id == r.system_type_id
                && im.precision == r.precision
                && im.max_length == r.max_length)
                ? "" :
                `WARNING: Data Type Not Match. DataType:${im.system_type_id} vs ${r.system_type_id} \
-- max_length :${im.max_length} vs ${r.max_length} -- precision :${im.precision} vs ${r.precision}`;

            console.log(sprintf.sprintf(outputFormat, r.columnName, `${im.tableName}.${im.columnName}`, warning));
            if (warning === "")
                columnMap[r.columnName] = { sourceTable: im.tableName, sourceColumn: im.columnName, errorCount: 0, totalCount: 0 };
        }
    });
    return columnMap;
}

async function GetTableColumns(tables, isInput) {

    let objecttype = isInput ? 'U' : 'V';
    let currentDbConfig = isInput ? inputDbConfig : outputDbConfig;
    let nameString = isInput ? tables.map((t) => `'${t}'`).join(",") : `'${tables}'`;


    let colArray = [];
    const command = `
    select o.[name] as tablename, c.[name] as columnname, c.system_type_id, c.max_length, c.[precision]  from sys.objects o join sys.columns  c on o.object_id = c.object_id\
    where o.type='${objecttype}'  and o.name in (${nameString}) order by tablename, c.column_id`;

    //console.log(command);

    try {
        //console.log("sql connecting......")
        const pool = await sql.connect(currentDbConfig)
        const result = await pool.request().query(command);

        result.recordset.forEach((r) => colArray.push({
            tableName: r.tablename,
            columnName: r.columnname,
            system_type_id: r.system_type_id,
            max_length: r.max_length,
            precision: r.precision
        }));

        await sql.close();
    } catch (err) {
        console.log(err);
    }

    return colArray;
}

async function RunSql(dbConfig, command) {
    let result;
    try {
        console.log("sql connecting......")
        let pool = await sql.connect(dbConfig)
        result = await pool.request().query(command);
        await sql.close();
    } catch (err) {
        console.log(err);
    }

    return  result.recordset;
}

