using System.Buffers.Binary;
namespace BaseHmiTypes.Tests;
internal static class MetafileRoundRectFixtures
{
    internal static byte[] Round(int width=10,int height=20)=>MetafilePointArrayFixtures.Record(44,5,5,35,35,width,height);
    internal static byte[] WmfRecord(ushort type,params short[] values)
    {
        var bytes=new byte[6+2*values.Length];BinaryPrimitives.WriteUInt32LittleEndian(bytes,(uint)bytes.Length/2);BinaryPrimitives.WriteUInt16LittleEndian(bytes.AsSpan(4),type);
        for(var i=0;i<values.Length;i++)BinaryPrimitives.WriteInt16LittleEndian(bytes.AsSpan(6+i*2),values[i]);return bytes;
    }
    internal static byte[] Wmf(params byte[][] records)
    {
        var bytes=new byte[18+records.Sum(r=>r.Length)+6];BinaryPrimitives.WriteUInt16LittleEndian(bytes,1);BinaryPrimitives.WriteUInt16LittleEndian(bytes.AsSpan(2),9);BinaryPrimitives.WriteUInt16LittleEndian(bytes.AsSpan(4),0x300);BinaryPrimitives.WriteUInt32LittleEndian(bytes.AsSpan(6),(uint)bytes.Length/2);BinaryPrimitives.WriteUInt16LittleEndian(bytes.AsSpan(10),2);
        BinaryPrimitives.WriteUInt32LittleEndian(bytes.AsSpan(12),(uint)records.Select(r=>r.Length/2).DefaultIfEmpty(3).Max());var at=18;foreach(var r in records){r.CopyTo(bytes,at);at+=r.Length;}WmfRecord(0).CopyTo(bytes,at);return bytes;
    }
    internal const string Prefix="M 35 15 C 35 9.477 32.761 5 30 5 L 10 5";
}
