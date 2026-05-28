using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Shapes;

public struct HmiPoint
{
    public HmiPoint(double x, double y)
    {
        X = x;
        Y = y;
    }

    public double X { get; set; }

    public double Y { get; set; }
}
