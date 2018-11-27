using System;
using System.Linq;

namespace GenCSMapper
{
    class Program
    {
        static void Main(string[] args)
        {
            var empNames = typeof(Employee).GetProperties().Select(p => p.Name).ToList();
            var mgrNames = typeof(Manager).GetProperties().Select(p => p.Name).ToList();
            Console.WriteLine($"\tpublic static DomainModels.Employee ToDomainModel(this Manager model)\n");
            Console.WriteLine("\t{");
            Console.WriteLine($"\t\treturn new DomainModels.Employee");
            Console.WriteLine("\t\t{");

            int i = 0;
            foreach (var empField in empNames)
            {
                var comma = (++i == empNames.Count) ? "" : ",";
                if (mgrNames.Contains(empField))
                    Console.WriteLine($"\t\t\t{empField}\t\t\t=\tmodel.{empField}{comma}");
            }

            Console.WriteLine("\t\t};");
            Console.WriteLine("\t}");
        }
    }
}
