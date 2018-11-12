const sql = require('mssql');
const fs = require('fs');

const sqlConfig = {
    server: 'db.recreo.io',
    database: 'OneTrust',
    user: 'sa',
    password: 'R3cr30Database!',
    port: 1433
};
// const comm = 'select top 2 * from LegalEntity';
const comm = `select top 2 * from LegalEntity le 
            join LegalEntityType let 
            on le.LegalEntityTypeId = let.LegalEntityTypeId`;

//const xlCsv = ReadXlsxToCsv();

console.log(ReadXlsxDesign());

//CreateView(comm);

//RunSql(comm);
async function CreateView(comm) {
    let tableAlias = GetTableArray(comm);
    //console.log(tableAlias);
    let columnArray = await GetColumnArray(tableAlias);
    console.log(columnArray);
    // let columnArray = await RunSql(comm);
    // console.log(columnArray);

    // rule to pick up column source:
    // 1: from "SourceFrom" column
    // 2: If just one table has the column name, choose this table as source
    // 3: If more than one table have the same column name, choose the first table in array as source
    // 4: If no column name matched, but concat "Id" can match && Datatype is int, then restart from 2.
    // 5: put question mark in output.
    ReadXlsxDesign().forEach(

    );


}


async function GetColumnArray(tables) {
    let colArray = [];
    let nameString = tables.map((t) => `'${t.name}'`).join(",");
    const command = `
    select o.[name] as tablename, c.[name] as columnname from sys.objects o join sys.columns  c on o.object_id = c.object_id\
    where o.type='U'  and o.name in (${nameString}) order by tablename, c.column_id`;

    try {
        console.log("sql connecting......")
        let pool = await sql.connect(sqlConfig)
        let result = await pool.request().query(command);

        result.recordset.forEach((r) => colArray.push({ tableName: r.tablename, columnName: r.columnname }));

        await sql.close();
        console.log(columnArray);
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
    return tableArray
}

async function RunSql(command) {
    try {
        console.log("sql connecting......")
        let pool = await sql.connect(sqlConfig)
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

