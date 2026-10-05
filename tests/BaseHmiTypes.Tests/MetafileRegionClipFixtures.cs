using System.Buffers.Binary;
using static BaseHmiTypes.Tests.MetafilePointArrayFixtures;
namespace BaseHmiTypes.Tests;
internal static class MetafileRegionClipFixtures
{
    internal static byte[] Region(int mode=5,int[][]? rects=null)
    {
        rects ??=new[]{new[]{5,6,35,36}};var values=new List<int>{32+rects.Length*16,mode,32,1,rects.Length,rects.Length*16,0,0,39,39};foreach(var r in rects)values.AddRange(r);return Record(75,values.ToArray());
    }
    internal static byte[] Change(byte[] record,int offset,int value){var copy=record.ToArray();BinaryPrimitives.WriteInt32LittleEndian(copy.AsSpan(offset),value);return copy;}
}
