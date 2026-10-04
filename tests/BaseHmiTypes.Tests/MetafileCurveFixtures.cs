using System.Buffers.Binary;
namespace BaseHmiTypes.Tests;
internal static class MetafileCurveFixtures
{
    internal static bool Line(uint type)=>type==6||type==89;
    internal static bool To(uint type)=>Line(type)||type==5||type==88;
    internal static byte[] Curve(uint type,int[]? coordinates=null)
    {
        var shortPoints=type>=85;
        coordinates ??= Line(type)?new[]{15,10,35,30}:To(type)?new[]{5,0,35,0,35,30}:new[]{5,30,5,0,35,0,35,30};
        var bytes=new byte[28+coordinates.Length*(shortPoints?2:4)];
        BinaryPrimitives.WriteUInt32LittleEndian(bytes,type);BinaryPrimitives.WriteUInt32LittleEndian(bytes.AsSpan(4),(uint)bytes.Length);
        BinaryPrimitives.WriteUInt32LittleEndian(bytes.AsSpan(24),(uint)(coordinates.Length/2));
        for(var i=0;i<coordinates.Length;i++)
            if(shortPoints)BinaryPrimitives.WriteInt16LittleEndian(bytes.AsSpan(28+i*2),(short)coordinates[i]);
            else BinaryPrimitives.WriteInt32LittleEndian(bytes.AsSpan(28+i*4),coordinates[i]);
        return bytes;
    }
    internal static string Path(uint type)=>Line(type)?"M 5 30 L 15 10 L 35 30":"M 5 30 C 5 0 35 0 35 30";
}
