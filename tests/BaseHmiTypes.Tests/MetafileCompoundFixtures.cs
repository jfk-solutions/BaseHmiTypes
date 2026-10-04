using System.Buffers.Binary;
namespace BaseHmiTypes.Tests;
internal static class MetafileCompoundFixtures
{
    internal static byte[] Compound(uint type, int[]? coordinates = null)
    {
        coordinates ??= new[]{2,2,38,2,38,38,2,38,12,12,28,12,28,28,12,28};
        var shortPoints = type == 90 || type == 91;
        var bytes = new byte[40 + coordinates.Length * (shortPoints ? 2 : 4)];
        void U(int at,uint value)=>BinaryPrimitives.WriteUInt32LittleEndian(bytes.AsSpan(at),value);
        U(0,type);U(4,(uint)bytes.Length);U(16,39);U(20,39);U(24,2);U(28,8);U(32,4);U(36,4);
        for(var i=0;i<coordinates.Length;i++)
            if(shortPoints)BinaryPrimitives.WriteInt16LittleEndian(bytes.AsSpan(40+i*2),(short)coordinates[i]);
            else BinaryPrimitives.WriteInt32LittleEndian(bytes.AsSpan(40+i*4),coordinates[i]);
        return bytes;
    }
}
