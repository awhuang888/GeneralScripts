const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const targetModelFile = 'template/Employee.cs';
const sourceModelFile = 'template/Manager.cs';

var argv = require('minimist')(process.argv.slice(2));
const mapClasses = `${argv['m']}`;
const modelList = yaml.safeLoad(fs.readFileSync('model-list.yml', 'utf8'));
console.log(modelList);
main(mapClasses);

async function main(argString) {
    const classes = argString.split(/\s+/g);
    console.log('classes:',  classes);   
    const modelOne = classes[0].split('.')[0];
    const classOne = classes[0].split('.')[1];
    const modelTwo = classes[1].split('.')[0];
    const classTwo = classes[1].split('.')[1];
    if (!modelList[modelOne].ClassFiles.includes(classOne))
    {
        console.log(`The class ${classOne} not in model ${modelOne}`);
        return;
    }
    else if (!modelList[modelTwo].ClassFiles.includes(classTwo))
    {
        console.log(`The class ${classTwo} not in model ${modelTwo}`);
        return;
    }

    const classFileOne = path.join(modelList[modelOne].Path, `${classOne}.cs`);
    const modelOneGenName = modelList[modelOne].GenModelName;
    const classFileTwo = path.join(modelList[modelTwo].Path, `${classTwo}.cs`);
    const modelTwoGenName = modelList[modelTwo].GenModelName;
    // console.log(classes);
    // console.log(classFileOne, modelOneGenName);
    //return ;

    let genClassOne = ScrapClass(classFileOne);
    let genClassTwo = ScrapClass(classFileTwo);    

    // let programCs = GenProgramCs(sourceClass.className, "DomainModel", targetClass.className, "ApiModel");
    let programCs = GenProgramCs(genClassOne.className, modelOneGenName, genClassTwo.className, modelTwoGenName); 
    fs.writeFile('GenCSMapper/Program.cs', programCs, e=>{if(e){return console.log(e);}});
    console.log(programCs);

    let ClassesCs = GenClassesCs(genClassOne.classString, genClassTwo.classString);
    fs.writeFile('GenCSMapper/Classes.cs', ClassesCs, e=>{if(e){return console.log(e);}});
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

function GenProgramCs(classNameOne, modelOne, classNameTwo, modelTwo){
    return `
    using System;
    using System.Linq;
    
namespace GenCSMapper
{
    class Program
    {
        static void Main(string[] args)
        {
            var nameListTwo = typeof(${classNameTwo}).GetProperties().Select(p => p.Name).ToList();
            var nameListOne = typeof(${classNameOne}).GetProperties().Select(p => p.Name).ToList();

            Console.WriteLine($"\\tpublic static ${modelTwo}.${classNameTwo} To${modelTwo}(this ${classNameOne} model)");
            Console.WriteLine("\\t{");
            Console.WriteLine($"\\t\\treturn new ${modelTwo}.${classNameTwo}");
            Console.WriteLine("\\t\\t{");

            int i = 0;
            foreach (var matchField in nameListTwo)
            {
                var comma = (++i == nameListTwo.Count) ? "" : ",";
                if (nameListOne.Contains(matchField))
                    Console.WriteLine($"\\t\\t\\t{matchField}\\t\\t\\t=\\tmodel.{matchField}{comma}");
                else
                    Console.WriteLine($"\\t\\t\\t{matchField}\\t\\t\\t=\\tUnKnown{comma}");                    
            }

            Console.WriteLine("\\t\\t};");
            Console.WriteLine("\\t}");

            Console.WriteLine("\\n\\n");

            Console.WriteLine($"\\tpublic static ${modelOne}.${classNameOne} To${modelOne}(this ${classNameTwo} model)");
            Console.WriteLine("\\t{");
            Console.WriteLine($"\\t\\treturn new ${modelOne}.${classNameOne}");
            Console.WriteLine("\\t\\t{");

            i = 0;
            foreach (var matchField in nameListOne)
            {
                var comma = (++i == nameListOne.Count) ? "" : ",";
                if (nameListOne.Contains(matchField))
                    Console.WriteLine($"\\t\\t\\t{matchField}\\t\\t\\t=\\tmodel.{matchField}{comma}");
                else
                    Console.WriteLine($"\\t\\t\\t{matchField}\\t\\t\\t=\\tUnKnown{comma}");  

            }

            Console.WriteLine("\\t\\t};");
            Console.WriteLine("\\t}");
        }
    }
}
    `;
}

function GenClassesCs(classOneString, classTwoString){
    return `
    namespace GenCSMapper
{
    ${classOneString}

    ${classTwoString}
}
    `;
}


