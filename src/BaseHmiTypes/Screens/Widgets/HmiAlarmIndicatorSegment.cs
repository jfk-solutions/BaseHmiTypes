using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Widgets;

public sealed class HmiAlarmIndicatorSegment
{
    public int Index { get; set; }

    public HmiProperty<double>? Width { get; set; }

    public HmiProperty<IList<int>>? MessageClasses { get; set; }
}
