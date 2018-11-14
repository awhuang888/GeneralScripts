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

main();


//CreateView(comm);

//RunSql(comm);
async function main() {
    let allViewsDef = await getViewsDefinition();
    //console.log( viewsDef);

    let viewTableMap = [];
    allViewsDef.forEach( v => viewTableMap[v.name] = GetViewMainTable(v.name, v.definition));   
    //console.log(viewTableMap);

    let viewDefinition = allViewsDef.find(v => v.name=='vMember').definition;
    let tableAlias = GetTableArray(viewDefinition);
    console.log(tableAlias);
    let columnArray = await GetInputColumns(tableAlias);
    console.log(columnArray);
    // let columnArray = await GetInputColumns("vMember");
    // console.log(columnArray);
}


async function GetInputColumns(tables) {
    let colArray = [];
    let nameString = tables.map((t) => `'${t.name}'`).join(",");
    const command = `
    select o.[name] as tablename, c.[name] as columnname from sys.objects o join sys.columns  c on o.object_id = c.object_id\
    where o.type='U'  and o.name in (${nameString}) order by tablename, c.column_id`;

    try {
        console.log("sql connecting......")
        let pool = await sql.connect(inputDbConfig)
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
    let tempArray = comm.split(/\s+/);
    let f = tempArray.find(a => a.toUpperCase() == 'FROM' || a.toUpperCase() == 'JOIN');
    let tableArray = [];

    while (f) {
        const ind = tempArray.indexOf(f);
        const name = tempArray[ind + 1];
        const alias = tempArray[ind + 2];
        tableArray.push({ name, alias });
        console.log({ name, alias });
        tempArray = tempArray.slice(ind + 3);
        f = tempArray.find(a => a.toUpperCase() == 'FROM' || a.toUpperCase() == 'JOIN');
    }
    return tableArray;
}

function GetViewMainTable(vName, comm) {
    const sqlArray = comm.split(/\s+/);
    let f = sqlArray.find(a => a.toUpperCase() == 'FROM');
    let tempArray = sqlArray;
    let tableArray = [];

    let viewTableMap = [];
    viewTableMap["vLegalEntityAccountOrder"]="LegalEntityAccountOrder";
    viewTableMap["vLegalEntityAccountTransaction"]="LegalEntityAccountTransaction";
    viewTableMap["vLegalEntityTransaction"]="LegalEntityAccountTransaction";
    viewTableMap["vDefinedBenefitAccount"]="DefinedBenefitAccount";
    viewTableMap["vMember"]="MemberExtract";

    viewTableMap["vLegalEntityGeneralJournalOpeningBalances"]="SpecialReconciliation ";
    viewTableMap["vLegalEntityGeneralJournal"]="SpecialReconciliation";
    viewTableMap["vLegalEntityAccountGeneralJounral"]="SpecialReconciliation";
    viewTableMap["vLegalEntityAccountGeneralJournalOpeningBalances"]="SpecialReconciliation";
    viewTableMap["vLegalEntityAccountTransactionGL"]="SpecialReconciliation";
    viewTableMap["vGeneralJournal"]="SpecialReconciliation";


    if (vName in viewTableMap) 
        return viewTableMap[vName];


    while (f) {
        const ind = sqlArray.indexOf(f);
        let name = sqlArray[ind + 1];
        name = name.replace(/dbo\./gi,'');
        const alias = sqlArray[ind + 2];
        tableArray.push({ name, alias });
        tempArray = tempArray.slice(ind + 3);
        f = tempArray.find(a => a.toUpperCase() == 'FROM');
    }

    const deduped = [...new Set(tableArray)]; 
    let viewName = deduped[0].name;
    if (deduped.length > 1) console.log(`-------------- Error -------view name ${vName} definition: ${vName}`);
    return deduped[0].name;
}

// async function RunSql(command) {
//     try {
//         console.log("sql connecting......")
//         let pool = await sql.connect(outputDbConfig)
//         let result = await pool.request().query(command);
//         const allEqual = arr => arr.every(v => v === arr[0]);

//         result.recordset.forEach((r) => {
//             Object.keys(r).forEach((k) => {
//                 let value = r[k];

//                 if (value instanceof Array) {
//                     if (allEqual(value)) {
//                         console.log(k, allEqual(value), value[0], value[1]);
//                     }
//                 }
//             }
//             )
//         }
//         );

//         await sql.close();
//     } catch (err) {
//         console.log(err);
//     }
// }

// function ReadXlsxDesign() {
//     let rowDelimiter = Math.random().toString(26).slice(2);
//     let XLSX = require('xlsx')
//     let workbook = XLSX.readFile('../EntityTest.xlsx');
//     let sheet_name_list = workbook.SheetNames;
//     const xlData = XLSX.utils.sheet_to_csv(workbook.Sheets[sheet_name_list[0]], { FS: "\t", RS: rowDelimiter });

//     let xlDesign = xlData.split(rowDelimiter).map((li) => {
//         let aStr = li.split('\t'); 
//         return {name : aStr[0], dataType : aStr[1]} 
//     });
//     return xlDesign;
// }


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
        });
        await sql.close();
    } catch (err) {
        console.log(err);
    }

    return viewDef;
}

