using System.Xml;
using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Converters.UnifiedXml;

public sealed class HmiUnifiedXmlDiagnostic
{
    public string Path { get; }
    public string Message { get; }
    internal HmiUnifiedXmlDiagnostic(string path, string message) { Path = path; Message = message; }
}

public sealed class HmiUnifiedXmlExportResult
{
    public string Xml { get; }
    /// <summary>Whether the model-to-engineering mapping covers the full declared scope.</summary>
    public bool Complete => false;
    public IReadOnlyList<HmiUnifiedXmlDiagnostic> Diagnostics { get; }
    internal HmiUnifiedXmlExportResult(string xml, List<HmiUnifiedXmlDiagnostic> diagnostics)
    { Xml = xml; Diagnostics = diagnostics.AsReadOnly(); }
}

/// <summary>Exports editable engineering values using the shared Unified format contract.</summary>
public sealed class HmiScreenToUnifiedXmlConverter
{
    private readonly string? catalogXml;
    public HmiScreenToUnifiedXmlConverter(string? catalogXml = null) { this.catalogXml = catalogXml; }
    public const string CatalogId = HmiUnifiedXmlContract.Id;
    public const string Namespace = "urn:s7mcp:wincc-unified:2";
    public const string ContractNamespace = "urn:s7mcp:wincc-unified:2:contract";
    public HmiUnifiedXmlExportResult Convert(HmiScreenBase screen, string deviceName, int? defaultCultureLcid = null)
    {
        if (screen == null) throw new ArgumentNullException(nameof(screen));
        if (string.IsNullOrWhiteSpace(deviceName)) throw new ArgumentException("A device name is required.", nameof(deviceName));
        if (string.IsNullOrWhiteSpace(screen.Name)) throw new ArgumentException("A screen name is required.", nameof(screen));
        XmlConvert.VerifyXmlChars(deviceName); XmlConvert.VerifyXmlChars(screen.Name);
        return new HmiUnifiedXmlModelWriter(catalogXml ?? HmiUnifiedXmlCatalog.Read(), defaultCultureLcid).Convert(screen, deviceName);
    }
}
