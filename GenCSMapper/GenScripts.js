const sprintf = require("sprintf-js");
var FileReader = require('filereader')
var fapi = require('file-api');
var File = fapi.File;
const fs = require('fs');

const targetModelFile = 'GenCSMapper/Employee.cs';
const sourceModelFile = 'GenCSMapper/Manager.cs';

main();

async function main() {
    let targetClass = ScrapClass(targetModelFile);
    let sourceClass = ScrapClass(sourceModelFile);    

    console.log(targetClass.className);
    console.log(targetClass.classString);
    console.log(sourceClass.className);
    console.log(sourceClass.classString);

    let programCs = GenProgramCs(sourceClass.className, targetClass.className);
    console.log(programCs);

    let ClassesCs = GenClassesCs(sourceClass.classString, targetClass.classString);
    console.log(ClassesCs);
}

function ScrapClass(model) {
    let scrapStart = false;
    let leftCounter = 0;
    let rightCounter = 0;
    let classString = '';
    let className = '';

    var contents = fs.readFileSync(model, 'utf8');
    console.log(contents);
    const allLines = contents.split(/\r\n|\n/);
    // Reading line by line
    allLines.forEach((line) => {
        let arr = line.split(/\s+/);
        if (arr.includes('class') || scrapStart) {
            if (!scrapStart) {
                scrapStart = true;
                let i = arr.indexOf('class');
                className = arr[i + 1];
                console.log(`Target Class Name: ${className}`);
            }
            leftCounter = leftCounter + (line.match(/{/g) || []).length;
            rightCounter = rightCounter + (line.match(/}/g) || []).length;
            if (rightCounter > leftCounter)
                scrapStart = false;
            else
                classString = classString + line + '\n';
        }

    });
    return {className: className, classString: classString};
};

function GenProgramCs(sourceClassName, targetClassName){
    let template = `
    using System;
    using System.Linq;
    
    namespace GenCSMapper
    {
        class Program
        {
            static void Main(string[] args)
            {
                var targetNames = typeof(@Target@).GetProperties().Select(p => p.Name).ToList();
                var srcNames = typeof(@Source@).GetProperties().Select(p => p.Name).ToList();
                Console.WriteLine($"\\tpublic static DomainModels.@Target@ ToDomainModel(this @Source@ model)");
                Console.WriteLine("\\t{");
                Console.WriteLine($"\\t\\treturn new DomainModels.@Target@");
                Console.WriteLine("\\t\\t{");
    
                int i = 0;
                foreach (var matchField in targetNames)
                {
                    var comma = (++i == targetNames.Count) ? "" : ",";
                    if (srcNames.Contains(matchField))
                        Console.WriteLine($"\\t\\t\\t{matchField}\\t\\t\\t=\\tmodel.{matchField}{comma}");
                }
    
                Console.WriteLine("\\t\\t};");
                Console.WriteLine("\\t}");
            }
        }
    }
    `;

    let output = template.replace(/@Source@/g, sourceClassName).replace(/@Target@/g, targetClassName);
    return output;
}

function GenClassesCs(sourceClassString, targetClassString){
    let template = 
    `
namespace GenCSMapper
{
    @Source@

    @Target@
}
    `;
    let output = template.replace(/@Source@/g, sourceClassString).replace(/@Target@/g, targetClassString);
    return output;
}


