namespace BaseHmiTypes.Screens.Base;

public class HmiImageSource
{
    public string? ImageId { get; set; }

    public string? ImageName { get; set; }

    public string? Uri { get; set; }

    public HmiImageSourceKind Kind { get; set; } = HmiImageSourceKind.Uri;
}
