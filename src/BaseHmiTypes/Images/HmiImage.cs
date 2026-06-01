namespace BaseHmiTypes.Images;

public sealed class HmiImage : IHmiObject
{
    public string? Id { get; set; }

    public string? Name { get; set; }

    public DateTime? LastModified { get; set; }

    public HmiImageType ImageType { get; set; } = HmiImageType.Unknown;

    public string? MimeType { get; set; }

    public byte[] Data { get; set; } = Array.Empty<byte>();
}
