using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Shapes;

public class HmiRectangle : HmiSurfaceShapeBase
{
    public HmiRectangle()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiRectangle;
    }

    public HmiProperty<(double x, double y)>? TopLeftRadius { get; set; }

    public HmiProperty<(double x, double y)>? TopRightRadius { get; set; }

    public HmiProperty<(double x, double y)>? BottomLeftRadius { get; set; }

    public HmiProperty<(double x, double y)>? BottomRightRadius { get; set; }

    public HmiProperty<int>? CornerRadius { get; set; }

    public HmiProperty<int>? CornerStyle { get; set; }

    /// <summary>Draws borders wider than one pixel inside the frame when true, or centered on it when false.</summary>
    public HmiProperty<bool>? DrawStrokeInsideFrame { get; set; }

}
