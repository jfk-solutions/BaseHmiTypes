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

    public HmiProperty<HmiFixedPositionOutputMode>? FixedPositionOutputMode { get; set; }

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

    /// <summary>
    /// Gets or sets the amount by which a focused numeric input changes when
    /// its increment or decrement action is invoked.
    /// </summary>
    public HmiProperty<double>? RampIncrement { get; set; }

    /// <summary>
    /// Gets or sets the source expression used to transform operator input
    /// before it is written. Parsers preserve this expression without
    /// evaluating it.
    /// </summary>
    public string? OptionalWriteExpression { get; set; }

    /// <summary>
    /// Gets or sets the source expression identifying the value connection
    /// written by an input field. The parser does not perform the write.
    /// </summary>
    public string? WriteValueExpression { get; set; }

    /// <summary>
    /// Gets or sets the independent feedback value displayed by input fields
    /// that expose a separate indicator connection.
    /// </summary>
    public HmiProperty<double>? IndicatorValue { get; set; }

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

    /// <summary>
    /// Gets or sets whether the source application requests an audit remark
    /// when the operator enters a value.
    /// </summary>
    public HmiProperty<bool>? RemarkEnabled { get; set; }

    public HmiProperty<HmiConfirmationMode>? ConfirmationMode { get; set; }
}
