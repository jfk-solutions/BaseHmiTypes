using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Shapes;

public abstract class HmiCentricShapeBase : HmiShapeBase
{
    /// <summary>Draws strokes wider than one pixel inside the circular or elliptical outline instead of centered on it.</summary>
    public HmiProperty<bool>? DrawStrokeInsideFrame { get; set; }

    public HmiProperty<double> CenterX { get; set; } = 0;

    public HmiProperty<double> CenterY { get; set; } = 0;
}
