namespace BaseHmiTypes.Screens.Base;

using BaseHmiTypes.Common;
using BaseHmiTypes.Scripts;
using BaseHmiTypes.Screens.Widgets;

public abstract class HmiScreenItemBase : HmiScreenModelBase
{
    public string? Description { get; set; }

    public bool? IsWallpaper { get; set; }

    public bool? IsReferenceObject { get; set; }

    public HmiReferenceObjectSettings? ReferenceObject { get; set; }

    /// <summary>Gets the global-object parameter definitions declared by this base object.</summary>
    public IList<HmiScreenParameter> Parameters { get; } = new List<HmiScreenParameter>();

    public HmiScriptExposureMode? ScriptExposureMode { get; set; }

    public string? SourceFormat { get; set; }

    public byte[]? SourceData { get; set; }

    public Dictionary<string, string> SourceProperties { get; } = [];

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

    public HmiRangeAnimation? HorizontalPositionAnimation { get; set; }

    public HmiRangeAnimation? VerticalPositionAnimation { get; set; }

    public HmiRangeAnimation? WidthAnimation { get; set; }

    public HmiRangeAnimation? HeightAnimation { get; set; }

    public HmiRangeAnimation? RotationAnimation { get; set; }

    public HmiSliderAnimation? HorizontalSliderAnimation { get; set; }

    public HmiSliderAnimation? VerticalSliderAnimation { get; set; }

    public HmiAffineTransform? Transform { get; set; }

    public HmiProperty<int>? TabIndex { get; set; }

    public string? SecurityCode { get; set; }

    public HmiProperty<bool>? KeyNavigation { get; set; }

    public HmiProperty<HmiMultilingualText>? ToolTipText { get; set; }

    public HmiProperty<bool>? CanBeGrouped { get; set; }

    public HmiElectronicSignatureSettings? ElectronicSignature { get; set; }

    public HmiVariableConfirmationSettings? VariableConfirmation { get; set; }

    public HmiTouchAreaShape? TouchAreaShape { get; set; }

    public HmiConfirmationDialogSettings? TouchConfirmationDialog { get; set; }

    public IList<HmiEventBinding> Events { get; } = new List<HmiEventBinding>();
}
