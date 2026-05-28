using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.ModernUI;

public class HmiMonitor
{
    public string? Name { get; set; }

    public HmiProperty<double> Width { get; set; } = 0;

    public HmiProperty<double> Height { get; set; } = 0;
}
