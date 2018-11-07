
//Usage: cat './crtblTest02.txt' |  node GenCrtbl.js > output.sql

const sprintf = require("sprintf-js");
const lineReader = require('readline').createInterface({
    // input: require('fs').createReadStream('./crtblTest02.txt', {autoClose: true })
    input: process.stdin
});

var isNewTable = true;
var isEndOfTable = false;
var tableName="";
var pkArray = [];

lineReader.on('line', function (line) {
    var arr = line.split("\t");

    if (arr[1] == "DataType") {
        tableName = arr[0].replace("Table", "").replace("table","").trim();
        console.log(sprintf.sprintf("IF Object_id('[dbo].%s', 'U') IS NOT NULL ", tableName)); 
        console.log(sprintf.sprintf("\tDROP TABLE [dbo].%s", tableName));
        console.log(sprintf.sprintf("go"));	
        console.log('Create Table ', tableName, ' (');
        isNewTable = true;
        isEndOfTable = false;
        pkArray = [];
    }
    else if (arr[1] == undefined || arr[1]=="") {
        if(!isEndOfTable)
        {
            if(pkArray.length > 0)
            {
                console.log(sprintf.sprintf("  CONSTRAINT [PK_%s]", tableName)); 
                console.log(sprintf.sprintf("\tPRIMARY KEY CLUSTERED ( %s ASC )", pkArray.join(", ")));	
            }
            console.log(')\rgo\n');
            isEndOfTable = true;
        }
    }
    else {
        var defaultValue = ( arr[3] == undefined || arr[3]=="")?"":sprintf.sprintf("\tdefault %s",arr[3]);
        console.log(sprintf.sprintf("%1s %-36s %-20s %s%s", (isNewTable)?" ":",", arr[0] ,arr[1], (arr[2]=="Y")?"":"Not Null", defaultValue));
        templateObj.GenColCheck(tableName, arr[4]);
        isNewTable = false;
        if(arr[2]=="PK")
            pkArray.push(arr[0]);
    }
});

const templateObj = {
    GenColCheck(tableName, note) {
        if((new RegExp('1 = Phone','g')).test(note))
        {
            console.log(sprintf.sprintf("  CONSTRAINT [CHK_%s_ContactMethodTypeId]", tableName)); 
            console.log(sprintf.sprintf("\tCHECK ( ContactMethodTypeId in (1,2,3) ) -- 1 = Phone, 2 = Email, 3 = Post"));	
        }

        if((new RegExp('4 = Financial Adviser','g')).test(note))
        {
            console.log(sprintf.sprintf("  CONSTRAINT [CHK_%s_AssociationType]", tableName)); 
            console.log(sprintf.sprintf("\tCHECK ( AssociationType in (4,7,8) ) -- 4 = Financial Adviser, 7 = Primary Contact, 8 = Secondary Contact"));	
        }

        if((new RegExp('1 - Employer','g')).test(note))
        {
            console.log(sprintf.sprintf("  CONSTRAINT [CHK_%s_CompanyType]", tableName)); 
            console.log(sprintf.sprintf("\tCHECK ( CompanyType in (1,2,3) ) -- 1 - Employer, 2 - Financial Planning, 3 - Investment Advice"));	
        }

        if((new RegExp('1 = Lost','g') ).test(note))
        {
            console.log(sprintf.sprintf("  CONSTRAINT [CHK_%s_LostStatusId]", tableName)); 
            console.log(sprintf.sprintf("\tCHECK ( LostStatusId in (1,2,3,4,5) ) -- 1 = Lost, 2 = Inactive, 3 = Transferred, 4 = Found, 5 = Error"));	
        }
    }
}


