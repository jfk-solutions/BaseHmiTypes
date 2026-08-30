using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Controls;

public sealed class HmiAlarmDisplayFilter
{
    public string? Name { get; set; }

    public HmiProperty<string>? Definition { get; set; }

    public HmiAlarmFilterExpression? Expression { get; set; }

    public HmiProperty<bool>? IsInitial { get; set; }
}
