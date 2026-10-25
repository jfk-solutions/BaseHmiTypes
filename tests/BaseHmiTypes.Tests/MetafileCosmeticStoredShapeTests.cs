using System.Security.Cryptography;
using System.Buffers.Binary;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Xml.Linq;
using BaseHmiTypes.Images.Converters;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using static BaseHmiTypes.Tests.MetafilePointArrayFixtures;

namespace BaseHmiTypes.Tests;

[TestClass]
public class MetafileCosmeticStoredShapeTests
{
    public static IEnumerable<object[]> Fixtures()
    {
        foreach(var name in new[]{"cosmetic-stored-shapes","cosmetic-micro-lines"})
        {
            using var stream=typeof(MetafileCosmeticStoredShapeTests).Assembly.GetManifestResourceStream($"BaseHmiTypes.Tests.Fixtures.{name}.json")!;
            using var doc=JsonDocument.Parse(stream);
            foreach(var f in doc.RootElement.EnumerateArray())yield return new object[]{name,f.GetProperty("Index").GetInt32(),f.GetProperty("Source").GetString()!,f.GetProperty("Hash").GetString()!};
        }
    }

    [TestMethod] [DynamicData(nameof(Fixtures))]
    public void MatchesNativePixelAndDashPhase(string family,int index,string source,string hash)
    {
        var svg=XDocument.Parse(new MetafileToSvgRenderer().Render(Convert.FromBase64String(source.Split(',')[1]),".emf")!);
        var mask=new byte[6400];
        foreach(var path in svg.Descendants().Where(e=>e.Name.LocalName=="path"&&e.Attribute("fill")?.Value is "#123456" or "#ff0000"))
            foreach(Match p in Regex.Matches(path.Attribute("d")!.Value,@"M (-?\d+) (-?\d+)h1v1h-1Z"))
            {
                var x=int.Parse(p.Groups[1].Value);var y=int.Parse(p.Groups[2].Value);
                if(x>=0&&x<80&&y>=0&&y<80)mask[y*80+x]=path.Attribute("fill")!.Value=="#123456"?(byte)1:(byte)2;
            }
        Assert.AreEqual(hash,Convert.ToHexString(SHA256.HashData(mask)).ToLowerInvariant(),$"Native {family} {index}");
    }

    [TestMethod] [DataRow(0)] [DataRow(1)] [DataRow(2)] [DataRow(900)] [DataRow(901)] [DataRow(902)]
    public void LatePenMetadataSurvivesSavedDc(int index)
    {
        var f=Fixtures().First(f=>(string)f[0]=="cosmetic-stored-shapes"&&(int)f[1]==index);
        var bytes=Convert.FromBase64String(((string)f[2]).Split(',')[1]);var records=new List<byte[]>();
        for(var at=88;at<bytes.Length;)
        {
            var type=BinaryPrimitives.ReadUInt32LittleEndian(bytes.AsSpan(at));var size=BinaryPrimitives.ReadInt32LittleEndian(bytes.AsSpan(at+4));if(type==14)break;
            if(type==64)records.AddRange(new[]{Record(33),Record(35,0x40000000,0,0,0x40000000,0,0),Record(34,-1)});
            records.Add(bytes.AsSpan(at,size).ToArray());at+=size;
        }
        var emf=Emf(records.ToArray());
        MatchesNativePixelAndDashPhase((string)f[0],index,"data:image/emf;base64,"+Convert.ToBase64String(emf),(string)f[3]);
    }
}
