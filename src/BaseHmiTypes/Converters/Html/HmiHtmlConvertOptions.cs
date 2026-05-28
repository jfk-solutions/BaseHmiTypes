namespace BaseHmiTypes.Converters.Html;

public class HmiHtmlConvertOptions
{
    public bool IncludeMetaCharset { get; set; } = true;

    public string MissingScreenPlaceholderCssClass { get; set; } = "hmi-missing-screen";

    public string UnsupportedItemPlaceholderCssClass { get; set; } = "hmi-unsupported-item";
}
