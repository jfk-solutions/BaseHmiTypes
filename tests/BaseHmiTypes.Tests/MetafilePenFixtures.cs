using System.Buffers.Binary;
namespace BaseHmiTypes.Tests;
internal static class MetafilePenFixtures
{
    internal static byte[] Emf(int width=3,int ignoredWidth=123,uint style=0,uint color=0x00563412,int penSize=28)
    {
        using var stream=new MemoryStream();using var writer=new BinaryWriter(stream);writer.Write(new byte[88]);
        var pen=new byte[penSize];void P(int at,uint value)=>BinaryPrimitives.WriteUInt32LittleEndian(pen.AsSpan(at,4),value);
        P(0,38);P(4,(uint)penSize);P(8,1);P(12,style);P(16,unchecked((uint)width));P(20,unchecked((uint)ignoredWidth));if(penSize>=28)P(24,color);writer.Write(pen);
        void Record(uint type,params uint[] values){writer.Write(type);writer.Write((uint)(8+values.Length*4));foreach(var value in values)writer.Write(value);}
        Record(37,1);Record(27,5,10);Record(54,35,10);Record(14,0,0,20);
        var bytes=stream.ToArray();void U(int at,uint value)=>BinaryPrimitives.WriteUInt32LittleEndian(bytes.AsSpan(at,4),value);
        U(0,1);U(4,88);U(16,39);U(20,19);U(40,0x464D4520);U(44,0x10000);U(48,(uint)bytes.Length);U(52,6);BinaryPrimitives.WriteUInt16LittleEndian(bytes.AsSpan(56,2),2);return bytes;
    }
}
