using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Controls;

public sealed class HmiRecipeControl : HmiControlWindowBase
{
    public HmiRecipeControl()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiRecipeControl;
    }

    public HmiRecipeViewKind ViewKind { get; set; }

    public HmiProperty<bool>? ShowHeader { get; set; }

    public HmiProperty<bool>? ShowFooter { get; set; }

    public HmiProperty<int>? LinesPerItem { get; set; }

    public HmiProperty<bool>? WordWrap { get; set; }

    public HmiProperty<bool>? ViewOnly { get; set; }

    public HmiProperty<bool>? WrapAround { get; set; }

    public HmiProperty<HmiColor>? SelectionBackgroundColor { get; set; }

    public HmiProperty<HmiColor>? SelectionForegroundColor { get; set; }

    public IList<HmiRecipeColumn> ColumnDefinitions { get; } = new List<HmiRecipeColumn>();
}
