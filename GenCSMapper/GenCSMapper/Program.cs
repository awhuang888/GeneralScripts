
    using System;
    using System.Linq;
    
namespace GenCSMapper
{
    class Program
    {
        static void Main(string[] args)
        {
            var nameListTwo = typeof(CreateSignificantEvent).GetProperties().Select(p => p.Name).ToList();
            var nameListOne = typeof(SignificantLifeEventExtract).GetProperties().Select(p => p.Name).ToList();

            Console.WriteLine($"\tpublic static ApiModel.CreateSignificantEvent ToApiModel(this SignificantLifeEventExtract model)");
            Console.WriteLine("\t{");
            Console.WriteLine($"\t\treturn new ApiModel.CreateSignificantEvent");
            Console.WriteLine("\t\t{");

            int i = 0;
            foreach (var matchField in nameListTwo)
            {
                var comma = (++i == nameListTwo.Count) ? "" : ",";
                if (nameListOne.Contains(matchField))
                    Console.WriteLine($"\t\t\t{matchField}\t\t\t=\tmodel.{matchField}{comma}");
                else
                    Console.WriteLine($"\t\t\t{matchField}\t\t\t=\tUnKnown{comma}");                    
            }

            Console.WriteLine("\t\t};");
            Console.WriteLine("\t}");

            Console.WriteLine("\n\n");

            Console.WriteLine($"\tpublic static MineExtractModel.SignificantLifeEventExtract ToMineExtractModel(this CreateSignificantEvent model)");
            Console.WriteLine("\t{");
            Console.WriteLine($"\t\treturn new MineExtractModel.SignificantLifeEventExtract");
            Console.WriteLine("\t\t{");

            i = 0;
            foreach (var matchField in nameListOne)
            {
                var comma = (++i == nameListOne.Count) ? "" : ",";
                if (nameListOne.Contains(matchField))
                    Console.WriteLine($"\t\t\t{matchField}\t\t\t=\tmodel.{matchField}{comma}");
                else
                    Console.WriteLine($"\t\t\t{matchField}\t\t\t=\tUnKnown{comma}");  

            }

            Console.WriteLine("\t\t};");
            Console.WriteLine("\t}");
        }
    }
}
    