using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Widgets;

/// <summary>
/// Describes acknowledgement behavior for an operator-entered value.
/// Timing values retain the unit used by the source HMI format.
/// </summary>
public sealed class HmiEnterHandshakeSettings
{
    public HmiProperty<double>? EnterSignal { get; set; }

    public HmiProperty<double>? AcknowledgementSignal { get; set; }

    public HmiProperty<HmiHandshakeResetMode>? ResetMode { get; set; }

    public HmiProperty<double>? ControlDelay { get; set; }

    public HmiProperty<double>? AcknowledgementTimeout { get; set; }

    public HmiProperty<double>? HoldTime { get; set; }
}
