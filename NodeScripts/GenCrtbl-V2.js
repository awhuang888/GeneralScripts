
//Usage: cat './crtblTest02.txt' |  node GenCrtbl.js > output.sql

const sprintf = require("sprintf-js");
// const lineReader = require('readline').createInterface({
//     // input: require('fs').createReadStream('./crtblTest02.txt', {autoClose: true })
//     input: process.stdin
// });

var isNewTable = true;
var isEndOfTable = false;
var tableName = "";
var pkArray = [];
var index_1_Array = [];
var index_2_Array = [];


const templateObj = {
    GenColCheck(tableName, note) {
        if ((new RegExp('1 = Phone', 'g')).test(note)) {
            console.log(sprintf.sprintf("  CONSTRAINT [CHK_%s_ContactMethodTypeId]", tableName));
            console.log(sprintf.sprintf("\tCHECK ( ContactMethodTypeId in (1,2,3) ) -- 1 = Phone, 2 = Email, 3 = Post"));
        }

        if ((new RegExp('4 = Financial Adviser', 'g')).test(note)) {
            console.log(sprintf.sprintf("  CONSTRAINT [CHK_%s_AssociationType]", tableName));
            console.log(sprintf.sprintf("\tCHECK ( AssociationType in (4,7,8) ) -- 4 = Financial Adviser, 7 = Primary Contact, 8 = Secondary Contact"));
        }

        if ((new RegExp('1 - Employer', 'g')).test(note)) {
            console.log(sprintf.sprintf("  CONSTRAINT [CHK_%s_CompanyType]", tableName));
            console.log(sprintf.sprintf("\tCHECK ( CompanyType in (1,2,3) ) -- 1 - Employer, 2 - Financial Planning, 3 - Investment Advice"));
        }

        if ((new RegExp('1 = Lost', 'g')).test(note)) {
            console.log(sprintf.sprintf("  CONSTRAINT [CHK_%s_LostStatusId]", tableName));
            console.log(sprintf.sprintf("\tCHECK ( LostStatusId in (1,2,3,4,5) ) -- 1 = Lost, 2 = Inactive, 3 = Transferred, 4 = Found, 5 = Error"));
        }

        if ((new RegExp('3 = Income Protection', 'g')).test(note)) {
            console.log(sprintf.sprintf("  CONSTRAINT [CHK_%s_InsuranceCoverTypeId]", tableName));
            console.log(sprintf.sprintf("\tCHECK ( InsuranceCoverTypeId in (3,7,8,9,10) ) -- 3 = Income Protection, 8 = Basic Death/TI, 10 = Basic TPD, 9 = Vol Death/TI, 7 = Vol TPD"));
        }

        if ((new RegExp('Full-Time', 'g')).test(note) && (new RegExp('Part-Time', 'g')).test(note)) {
            console.log(sprintf.sprintf("  CONSTRAINT [CHK_%s_EmploymentTypeId]", tableName));
            console.log(sprintf.sprintf("\tCHECK ( EmploymentTypeId in (1,2,3,8) ) -- 1 Full-Time, 2	Part-Time, 3 Casual, 8 Self employed"));
        }

        if ((new RegExp('Death', 'g')).test(note) && (new RegExp('Dismissal', 'g')).test(note)) {
            console.log(sprintf.sprintf("  CONSTRAINT [CHK_%s_EmploymentTerminationTypeId]", tableName));
            console.log(sprintf.sprintf("\tCHECK ( EmploymentTerminationTypeId in (1,2,3,4,6,7,8,9,10,11,13,14) ) -- See documents"));
        }

        if ((new RegExp('Residential', 'g')).test(note) && (new RegExp('Office', 'g')).test(note)) {
            console.log(sprintf.sprintf("  CONSTRAINT [CHK_%s_AddressTypeId]", tableName));
            console.log(sprintf.sprintf("\tCHECK ( AddressTypeId in (1,2,3) ) -- 1. Residential (Person only), 2. Office (Company only), 3. Postal"));
        }

        if ((new RegExp('Commence Leave', 'g')).test(note) && (new RegExp('End Leave', 'g')).test(note)) {
            console.log(sprintf.sprintf("  CONSTRAINT [CHK_%s_ServiceEventReasonId]", tableName));
            console.log(sprintf.sprintf("\tCHECK ( ServiceEventReasonId in (1,2,3,4,5,6,7) ) -- See Document"));
        }

        if ((new RegExp('SuperAccountExtract', 'g')).test(tableName) && (new RegExp('Only 1', 'g')).test(note)) {
            console.log(sprintf.sprintf("  CONSTRAINT [CHK_%s_AccountTypeId]", tableName));
            console.log(sprintf.sprintf("\tCHECK ( AccountTypeId in (1) ) --Only 1"));
        }

        if ((new RegExp('PensionAccountExtract', 'g')).test(tableName) && (new RegExp('ABP', 'g')).test(note)) {
            console.log(sprintf.sprintf("  CONSTRAINT [CHK_%s_AccountTypeId]", tableName));
            console.log(sprintf.sprintf("\tCHECK ( AccountTypeId in (2,4,7) ) --2 = ABP Pension, 4 - TRP/TTR/NCAP, 7 = TAP"));
        }

        if ((new RegExp('PensionAccountExtract', 'g')).test(tableName) && (new RegExp('weekly', 'g')).test(note)) {
            console.log(sprintf.sprintf("  CONSTRAINT [CHK_%s_DrawdownFrequency]", tableName));
            console.log(sprintf.sprintf("\tCHECK ( DrawdownFrequency in (4,5,7,8,9,10,11) ) --4 = weekly, 5 = fortnightly, 7 = monthly, 8 = bi-monthly, 9 = quarterly, 10 = bi-anually, 11 = annually"));
        }
        
    },

    GenPK(tableName) {
        console.log(sprintf.sprintf("  CONSTRAINT [PK_%s]", tableName));
        console.log(sprintf.sprintf("\tPRIMARY KEY CLUSTERED ( %s ASC )", pkArray.join(", ")));
    },

    GenIndex_1(tableName) {
        console.log(sprintf.sprintf("CREATE INDEX %s_index_1", tableName));
        console.log(sprintf.sprintf("\tON %s ( %s )", tableName, index_1_Array.join(", ")));
        console.log(sprintf.sprintf("go"));
    },

    GenIndex_2(tableName) {
        console.log(sprintf.sprintf("CREATE INDEX %s_index_1", tableName));
        console.log(sprintf.sprintf("\tON %s ( %s )", tableName, index_2_Array.join(", ")));
        console.log(sprintf.sprintf("go"));
    }
}


let rowDelimiter = Math.random().toString(26).slice(2);
let colDelimiter = Math.random().toString(26).slice(2);
let XLSX = require('xlsx')
let workbook = XLSX.readFile('../EntityTest02.xlsx');
let sheet_name_list = workbook.SheetNames;
const xlData = XLSX.utils.sheet_to_csv(workbook.Sheets[sheet_name_list[0]], { FS: colDelimiter, RS: rowDelimiter });

xlData.split(rowDelimiter).map((li) => {
    let aStr = li.split(colDelimiter); 
    return {name : aStr[0]
        , dataType : aStr[1]
        , nullable: aStr[2]
        , defaultValue:aStr[3]
        , notes:aStr[4]} 
}).forEach( (line) => {
     //console.log("----", line);

    if (line.dataType == "DataType" || line.dataType == "Data Type") {
        tableName = line.name.replace("Table", "").replace(/"/g, '').replace(/table/gi, "").trim();
        console.log(sprintf.sprintf("IF Object_id('[dbo].%s', 'U') IS NOT NULL ", tableName));
        console.log(sprintf.sprintf("\tDROP TABLE [dbo].%s", tableName));
        console.log(sprintf.sprintf("go"));
        console.log('Create Table ', tableName, ' (');
        isNewTable = true;
        isEndOfTable = false;
        pkArray = [];
        index_1_Array = [];
        index_2_Array = [];
    }
    else if (line.dataType == undefined || line.dataType == "" ) {
        if (!isEndOfTable) {
            if (pkArray.length > 0) templateObj.GenPK(tableName);
            console.log(')\rgo');
            
            if (index_1_Array.length > 0) templateObj.GenIndex_1(tableName);
            if (index_2_Array.length > 0) templateObj.GenIndex_2(tableName);
            console.log('');
            isEndOfTable = true;
        }
    }
    else {
        var defaultVal = (line.defaultValue == undefined || line.defaultValue == "") 
                        ? "" : sprintf.sprintf("\tdefault %s", line.defaultValue.replace(/"/g, ''));
        var dataType = line.dataType.replace(/"/g, '');
        var colName = line.name.replace(/"/g, '');
        console.log(sprintf.sprintf("%1s %-36s %-20s %s%s",
            (isNewTable) ? " " : ",", colName, dataType, (line.nullable == "Y") ? "" : "Not Null", defaultVal));
        templateObj.GenColCheck(tableName, line.notes);
        isNewTable = false;
        const keyString = (line.nullable == "Y") ? [] : line.nullable.replace(/"/g, '').split(",");

        if (keyString.includes("PK")) pkArray.push(line.name);
        if (keyString.includes("Index_1")) index_1_Array.push(line.name);
        if (keyString.includes("Index_2")) index_2_Array.push(line.name);
    }
}
);

