using System.IO.Compression;
using System.Text;
namespace BaseHmiTypes.Converters.UnifiedXml;
/// <summary>The single Unified wire contract; independent of the producer's Siemens version.</summary>
public static class HmiUnifiedXmlCatalog
{
    public const string Id = HmiUnifiedXmlContract.Id;
    public static Stream Open(string id = Id)
    {
        if (id != Id) throw new NotSupportedException("Unsupported Unified format catalog: " + id);
        var stream = typeof(HmiUnifiedXmlCatalog).Assembly.GetManifestResourceStream("BaseHmiTypes.Converters.UnifiedXml.Catalog.xml.gz")
            ?? throw new InvalidOperationException("The shared Unified format catalog is not packaged.");
        try { return new GZipStream(stream, CompressionMode.Decompress); } catch { stream.Dispose(); throw; }
    }
    public static string Read() { using var stream = Open(); using var reader = new StreamReader(stream, new UTF8Encoding(false,true)); return reader.ReadToEnd(); }
}
