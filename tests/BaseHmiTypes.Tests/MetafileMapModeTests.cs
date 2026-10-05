using System.Buffers.Binary;
using System.Xml.Linq;
using BaseHmiTypes.Images.Converters;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using static BaseHmiTypes.Tests.MetafilePointArrayFixtures;

namespace BaseHmiTypes.Tests;

[TestClass]
public class MetafileMapModeTests
{
    private static readonly int[][] Modes = { new[]{1,1,1,1},new[]{3400,2100,1728,-1084},new[]{34000,21000,1728,-1084},new[]{1339,827,1728,-1084},new[]{13386,8268,1728,-1084},new[]{19276,11906,1728,-1084},new[]{3400,2100,1728,-1067},new[]{1,1,1,1} };
    private static XElement Svg(params byte[][] records) => Render(true,records);
    private static XElement Render(bool metrics,params byte[][] records) {
        var bytes=Emf(records);if(metrics){foreach(var (at,value) in new[]{(72,1728),(76,1084),(80,340),(84,210)})BinaryPrimitives.WriteInt32LittleEndian(bytes.AsSpan(at),value);}
        return XDocument.Parse(new MetafileToSvgRenderer().Render(bytes,".emf")!).Root!;
    }
    private static void Endpoint(XElement svg,string x,string y) {var line=svg.Elements().Single(e=>e.Name.LocalName=="line");Assert.AreEqual(x,line.Attribute("x2")?.Value);Assert.AreEqual(y,line.Attribute("y2")?.Value);}
    private static byte[][] Mapping(int mode=8,int wx=10,int wy=20,int vx=40,int vy=30)=>new[]{Record(17,mode),Record(9,wx,wy),Record(11,vx,vy)};

    [TestMethod] [DataRow(1)] [DataRow(2)] [DataRow(3)] [DataRow(4)] [DataRow(5)] [DataRow(6)] [DataRow(7)] [DataRow(8)]
    public void AllModesUseNativeReferenceExtents(int mode){var m=Modes[mode-1];Endpoint(Svg(Record(17,mode),Record(54,m[0],m[1])),m[2].ToString(),m[3].ToString());}
    [TestMethod] [DataRow(1)] [DataRow(2)] [DataRow(3)] [DataRow(4)] [DataRow(5)] [DataRow(6)]
    public void FixedModesIgnoreExtentSetters(int mode){var m=Modes[mode-1];Endpoint(Svg(Mapping(mode).Append(Record(54,m[0],m[1])).ToArray()),m[2].ToString(),m[3].ToString());}
    [TestMethod] [DataRow(1,1)] [DataRow(-1,1)] [DataRow(1,-1)] [DataRow(-1,-1)]
    public void AnisotropicPreservesIndependentSignedAxes(int x,int y)=>Endpoint(Svg(Mapping(8,10,20,x*40,y*30).Append(Record(54,10,20)).ToArray()),(x*40).ToString(),(y*30).ToString());
    [TestMethod] [DataRow(1,1)] [DataRow(-1,1)] [DataRow(1,-1)] [DataRow(-1,-1)]
    public void IsotropicAdjustsLargerAxisAndPreservesSigns(int x,int y)=>Endpoint(Svg(Mapping(7,10,20,x*40,y*30).Append(Record(54,10,20)).ToArray()),(x*15).ToString(),(y*30).ToString());
    [TestMethod] public void IsotropicAdjustsOtherAxis()=>Endpoint(Svg(Mapping(7,20,10,30,40).Append(Record(54,20,10)).ToArray()),"30","15");
    [TestMethod] public void IsotropicWindowChangeAdjustsCurrentViewport()=>Endpoint(Svg(Mapping(7).Concat(new[]{Record(9,20,20),Record(54,20,20)}).ToArray()),"15","15");
    [TestMethod] public void RepeatedIsotropicModeDoesNotResetExtents()=>Endpoint(Svg(Mapping(7).Concat(new[]{Record(17,7),Record(54,10,20)}).ToArray()),"15","30");
    [TestMethod] public void IsotropicCanRoundSmallAxisToZero()=>Endpoint(Svg(Mapping(7,1000,1,1,1000).Append(Record(54,1000,1)).ToArray()),"1","0");
    [TestMethod] public void AnisotropicEntryPreservesExistingIsotropicExtents()=>Endpoint(Svg(Mapping(7).Concat(new[]{Record(17,8),Record(54,10,20)}).ToArray()),"15","30");
    [TestMethod] public void IsotropicEntryResetsPriorAnisotropicExtents()=>Endpoint(Svg(Mapping().Concat(new[]{Record(17,7),Record(54,3400,2100)}).ToArray()),"1728","-1067");
    [TestMethod] public void TextModeResetsScaleButPreservesOrigins()=>Endpoint(Svg(Mapping().Concat(new[]{Record(10,3,4),Record(12,5,6),Record(17,1),Record(54,20,40)}).ToArray()),"22","42");
    [TestMethod] [DataRow(1)] [DataRow(2)] [DataRow(3)] [DataRow(4)] [DataRow(5)] [DataRow(6)]
    public void AnisotropicEntryPreservesFixedModeExtents(int mode){var m=Modes[mode-1];Endpoint(Svg(Record(17,mode),Record(17,8),Record(9,10,20),Record(54,10,20)),m[2].ToString(),m[3].ToString());}
    [TestMethod] [DataRow(0)] [DataRow(-1)] [DataRow(9)] [DataRow(int.MinValue)] [DataRow(int.MaxValue)]
    public void InvalidModeRetainsModeAndExtents(int mode)=>Endpoint(Svg(Mapping().Concat(new[]{Record(17,mode),Record(11,80,60),Record(54,10,20)}).ToArray()),"80","60");
    [TestMethod] [DataRow(9,0,30)] [DataRow(9,40,0)] [DataRow(9,0,0)] [DataRow(11,0,30)] [DataRow(11,40,0)] [DataRow(11,0,0)]
    public void ZeroAxisRejectsExtentUpdateAtomically(int type,int x,int y)=>Endpoint(Svg(Mapping().Concat(new[]{Record((uint)type,x,y),Record(54,10,20)}).ToArray()),"40","30");
    [TestMethod] [DataRow(9,0)] [DataRow(9,1)] [DataRow(10,0)] [DataRow(10,1)] [DataRow(11,0)] [DataRow(11,1)] [DataRow(12,0)] [DataRow(12,1)]
    public void TruncatedSetterDoesNotReadNextRecord(int type,int count)=>Endpoint(Svg(Mapping().Concat(new[]{Record((uint)type,Enumerable.Repeat(99,count).ToArray()),Record(54,10,20)}).ToArray()),"40","30");
    [TestMethod] public void TruncatedModeDoesNotReadNextRecord()=>Endpoint(Svg(Mapping().Concat(new[]{Record(17),Record(11,80,60),Record(54,10,20)}).ToArray()),"80","60");
    [TestMethod] [DataRow(1)] [DataRow(7)] [DataRow(8)]
    public void SaveRestoreRetainsModeAndExtents(int mode){var expected=mode==1?new[]{10,20}:mode==7?new[]{15,30}:new[]{40,30};Endpoint(Svg(Mapping(mode).Concat(new[]{Record(33),Record(17,1),Record(34,-1),Record(11,40,30),Record(54,10,20)}).ToArray()),expected[0].ToString(),expected[1].ToString());}
    [TestMethod] public void MissingPhysicalMetricsUseDeterministic96Dpi()=>Endpoint(Render(false,Record(17,2),Record(54,2540,2540)),"960","-960");
    [TestMethod] public void DefaultTextModeIgnoresExtents()=>Endpoint(Svg(Record(9,10,20),Record(11,40,30),Record(54,10,20)),"10","20");
}
