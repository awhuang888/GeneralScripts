const sql = require('mssql');

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

let tableArray = [];
//RunSql(comm);
GetTableArray(comm);

async function GetTableArray(comm) {
    const command = `select [name] from sys.objects where type='U' order by [name]`;
    try {
        console.log("sql connecting......")
        let pool = await sql.connect(sqlConfig)
        let result = await pool.request().query(command); 

        result.recordset.forEach((r) => tableArray.push(r.name));
//        console.log(tableArray);

        const sqlArray = comm.split(/\s+/);
        console.log(sqlArray);

        //Todo: loop array by slice array or index... 

        const f = sqlArray.find( a => a.toUpperCase() == 'FROM' || a.toUpperCase() == 'JOIN');
        const ind = sqlArray.indexOf(f);
        const t = sqlArray[ind+1];
        const a = sqlArray[ind+2];
        console.log(f, t, a);

        
        await sql.close();
    } catch (err) {
        console.log(err);
    }
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

