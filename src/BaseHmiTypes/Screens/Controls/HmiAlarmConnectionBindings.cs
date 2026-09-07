using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Controls;

/// <summary>Inert tag and expression bindings used by classic alarm controls.</summary>
public class HmiAlarmConnectionBindings
{
    public HmiProperty<double>? AcknowledgeNotification { get; set; }

    public HmiProperty<double>? SilenceNotification { get; set; }

    public HmiProperty<double>? StatusResetNotification { get; set; }

    public HmiProperty<double>? MessageNotification { get; set; }

    public HmiProperty<double>? MessageHandshake { get; set; }

    public HmiProperty<double>? CloseDisplayNotification { get; set; }

    public HmiProperty<double>? RemoteAcknowledge { get; set; }

    public HmiProperty<double>? RemoteAcknowledgeAll { get; set; }

    public HmiProperty<double>? RemoteAcknowledgeHandshake { get; set; }

    public HmiProperty<double>? RemoteCloseDisplay { get; set; }

    public HmiProperty<double>? RemoteClearHistory { get; set; }

    public HmiProperty<double>? RemoteSilence { get; set; }

    public HmiProperty<double>? RemoteStatusReset { get; set; }
}
