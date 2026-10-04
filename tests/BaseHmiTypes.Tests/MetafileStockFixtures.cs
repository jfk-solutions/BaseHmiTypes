using System.Buffers.Binary;
namespace BaseHmiTypes.Tests;
internal static class MetafileStockFixtures
{
    internal static byte[] Emf(uint stock,bool restore=false,bool pen=false)
    {
        using var stream=new MemoryStream();using var writer=new BinaryWriter(stream);writer.Write(new byte[88]);var count=1u;
        void Record(uint type,params uint[] values)
        {writer.Write(type);writer.Write((uint)(8+values.Length*4));foreach(var value in values)writer.Write(value);count++;}
        if(pen)Record(38,1,0,3,0,0xFF);else Record(39,1,0,0xFF,0);
        Record(37,1);if(restore)Record(33);
        Record(37,stock);Record(43,0,0,40,20);
        if(restore){Record(34,0xFFFFFFFF);Record(43,0,20,40,40);}
        Record(14,0,0,20);var bytes=stream.ToArray();
        void U(int at,uint value)=>BinaryPrimitives.WriteUInt32LittleEndian(bytes.AsSpan(at,4),value);
        U(0,1);U(4,88);U(16,39);U(20,restore?39u:19u);U(40,0x464D4520);U(44,0x10000);U(48,(uint)bytes.Length);U(52,count);
        BinaryPrimitives.WriteUInt16LittleEndian(bytes.AsSpan(56,2),2);return bytes;
    }
}
