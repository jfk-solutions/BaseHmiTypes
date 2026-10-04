using System.Buffers.Binary;

namespace BaseHmiTypes.Tests;

internal static class MetafilePointArrayFixtures
{
    internal static byte[] Record(uint type, params int[] values)
    {
        var bytes = new byte[8 + values.Length * 4];
        BinaryPrimitives.WriteUInt32LittleEndian(bytes, type);
        BinaryPrimitives.WriteUInt32LittleEndian(bytes.AsSpan(4), (uint)bytes.Length);
        for (var i=0;i<values.Length;i++) BinaryPrimitives.WriteInt32LittleEndian(bytes.AsSpan(8+i*4), values[i]);
        return bytes;
    }

    internal static byte[] Points(uint type, int[]? points = null, uint? count = null, int sizeAdjustment = 0)
    {
        points ??= new[]{5,5,35,5,20,35};
        var shortPoints = type == 86 || type == 87;
        var record = Record(type, new[]{0,0,39,39,unchecked((int)(count ?? (uint)(points.Length/2)))}.Concat(shortPoints ? Array.Empty<int>() : points).ToArray());
        if (shortPoints)
        {
            Array.Resize(ref record, 28 + points.Length * 2);
            for (var index = 0; index < points.Length; index++)
                BinaryPrimitives.WriteInt16LittleEndian(record.AsSpan(28 + index * 2), checked((short)points[index]));
        }
        Array.Resize(ref record, record.Length + sizeAdjustment);
        BinaryPrimitives.WriteUInt32LittleEndian(record.AsSpan(4), (uint)record.Length);
        return record;
    }

    internal static byte[] Emf(params byte[][] records)
    {
        var bytes = new byte[88 + records.Sum(record=>record.Length) + 20];
        var at=88; foreach(var record in records){ record.CopyTo(bytes,at); at+=record.Length; }
        Record(14,0,0,20).CopyTo(bytes,at);
        void U(int offset,uint value)=>BinaryPrimitives.WriteUInt32LittleEndian(bytes.AsSpan(offset),value);
        U(0,1);U(4,88);U(16,39);U(20,39);U(40,0x464d4520);U(44,0x10000);U(48,(uint)bytes.Length);U(52,(uint)(records.Length+2));
        BinaryPrimitives.WriteUInt16LittleEndian(bytes.AsSpan(56),2);return bytes;
    }
}
