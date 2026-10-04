using System.Buffers.Binary;
namespace BaseHmiTypes.Tests;
internal static class MetafilePolyDrawFixtures
{
    internal static byte[] PolyDraw(uint type,byte[]? types=null,int[]? coordinates=null)
    {
        types ??= new byte[]{6,2,4,4,5};coordinates ??= new[]{5,30,5,10,5,0,35,0,35,30};
        var shortPoints=type==92;var pointBytes=coordinates.Length*(shortPoints?2:4);
        var bytes=new byte[(28+pointBytes+types.Length+3)&~3];
        BinaryPrimitives.WriteUInt32LittleEndian(bytes,type);BinaryPrimitives.WriteUInt32LittleEndian(bytes.AsSpan(4),(uint)bytes.Length);
        BinaryPrimitives.WriteUInt32LittleEndian(bytes.AsSpan(24),(uint)(coordinates.Length/2));
        for(var i=0;i<coordinates.Length;i++)if(shortPoints)BinaryPrimitives.WriteInt16LittleEndian(bytes.AsSpan(28+i*2),(short)coordinates[i]);else BinaryPrimitives.WriteInt32LittleEndian(bytes.AsSpan(28+i*4),coordinates[i]);
        types.CopyTo(bytes,28+pointBytes);return bytes;
    }
    internal const string MixedPath="M 5 30 L 5 10 C 5 0 35 0 35 30 Z";
}
