using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Common;

namespace BaseHmiTypes.Screens.Widgets;

public class HmiIOField : HmiTextWidgetBase
{
    public HmiIOField()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiIOField;
    }

    public HmiProperty<string>? HotKey { get; set; }

    public HmiProperty<bool>? MaskInput { get; set; }

    public HmiProperty<string>? FillCharacters { get; set; }

    public HmiProperty<int>? CharacterColumns { get; set; }

    public HmiProperty<int>? CharacterRows { get; set; }

    public HmiProperty<int>? CharacterOffset { get; set; }

    public HmiProperty<bool>? ShowDigitGrouping { get; set; }

    public HmiProperty<string>? OverflowMode { get; set; }

    public HmiProperty<HmiDecimalPointMode>? DecimalPointMode { get; set; }

    public HmiProperty<int>? DigitsAfterDecimal { get; set; }

    /// <summary>
    /// Gets or sets the lowest value accepted by a numeric input field. The
    /// property can contain a static limit or a runtime expression.
    /// </summary>
    public HmiProperty<double>? MinimumValue { get; set; }

    /// <summary>
    /// Gets or sets the highest value accepted by a numeric input field. The
    /// property can contain a static limit or a runtime expression.
    /// </summary>
    public HmiProperty<double>? MaximumValue { get; set; }

    /// <summary>
    /// Gets or sets whether the source application enables expression-driven
    /// minimum and maximum limits.
    /// </summary>
    public HmiProperty<bool>? UseVariableMinimumMaximum { get; set; }

    public HmiProperty<double>? PolaritySignal { get; set; }

    public HmiEnterHandshakeSettings? EnterHandshake { get; set; }

    public HmiProperty<HmiInputPopupMode>? PopupMode { get; set; }

    public HmiProperty<bool>? TakeFocusOnPress { get; set; }

    public HmiProperty<string>? DefaultData { get; set; }

    public HmiProperty<bool>? DisplayOnScreenKeyboard { get; set; }

    public HmiProperty<HmiMultilingualText>? OnScreenKeyboardCaption { get; set; }

    public HmiProperty<bool>? ContinuouslyUpdate { get; set; }

    public HmiProperty<bool>? DiscardInputOnFocusLost { get; set; }

    public HmiProperty<HmiMultilingualText>? Remark { get; set; }

    public HmiProperty<HmiConfirmationMode>? ConfirmationMode { get; set; }
}
