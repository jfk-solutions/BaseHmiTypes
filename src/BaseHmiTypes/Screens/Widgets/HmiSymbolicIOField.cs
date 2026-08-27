using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Widgets;

public class HmiSymbolicIOField : HmiTextWidgetBase
{
    public HmiSymbolicIOField()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiSymbolicIOField;
    }

    public IList<HmiState> States { get; } = new List<HmiState>();

    /// <summary>
    /// Gets or sets the number of configured states, excluding any error state.
    /// </summary>
    public HmiProperty<int>? ConfiguredStateCount { get; set; }

    public HmiProperty<HmiStateTriggerMode>? StateTriggerMode { get; set; }

    public HmiProperty<double>? Value { get; set; }

    public HmiProperty<string>? MessageFile { get; set; }

    public HmiProperty<bool>? UseVariableMessageFile { get; set; }

    public HmiProperty<bool>? UseEchoMessage { get; set; }

    public HmiProperty<string>? EchoMessage { get; set; }

    public HmiProperty<int>? Mode { get; set; }

    public HmiProperty<bool>? ShowDropDownButton { get; set; }

    public HmiProperty<bool>? ShowDropDownList { get; set; }
}
