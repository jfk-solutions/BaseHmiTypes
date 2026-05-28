namespace BaseHmiTypes.Screens.Base;

public struct HmiColor
{
    public HmiColor(byte alpha, byte red, byte green, byte blue)
    {
        Alpha = alpha;
        Red = red;
        Green = green;
        Blue = blue;
    }

    public byte Alpha { get; set; }

    public byte Red { get; set; }

    public byte Green { get; set; }

    public byte Blue { get; set; }

    public static HmiColor FromArgb(byte alpha, byte red, byte green, byte blue)
    {
        return new HmiColor(alpha, red, green, blue);
    }
}
