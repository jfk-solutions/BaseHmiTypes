using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Shapes;

public abstract class HmiShapeBase : HmiSimpleScreenItemBase
{
}

public abstract class HmiCentricShapeBase : HmiShapeBase
{
    public double CenterX { get; set; }

    public double CenterY { get; set; }
}

public abstract class HmiSurfaceShapeBase : HmiShapeBase
{
}

public abstract class HmiCircularShapeBase : HmiCentricShapeBase
{
    public double Radius { get; set; }
}

public abstract class HmiEllipticalShapeBase : HmiCentricShapeBase
{
    public double RadiusX { get; set; }

    public double RadiusY { get; set; }
}

public class HmiRectangle : HmiSurfaceShapeBase
{
}

public class HmiText : HmiSurfaceShapeBase
{
    public string? Text { get; set; }
}

public class HmiGraphicView : HmiSurfaceShapeBase
{
    public string? Source { get; set; }
}

public class HmiLine : HmiSurfaceShapeBase
{
}

public abstract class HmiPointBasedShapeBase : HmiSurfaceShapeBase
{
    public IList<HmiPoint> Points { get; } = new List<HmiPoint>();
}

public class HmiCircle : HmiCircularShapeBase
{
}

public class HmiCircleSegment : HmiCircle
{
}

public class HmiCircularArc : HmiCircularShapeBase
{
    public double StartAngle { get; set; }

    public double SweepAngle { get; set; }
}

public class HmiEllipse : HmiEllipticalShapeBase
{
}

public class HmiEllipseSegment : HmiEllipse
{
}

public class HmiEllipticalArc : HmiEllipticalShapeBase
{
    public double StartAngle { get; set; }

    public double SweepAngle { get; set; }
}

public class HmiPolygon : HmiPointBasedShapeBase
{
}

public class HmiPolyline : HmiPointBasedShapeBase
{
}

public readonly record struct HmiPoint(double X, double Y);
