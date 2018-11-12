
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

let rowDelimiter = Math.random().toString(26).slice(2);
let XLSX = require('xlsx')
let workbook = XLSX.readFile('../EntityTest.xlsx');
let sheet_name_list = workbook.SheetNames;
const xlData = XLSX.utils.sheet_to_csv(workbook.Sheets[sheet_name_list[0]], { FS: "\t", RS: rowDelimiter });

xlData.split(rowDelimiter).map((li) => {
    let aStr = li.split('\t'); 
    return {name : aStr[0], dataType : aStr[1]} 
}).forEach( (line) => {
    var arr = line.split("\t");

    if (arr[1] == "DataType" || arr[1] == "Data Type") {
        tableName = arr[0].replace("Table", "").replace("table", "").trim();
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
    else if (arr[1] == undefined || arr[1] == "" ) {
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
        var defaultValue = (arr[3] == undefined || arr[3] == "") ? "" : sprintf.sprintf("\tdefault %s", arr[3]);
        var dataType = arr[1].replace(/"/g, '');
        console.log(sprintf.sprintf("%1s %-36s %-20s %s%s",
            (isNewTable) ? " " : ",", arr[0], dataType, (arr[2] == "Y") ? "" : "Not Null", defaultValue));
        templateObj.GenColCheck(tableName, arr[4]);
        isNewTable = false;
        const keyString = (arr[2] == "Y") ? [] : arr[2].replace(/"/g, '').split(",");

        if (keyString.includes("PK")) pkArray.push(arr[0]);
        if (keyString.includes("Index_1")) index_1_Array.push(arr[0]);
        if (keyString.includes("Index_2")) index_2_Array.push(arr[0]);
    }
}
);

// lineReader.on('line', function (line) {
//     var arr = line.split("\t");

//     if (arr[1] == "DataType" || arr[1] == "Data Type") {
//         tableName = arr[0].replace("Table", "").replace("table", "").trim();
//         console.log(sprintf.sprintf("IF Object_id('[dbo].%s', 'U') IS NOT NULL ", tableName));
//         console.log(sprintf.sprintf("\tDROP TABLE [dbo].%s", tableName));
//         console.log(sprintf.sprintf("go"));
//         console.log('Create Table ', tableName, ' (');
//         isNewTable = true;
//         isEndOfTable = false;
//         pkArray = [];
//         index_1_Array = [];
//         index_2_Array = [];
//     }
//     else if (arr[1] == undefined || arr[1] == "" ) {
//         if (!isEndOfTable) {
//             if (pkArray.length > 0) templateObj.GenPK(tableName);
//             console.log(')\rgo');
            
//             if (index_1_Array.length > 0) templateObj.GenIndex_1(tableName);
//             if (index_2_Array.length > 0) templateObj.GenIndex_2(tableName);
//             console.log('');
//             isEndOfTable = true;
//         }
//     }
//     else {
//         var defaultValue = (arr[3] == undefined || arr[3] == "") ? "" : sprintf.sprintf("\tdefault %s", arr[3]);
//         var dataType = arr[1].replace(/"/g, '');
//         console.log(sprintf.sprintf("%1s %-36s %-20s %s%s",
//             (isNewTable) ? " " : ",", arr[0], dataType, (arr[2] == "Y") ? "" : "Not Null", defaultValue));
//         templateObj.GenColCheck(tableName, arr[4]);
//         isNewTable = false;
//         const keyString = (arr[2] == "Y") ? [] : arr[2].replace(/"/g, '').split(",");

//         if (keyString.includes("PK")) pkArray.push(arr[0]);
//         if (keyString.includes("Index_1")) index_1_Array.push(arr[0]);
//         if (keyString.includes("Index_2")) index_2_Array.push(arr[0]);
//     }
// });

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

        if ((new RegExp('1 = Stop Payment ', 'g')).test(note)) {
            console.log(sprintf.sprintf("  CONSTRAINT [CHK_%s_Flags]", tableName));
            console.log(sprintf.sprintf("\tCHECK ( Flags in (1,2,4,8,16,32,33) ) -- 1 = Stop Payment, 2 = Stop Document, 4 = Reversionary, 8 = Account Closure In Progress, 16 = Admin Fee Suspended, 32 = Stop Transaction only,33 = Stop Payment & Stop Transaction"));
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


