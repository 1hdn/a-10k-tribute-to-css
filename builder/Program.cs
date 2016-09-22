using Microsoft.Ajax.Utilities;
using System;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;

namespace Builder
{
    class Program
    {
        static void Main(string[] args)
        {
            if (args.Length < 2)
            {
                Console.WriteLine("Expected two parameters:");
                Console.WriteLine("1) The path to the directory containing the workfiles.");
                Console.WriteLine("2) The path to write the selfcontained output file to.");
                return;
            }

            string sourceDirectory = args[0];
            string outputFile = args[1];
            string cssControls = Path.Combine(sourceDirectory, "controls.css");
            string jsControls = Path.Combine(sourceDirectory, "controls.js");
            string cssDefault = Path.Combine(sourceDirectory, "default.css");
            string htmlDefault = Path.Combine(sourceDirectory, "default.html");

            Func<string, bool> FileExists = file =>
            {
                if (File.Exists(file))
                {
                    return true;
                }
                else
                {
                    Console.WriteLine("The file {0} was not found.", file);
                    return false;
                }
            };

            if (!FileExists(htmlDefault) || !FileExists(cssDefault) || !FileExists(jsControls) || !FileExists(cssControls))
            {
                return;
            }

            Minifier minifier = new Minifier();
            string minifiedCssControls = minifier.MinifyStyleSheet(File.ReadAllText(cssControls));
            string minifiedJsControls = minifier.MinifyJavaScript(File.ReadAllText(jsControls).Replace("/*builder:controls.css*/", minifiedCssControls));
            string minifiedCssDefault = minifier.MinifyStyleSheet(File.ReadAllText(cssDefault));

            StringBuilder minifiedHtml = new StringBuilder();
            using (StreamReader reader = new StreamReader(htmlDefault))
            {
                string line;
                while ((line = reader.ReadLine()) != null)
                {
                    minifiedHtml.Append(line.Trim());
                }
            }

            string output = minifiedHtml.ToString().Replace("/*builder:default.css*/", minifiedCssDefault).Replace("/*builder:controls.js*/", minifiedJsControls);

            File.WriteAllText(outputFile, output);
            Console.WriteLine("File created");

            int diff = (10 * 1024) - output.Length;
            if (diff >= 0)
            {
                Console.WriteLine("Content was {0} bytes. Got {1} bytes left to play with...", output.Length, diff);
            }
            else if (diff < 0)
            {
                Console.WriteLine("Content is {0} bytes. Must find {1} bytes to ditch...", output.Length, Math.Abs(diff));
            }
        }
    }
}