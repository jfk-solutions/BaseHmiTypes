using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Shapes;

public class HmiText : HmiSurfaceShapeBase
{
    public HmiText()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiText;
    }

    public HmiProperty<string>? Text { get; set; }

    public HmiProperty<string>? AlternateText { get; set; }

    public HmiProperty<int>? TextWrapping { get; set; }

    public HmiProperty<int>? TextTrimming { get; set; }

    public HmiFont? Font { get; set; }

    public HmiProperty<HmiHorizontalAlignment>? HorizontalAlignment { get; set; }

    public HmiProperty<HmiVerticalAlignment>? VerticalAlignment { get; set; }
}
