const sql = require('mssql/msnodesqlv8');
const fs = require('fs');
const dbConfig = require('./recon-config.json');

const outputDbConfig = dbConfig.output;
const inputDbConfig = dbConfig.input;
//console.log(dbConfig.input);



// const comm = 'select top 2 * from LegalEntity';
const comm = `select top 2 * from LegalEntity le 
            join LegalEntityType let 
            on le.LegalEntityTypeId = let.LegalEntityTypeId`;

//const xlCsv = ReadXlsxToCsv();

//console.log(ReadXlsxDesign());

//console.log(showColumnArray(comm));
showColumnArray(comm);


//CreateView(comm);

//RunSql(comm);
async function showColumnArray(comm) {
    let tableAlias = GetTableArray(comm);
    //console.log(tableAlias);
    let columnArray = await GetColumnArray(tableAlias);
    //console.log(columnArray);


    // let mainTable = await GetViewMainTable(comm);
    // console.log( mainTable);

    let viewsDef = await getViewsDefinition();
    //console.log( viewsDef);

    viewsDef.forEach( v => {
        console.log(v.name, GetViewMainTable(v.definition));

    });

}


async function GetColumnArray(tables) {
    let colArray = [];
    let nameString = tables.map((t) => `'${t.name}'`).join(",");
    const command = `
    select o.[name] as tablename, c.[name] as columnname from sys.objects o join sys.columns  c on o.object_id = c.object_id\
    where o.type='U'  and o.name in (${nameString}) order by tablename, c.column_id`;

    try {
        console.log("sql connecting......")
        let pool = await sql.connect(outputDbConfig)
        let result = await pool.request().query(command);

        result.recordset.forEach((r) => colArray.push({ tableName: r.tablename, columnName: r.columnname }));

        await sql.close();
        //console.log(columnArray);
    } catch (err) {
        console.log(err);
    }

    return colArray;
}

function GetTableArray(comm) {
    const sqlArray = comm.split(/\s+/);
    let f = sqlArray.find(a => a.toUpperCase() == 'FROM' || a.toUpperCase() == 'JOIN');
    let tempArray = sqlArray;
    let tableArray = [];

    while (f) {
        const ind = sqlArray.indexOf(f);
        const name = sqlArray[ind + 1];
        const alias = sqlArray[ind + 2];
        tableArray.push({ name, alias });
        tempArray = tempArray.slice(ind + 3);
        f = tempArray.find(a => a.toUpperCase() == 'FROM' || a.toUpperCase() == 'JOIN');
    }
    return tableArray;
}

function GetViewMainTable(comm) {
    const sqlArray = comm.split(/\s+/);
    let f = sqlArray.find(a => a.toUpperCase() == 'FROM');
    let tempArray = sqlArray;
    let tableArray = [];

    while (f) {
        const ind = sqlArray.indexOf(f);
        const name = sqlArray[ind + 1];
        const alias = sqlArray[ind + 2];
        tableArray.push({ name, alias });
        tempArray = tempArray.slice(ind + 3);
        f = tempArray.find(a => a.toUpperCase() == 'FROM');
    }

    const deduped = [...new Set(tableArray)]; 
    let viewName = deduped[0].name;
    if (deduped.length > 1) console.log(`-------------- Error -------view name ${comm} `);
    return deduped[0].name;
}

async function RunSql(command) {
    try {
        console.log("sql connecting......")
        let pool = await sql.connect(outputDbConfig)
        let result = await pool.request().query(command);
        const allEqual = arr => arr.every(v => v === arr[0]);

        result.recordset.forEach((r) => {
            Object.keys(r).forEach((k) => {
                let value = r[k];

                if (value instanceof Array) {
                    if (allEqual(value)) {
                        console.log(k, allEqual(value), value[0], value[1]);
                    }
                }
            }
            )
        }
        );

        await sql.close();
    } catch (err) {
        console.log(err);
    }
}

function ReadXlsxDesign() {
    let rowDelimiter = Math.random().toString(26).slice(2);
    let XLSX = require('xlsx')
    let workbook = XLSX.readFile('../EntityTest.xlsx');
    let sheet_name_list = workbook.SheetNames;
    const xlData = XLSX.utils.sheet_to_csv(workbook.Sheets[sheet_name_list[0]], { FS: "\t", RS: rowDelimiter });

    let xlDesign = xlData.split(rowDelimiter).map((li) => {
        let aStr = li.split('\t'); 
        return {name : aStr[0], dataType : aStr[1]} 
    });
    return xlDesign;
}


async function getViewsDefinition() {
    const command = `
    select o.name, definition
    from sys.objects     o
    join sys.sql_modules m on m.object_id = o.object_id
    where  o.type = 'V' and o.name not like 'vw[_]%' order by o.name
    `;
    let viewDef = []
    try {
        console.log("sql connecting......")
        let pool = await sql.connect(outputDbConfig)
        let result = await pool.request().query(command);
        const allEqual = arr => arr.every(v => v === arr[0]);

        result.recordset.forEach((r) => {
            viewDef.push({ name: r.name, definition: r.definition});
        }
        );

        await sql.close();
    } catch (err) {
        console.log(err);
    }

    return viewDef;
}

