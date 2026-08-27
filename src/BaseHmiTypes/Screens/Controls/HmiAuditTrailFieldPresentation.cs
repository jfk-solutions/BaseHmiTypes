using BaseHmiTypes.Common;
using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Controls;

public sealed class HmiAuditTrailFieldPresentation
{
    public HmiAuditTrailField Field { get; set; }

    public string? SourceType { get; set; }

    public HmiProperty<bool>? Visible { get; set; }

    public HmiProperty<double>? Width { get; set; }

    public string? TimeAndDateFormat { get; set; }

    public HmiMultilingualText? HeaderText { get; set; }
}
