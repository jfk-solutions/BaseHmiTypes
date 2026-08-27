namespace BaseHmiTypes.Screens.Base;

using BaseHmiTypes.Common;
using BaseHmiTypes.Scripts;

public abstract class HmiScreenItemBase : HmiScreenModelBase
{
    public string? Description { get; set; }

    public bool? IsWallpaper { get; set; }

    public bool? IsReferenceObject { get; set; }

    public HmiReferenceObjectSettings? ReferenceObject { get; set; }

    public HmiScriptExposureMode? ScriptExposureMode { get; set; }

    public HmiProperty<double> X { get; set; } = 0;

    public HmiProperty<double> Y { get; set; } = 0;

    public HmiProperty<double> Width { get; set; } = 0;

    public HmiProperty<double> Height { get; set; } = 0;

    public HmiProperty<bool> Visible { get; set; } = true;

    public HmiProperty<bool> Enabled { get; set; } = true;

    public HmiProperty<double>? Opacity { get; set; }

    public HmiProperty<double>? RotationAngle { get; set; }

    public HmiProperty<double>? RotationCenterX { get; set; }

    public HmiProperty<double>? RotationCenterY { get; set; }

    public HmiProperty<int>? TabIndex { get; set; }

    public string? SecurityCode { get; set; }

    public HmiProperty<bool>? KeyNavigation { get; set; }

    public HmiProperty<HmiMultilingualText>? ToolTipText { get; set; }

    public HmiProperty<bool>? CanBeGrouped { get; set; }

    public HmiElectronicSignatureSettings? ElectronicSignature { get; set; }

    public IList<HmiEventBinding> Events { get; } = new List<HmiEventBinding>();
}
