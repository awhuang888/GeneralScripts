var sprintf = require("sprintf-js");
var lineReader = require('readline').createInterface({
    input: require('fs').createReadStream('c:/temp/crtblTest02.txt', { autoClose: true })
});
var isNewTable = true;
var isEndOfTable = false;

lineReader.on('line', function (line) {
    var arr = line.split("\t");

    if (arr[1] == "DataType") {
        console.log('Create Table ', arr[0], ' (');
        isNewTable = true;
        isEndOfTable = false;
    }
    else if (arr[1] == undefined) {
        if(!isEndOfTable)
        {
            console.log(')\n', 'go\n');
            isEndOfTable = true;
        }
    }
    else {
        console.log(sprintf.sprintf("%1s %-36s %-20s %s", (isNewTable)?" ":",", arr[0] ,arr[1], ((arr[2]=="Y")?"":"Not Null")));
        isNewTable = false;
    }
});