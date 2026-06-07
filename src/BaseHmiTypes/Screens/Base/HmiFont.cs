namespace BaseHmiTypes.Screens.Base;

public class HmiFont
{
    public HmiProperty<string>? Name { get; set; }

    public HmiProperty<double>? Size { get; set; }

    public HmiProperty<bool>? Bold { get; set; }

    public HmiProperty<bool>? Italic { get; set; }

    public HmiProperty<bool>? Underline { get; set; }

    public HmiProperty<bool>? Strikethrough { get; set; }
}
