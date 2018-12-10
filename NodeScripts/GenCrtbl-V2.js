
//Usage: node GenCrtbl-V2.js > output.sql

const sprintf = require("sprintf-js");

var isNewTable = true;
var isEndOfTable = false;
var tableName = "";
var pkArray = [];
var index_1_Array = [];
var index_2_Array = [];


const templateObj = {
    GenColCheck(tableName, colName, note) {

        if ((new RegExp('SuperAccountExtract', 'g')).test(tableName) && (new RegExp('AccountTypeId', 'g')).test(colName)) {
            console.log(sprintf.sprintf(`CONSTRAINT [CHK_${tableName}_${colName}]`));
            console.log(sprintf.sprintf(`\tCHECK ( ${colName} in (1) ) --Only 1`));
        }

        else if ((new RegExp('PensionAccountExtract', 'g')).test(tableName) && (new RegExp('AccountTypeId', 'g')).test(colName)) {
            console.log(sprintf.sprintf(`CONSTRAINT [CHK_${tableName}_${colName}]`));
            console.log(sprintf.sprintf(`\tCHECK ( ${colName} in (2,4,7) ) --2 = ABP Pension, 4 - TRP/TTR/NCAP, 7 = TAP`));
        }

        else if ((new RegExp('PensionAccountExtract', 'g')).test(tableName) && (new RegExp('DrawdownFrequency', 'g')).test(colName)) {
            console.log(sprintf.sprintf(`CONSTRAINT [CHK_${tableName}_${colName}]`));
            console.log(sprintf.sprintf(`\tCHECK ( ${colName} in (4,5,7,8,9,10,11) ) --4 = weekly, 5 = fortnightly, 7 = monthly, 8 = bi-monthly, 9 = quarterly, 10 = bi-anually, 11 = annually`));
        }

        else if ((new RegExp('PensionAccountExtract', 'g')).test(tableName) && (new RegExp('DrawdownPreference', 'g')).test(colName)) {
            console.log(sprintf.sprintf(`CONSTRAINT [CHK_${tableName}_${colName}]`));
            console.log(sprintf.sprintf(`\tCHECK ( ${colName} in (0,1,2,3,4,5) ) --0 = minimum, 1 = maximum, 2 = annual, 3 = prescribed amount, 4 = regular, 5 = percentage`));
        }

        else if ((new RegExp('PensionAccountExtract', 'g')).test(tableName) && (new RegExp('ApplyTaxOffset', 'g')).test(colName)) {
            console.log(sprintf.sprintf(`CONSTRAINT [CHK_${tableName}_${colName}]`));
            console.log(sprintf.sprintf(`\tCHECK ( ${colName} in (1,2) ) --1 = Default, 2 = Claim Tax Free Threshold`));
        }
        else if ((new RegExp('AssetManagementStrategyExtract', 'g')).test(tableName) && (new RegExp('StrategyTypeId', 'g')).test(colName)) {
            console.log(sprintf.sprintf(`CONSTRAINT [CHK_${tableName}_${colName}]`));
            console.log(sprintf.sprintf(`\tCHECK ( ${colName} in (2,3,5) ) --2 = Deposit, 3 = Withdrawal, 5 = Switch`));
        }
        else if ((new RegExp('AssetManagementStrategyExtract', 'g')).test(tableName) && (new RegExp('InstructionTypeId', 'g')).test(colName)) {
            console.log(sprintf.sprintf(`CONSTRAINT [CHK_${tableName}_${colName}]`));
            console.log(sprintf.sprintf(`\tCHECK ( ${colName} in (1, 3)) --1 = Proportional, 3 = Specific Instruction`));
        }
        else if ((new RegExp('AssetManagementStrategyExtract', 'g')).test(tableName) && (new RegExp('SwitchReasonId', 'g')).test(colName)) {
            console.log(sprintf.sprintf(`CONSTRAINT [CHK_${tableName}_${colName}]`));
            console.log(sprintf.sprintf(`\tCHECK ( ${colName} in (1,2) ) --1 = MemberInstruction, 2 = AgeBasedDefault, 3 = ProductChange, 4 = DrawdownExhausted`));
        }
        else if ((new RegExp('ConditionOfReleaseExtract', 'g')).test(tableName) && (new RegExp('TypeId', 'g')).test(colName)) {
            console.log(sprintf.sprintf(`CONSTRAINT [CHK_${tableName}_${colName}]`));
            console.log(sprintf.sprintf(`\tCHECK ( ${colName} between 1 and 5 ) --1 = Retirement, 2 = CeasedEmploymentAged60AndAbove, 3 = TPD, 4 = TI/Death, 5 = PPD`));
        }
        else if ((new RegExp('DocumentExtract', 'g')).test(tableName) && (new RegExp('Source', 'g')).test(colName)) {
            console.log(sprintf.sprintf(`CONSTRAINT [CHK_${tableName}_${colName}]`));
            console.log(sprintf.sprintf(`\tCHECK ( ${colName} between 1 and 3 ) --1 = Outgoing, 2 = Incoming, 3 = Internal`));
        }
        else if ((new RegExp('DocumentExtract', 'g')).test(tableName) && (new RegExp('VisibilityId', 'g')).test(colName)) {
            console.log(sprintf.sprintf(`CONSTRAINT [CHK_${tableName}_${colName}]`));
            console.log(sprintf.sprintf(`\tCHECK ( ${colName} in (1000, 10000, 10000000) ) --10000000 = Admins only, 10000 = Visible to member, 1000 = Visible to service provider but not member`));
        }
        else if ((new RegExp('DocumentExtract', 'g')).test(tableName) && (new RegExp('StatusId', 'g')).test(colName)) {
            console.log(sprintf.sprintf(`CONSTRAINT [CHK_${tableName}_${colName}]`));
            console.log(sprintf.sprintf(`\tCHECK ( ${colName} in (3,6)) --3 = Complete, 6 = Deleted`));
        }
        else if ((new RegExp('SignificantLifeEventExtract', 'g')).test(tableName) && (new RegExp('SignificantEventTypeId', 'g')).test(colName)) {
            console.log(sprintf.sprintf(`CONSTRAINT [CHK_${tableName}_${colName}]`));
            console.log(sprintf.sprintf(`\tCHECK ( ${colName} between 1 and 10) --See Document`));
        }
        else if ((new RegExp('InsuranceUnderwitingHistoryExtract', 'g')).test(tableName) && (new RegExp('OtherRequestTypeId', 'g')).test(colName)) {
            console.log(sprintf.sprintf(`CONSTRAINT [CHK_${tableName}_${colName}]`));
            console.log(sprintf.sprintf(`\tCHECK ( ${colName} in (1)) --1 = Special offer (double your cover)`));
        }
        else if ((new RegExp('InsuranceUnderwitingHistoryExtract', 'g')).test(tableName) && (new RegExp('StatusId', 'g')).test(colName)) {
            console.log(sprintf.sprintf(`CONSTRAINT [CHK_${tableName}_${colName}]`));
            console.log(sprintf.sprintf(`\tCHECK ( ${colName} in (1,2,3)) --1 = Requested, 2 = Approved, 3 = Declined`));
        }
        else if ((new RegExp('DocumentContentExtract', 'g')).test(tableName) && (new RegExp('ContentTypeId', 'g')).test(colName)) {
            console.log(sprintf.sprintf(`CONSTRAINT [CHK_${tableName}_${colName}]`));
            console.log(sprintf.sprintf(`\tCHECK ( ${colName} between 1 and 13) -- See Document`));
        }

        //Following are apply constraints by matching text in design notes.
        else if ((new RegExp('1 = Phone', 'g')).test(note)) {
            console.log(sprintf.sprintf("  CONSTRAINT [CHK_%s_ContactMethodTypeId]", tableName));
            console.log(sprintf.sprintf("\tCHECK ( ContactMethodTypeId in (1,2,3) ) -- 1 = Phone, 2 = Email, 3 = Post"));
        }

        else if ((new RegExp('4 = Financial Adviser', 'g')).test(note)) {
            console.log(sprintf.sprintf("  CONSTRAINT [CHK_%s_AssociationType]", tableName));
            console.log(sprintf.sprintf("\tCHECK ( AssociationType in (4,7,8) ) -- 4 = Financial Adviser, 7 = Primary Contact, 8 = Secondary Contact"));
        }

        else if ((new RegExp('1 - Employer', 'g')).test(note)) {
            console.log(sprintf.sprintf("  CONSTRAINT [CHK_%s_CompanyType]", tableName));
            console.log(sprintf.sprintf("\tCHECK ( CompanyType in (1,2,3) ) -- 1 - Employer, 2 - Financial Planning, 3 - Investment Advice"));
        }

        else if ((new RegExp('1 = Lost', 'g')).test(note)) {
            console.log(sprintf.sprintf("  CONSTRAINT [CHK_%s_LostStatusId]", tableName));
            console.log(sprintf.sprintf("\tCHECK ( LostStatusId in (1,2,3,4,5) ) -- 1 = Lost, 2 = Inactive, 3 = Transferred, 4 = Found, 5 = Error"));
        }

        else if ((new RegExp('3 = Income Protection', 'g')).test(note)) {
            console.log(sprintf.sprintf("  CONSTRAINT [CHK_%s_InsuranceCoverTypeId]", tableName));
            console.log(sprintf.sprintf("\tCHECK ( InsuranceCoverTypeId in (3,7,8,9,10) ) -- 3 = Income Protection, 8 = Basic Death/TI, 10 = Basic TPD, 9 = Vol Death/TI, 7 = Vol TPD"));
        }

        else if ((new RegExp('Never Been Activated', 'g')).test(note) && (new RegExp('NoContributions', 'g')).test(note)) {
            console.log(sprintf.sprintf("  CONSTRAINT [CHK_%s_InsuranceStatusId]", tableName));
            console.log(sprintf.sprintf("\tCHECK ( InsuranceStatusId in (1,2,3,4,5,6,7,8,9,10,11) ) -- See Document"));
        }

        else if ((new RegExp('Full-Time', 'g')).test(note) && (new RegExp('Part-Time', 'g')).test(note)) {
            console.log(sprintf.sprintf("  CONSTRAINT [CHK_%s_EmploymentTypeId]", tableName));
            console.log(sprintf.sprintf("\tCHECK ( EmploymentTypeId in (1,2,3,8) ) -- 1 Full-Time, 2	Part-Time, 3 Casual, 8 Self employed"));
        }

        else if ((new RegExp('Death', 'g')).test(note) && (new RegExp('Dismissal', 'g')).test(note)) {
            console.log(sprintf.sprintf("  CONSTRAINT [CHK_%s_EmploymentTerminationTypeId]", tableName));
            console.log(sprintf.sprintf("\tCHECK ( EmploymentTerminationTypeId in (1,2,3,4,6,7,8,9,10,11,13,14) ) -- See documents"));
        }

        else if ((new RegExp('Residential', 'g')).test(note) && (new RegExp('Office', 'g')).test(note)) {
            console.log(sprintf.sprintf("  CONSTRAINT [CHK_%s_AddressTypeId]", tableName));
            console.log(sprintf.sprintf("\tCHECK ( AddressTypeId in (1,2,3) ) -- 1. Residential (Person only), 2. Office (Company only), 3. Postal"));
        }

        else if ((new RegExp('Commence Leave', 'g')).test(note) && (new RegExp('End Leave', 'g')).test(note)) {
            console.log(sprintf.sprintf("  CONSTRAINT [CHK_%s_ServiceEventReasonId]", tableName));
            console.log(sprintf.sprintf("\tCHECK ( ServiceEventReasonId in (1,2,3,4,5,6,7) ) -- See Document"));
        }

        else if ((new RegExp('Spouse', 'g')).test(note) && (new RegExp('Executor', 'g')).test(note)) {
            console.log(sprintf.sprintf("  CONSTRAINT [CHK_%s_RelationshipType]", tableName));
            console.log(sprintf.sprintf("\tCHECK ( RelationshipType between 1 and 11 ) -- See Document"));
        }

        else if ((new RegExp('Binding', 'g')).test(note) && (new RegExp('ReversionaryPension', 'g')).test(note)) {
            console.log(sprintf.sprintf("  CONSTRAINT [CHK_%s_NominationType]", tableName));
            console.log(sprintf.sprintf("\tCHECK ( NominationType between 1 and  4) -- 1 Binding,2 NonBinding, 3 ReversionaryPension, 4 Final"));
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
let workbook = XLSX.readFile('../EntityTest07.xlsx');
let sheet_name_list = workbook.SheetNames;
const xlData = XLSX.utils.sheet_to_csv(workbook.Sheets[sheet_name_list[0]], { FS: colDelimiter, RS: rowDelimiter });

xlData.split(rowDelimiter).map((li) => {
    let aStr = li.split(colDelimiter);
    return {
        name: aStr[0]
        , dataType: aStr[1]
        , nullable: aStr[2]
        , defaultValue: aStr[3]
        , notes: aStr[4]
    }
}).forEach((line) => {
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
    else if (line.dataType == undefined || line.dataType == "") {
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
        templateObj.GenColCheck(tableName, colName, line.notes);
        isNewTable = false;
        const keyString = (line.nullable == "Y") ? [] : line.nullable.replace(/"/g, '').split(",");

        if (keyString.includes("PK")) pkArray.push(line.name);
        if (keyString.includes("Index_1")) index_1_Array.push(line.name);
        if (keyString.includes("Index_2")) index_2_Array.push(line.name);
    }
}
);

