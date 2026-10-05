using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Controls;

public sealed class HmiRecipeControl : HmiControlWindowBase
{
    public HmiRecipeControl()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiRecipeControl;
    }

    public HmiRecipeViewKind ViewKind { get; set; }

    public HmiProperty<string>? DefaultRecipeName { get; set; }

    public HmiProperty<int>? FieldLength { get; set; }

    public HmiProperty<HmiHorizontalAlignment>? HorizontalAlignment { get; set; }

    public HmiProperty<bool>? EnableRecipeDialog { get; set; }

    public HmiProperty<double>? HeaderCornerRadius { get; set; }
    public HmiProperty<HmiColor>? HeaderBorderBackgroundColor { get; set; }
    public HmiProperty<int>? HeaderBackFillStyle { get; set; }
    public HmiProperty<int>? HeaderEdgeStyle { get; set; }
    public HmiProperty<HmiColor>? HeaderFirstGradientColor { get; set; }
    public HmiProperty<HmiColor>? HeaderMiddleGradientColor { get; set; }
    public HmiProperty<HmiColor>? HeaderSecondGradientColor { get; set; }
    public HmiProperty<double>? HeaderFirstGradientOffset { get; set; }
    public HmiProperty<double>? HeaderSecondGradientOffset { get; set; }
    public HmiProperty<bool>? UseHeaderFirstGradient { get; set; }
    public HmiProperty<bool>? UseHeaderSecondGradient { get; set; }

    public HmiProperty<HmiColor>? ButtonBackgroundColor { get; set; }
    public HmiProperty<HmiColor>? ButtonBorderBackgroundColor { get; set; }
    public HmiProperty<HmiColor>? ButtonBorderColor { get; set; }
    public HmiProperty<HmiColor>? ButtonFirstGradientColor { get; set; }
    public HmiProperty<HmiColor>? ButtonMiddleGradientColor { get; set; }
    public HmiProperty<HmiColor>? ButtonSecondGradientColor { get; set; }
    public HmiProperty<double>? ButtonBorderWidth { get; set; }
    public HmiProperty<int>? ButtonCornerRadius { get; set; }
    public HmiProperty<int>? ButtonEdgeStyle { get; set; }
    public HmiProperty<int>? ButtonBackFillStyle { get; set; }
    public HmiProperty<double>? ButtonFirstGradientOffset { get; set; }
    public HmiProperty<double>? ButtonSecondGradientOffset { get; set; }
    public HmiProperty<bool>? UseButtonFirstGradient { get; set; }
    public HmiProperty<bool>? UseButtonSecondGradient { get; set; }
    public HmiProperty<HmiColor>? TextualObjectsBorderBackgroundColor { get; set; }
    public HmiProperty<HmiColor>? TextualObjectsBorderColor { get; set; }
    public HmiProperty<double>? TextualObjectsBorderWidth { get; set; }
    public HmiProperty<int>? TextualObjectsCornerRadius { get; set; }
    public HmiProperty<int>? TextualObjectsEdgeStyle { get; set; }

    public HmiProperty<bool>? ShowHeader { get; set; }

    public HmiProperty<bool>? ShowGridLines { get; set; }

    public HmiProperty<HmiColor>? GridLineColor { get; set; }

    public HmiProperty<bool>? ShowStatusBar { get; set; }
    public HmiFont? StatusBarFont { get; set; }
    public HmiFont? ComboBoxFont { get; set; }
    public HmiProperty<bool>? ShowNumbers { get; set; }
    public HmiProperty<HmiColor>? AlternatingRowBackgroundColor { get; set; }

    public HmiProperty<bool>? ShowFooter { get; set; }

    public HmiProperty<int>? LinesPerItem { get; set; }

    public HmiProperty<bool>? WordWrap { get; set; }

    public HmiProperty<bool>? ViewOnly { get; set; }

    public HmiProperty<bool>? WrapAround { get; set; }

    public HmiProperty<HmiColor>? SelectionBackgroundColor { get; set; }

    public HmiProperty<HmiColor>? SelectionForegroundColor { get; set; }

    public IList<HmiRecipeColumn> ColumnDefinitions { get; } = new List<HmiRecipeColumn>();
}
