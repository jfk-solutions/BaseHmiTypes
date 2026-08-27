using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Controls;

public sealed class HmiAuditTrailControl : HmiControlWindowBase
{
    public HmiAuditTrailControl()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiAuditTrailControl;
    }

    public HmiAuditTrailViewKind ViewKind { get; set; }

    public HmiProperty<bool>? ShowHeader { get; set; }

    public HmiProperty<int>? LinesPerEntry { get; set; }

    public HmiProperty<bool>? WordWrap { get; set; }

    public HmiProperty<bool>? WrapAround { get; set; }

    public string? ReceiveSelectionFrom { get; set; }

    public IList<HmiAuditTrailFieldPresentation> Fields { get; } = new List<HmiAuditTrailFieldPresentation>();
}
