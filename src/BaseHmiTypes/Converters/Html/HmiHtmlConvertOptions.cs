namespace BaseHmiTypes.Converters.Html;

public class HmiHtmlConvertOptions
{
    /// <summary>Optional observation of actual renderer dispatch. Does not establish per-property support.</summary>
    public Action<HmiHtmlItemDiagnostic>? ItemDiagnostic { get; set; }

    public bool IncludeMetaCharset { get; set; } = true;

    public int? CultureLcid { get; set; }

    public string MissingScreenPlaceholderCssClass { get; set; } = "hmi-missing-screen";

    public string UnsupportedItemPlaceholderCssClass { get; set; } = "hmi-unsupported-item";
}


public sealed class HmiHtmlItemDiagnostic
{
    public string? ItemId { get; set; }
    public string? ItemName { get; set; }
    public string? ModelType { get; set; }
    public string? HmiObjectType { get; set; }
    public string? SourceFormat { get; set; }
    public string? NativeTypeName { get; set; }
    public string? NativeSubtype { get; set; }
    public string? NativeClassName { get; set; }
    public string? NativeClassId { get; set; }
    public string? RendererRoute { get; set; }
    public bool IsPlaceholder { get; set; }
    public int ChildCount { get; set; }
    public IReadOnlyList<string> SourcePropertyNames { get; set; } = Array.Empty<string>();
}
