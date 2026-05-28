namespace BaseHmiTypes.Screens.Base;

public class HmiImageSource
{
    public string? Uri { get; set; }

    public HmiImageSourceKind Kind { get; set; } = HmiImageSourceKind.Uri;
}
