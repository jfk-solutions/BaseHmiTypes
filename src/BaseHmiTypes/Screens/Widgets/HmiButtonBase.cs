using BaseHmiTypes.Common;
using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Widgets;

public abstract class HmiButtonBase : HmiWidgetBase
{
    public IList<HmiState> States { get; } = new List<HmiState>();

    /// <summary>
    /// Gets or sets the number of configured states, excluding any error state.
    /// </summary>
    public HmiProperty<int>? ConfiguredStateCount { get; set; }

    public HmiProperty<HmiStateTriggerMode>? StateTriggerMode { get; set; }

    public HmiProperty<double>? State { get; set; }

    public HmiProperty<HmiMultilingualText>? Text { get; set; }

    public HmiProperty<HmiMultilingualText>? AlternateText { get; set; }

    public HmiScreenNavigationSettings? Navigation { get; set; }

    public HmiProperty<HmiImageSource>? Image { get; set; }

    public HmiProperty<HmiImageSource>? AlternateImage { get; set; }

    public HmiProperty<bool>? ImageScaled { get; set; }

    public HmiProperty<bool>? ImageBlink { get; set; }

    public HmiProperty<HmiColor>? ImageColor { get; set; }

    public HmiProperty<HmiColor>? ImageBackgroundColor { get; set; }

    public HmiProperty<bool>? ImageBackgroundTransparent { get; set; }

    public HmiProperty<HmiHorizontalAlignment>? ImageHorizontalAlignment { get; set; }

    public HmiProperty<HmiVerticalAlignment>? ImageVerticalAlignment { get; set; }

    public HmiProperty<int>? GraphicStretchMode { get; set; }

    public HmiProperty<string>? HotKey { get; set; }

    public HmiProperty<string>? PressedStateTags { get; set; }

    public HmiProperty<int>? StyleSettings { get; set; }

    public HmiProperty<bool>? WindowsStyle { get; set; }

    /// <summary>
    /// Gets or sets whether the operator can activate the button with a pointer or touch screen.
    /// </summary>
    public HmiProperty<bool>? TouchEnabled { get; set; }

    /// <summary>
    /// Gets or sets whether activation requests operator audio feedback.
    /// </summary>
    public HmiProperty<bool>? AudioEnabled { get; set; }

    /// <summary>
    /// Gets or sets how long the button must remain pressed before automatic repetition starts.
    /// </summary>
    public HmiProperty<double>? AutoRepeatDelaySeconds { get; set; }

    /// <summary>
    /// Gets or sets how many button presses are registered per second while automatic repetition is active.
    /// </summary>
    public HmiProperty<double>? AutoRepeatRatePerSecond { get; set; }

    /// <summary>
    /// Gets or sets the minimum duration for which the button remains pressed.
    /// </summary>
    public HmiProperty<double>? HoldTimeSeconds { get; set; }

    public HmiProperty<HmiButtonAction>? ButtonAction { get; set; }

    public HmiProperty<double>? ButtonValue { get; set; }

    public HmiProperty<HmiButtonNextStateMode>? NextStateMode { get; set; }

    /// <summary>
    /// Gets or sets the macro or script component invoked when the button is activated.
    /// An expression-backed property represents products that select the macro name at runtime.
    /// </summary>
    public HmiProperty<string>? Macro { get; set; }

    /// <summary>
    /// Gets or sets whether the macro name is selected from a runtime expression.
    /// </summary>
    public HmiProperty<bool>? UseVariableMacro { get; set; }

    /// <summary>
    /// Gets or sets the application language selected when the button is activated.
    /// </summary>
    public HmiProperty<string>? TargetLanguage { get; set; }

    /// <summary>
    /// Gets or sets the acknowledgement signal used to release a latched button.
    /// </summary>
    public HmiProperty<double>? Handshake { get; set; }

    /// <summary>
    /// Gets or sets how the acknowledgement signal releases a latched button.
    /// </summary>
    public HmiProperty<HmiHandshakeResetMode>? LatchResetMode { get; set; }

    public HmiProperty<HmiRampDirection>? RampDirection { get; set; }

    public HmiProperty<double>? RampIncrement { get; set; }

    public HmiProperty<double>? RampLimit { get; set; }

    public HmiProperty<bool>? UseVariableRamp { get; set; }

    public HmiProperty<bool>? UseVariableLimit { get; set; }

    public HmiProperty<HmiColor>? CaptionColor { get; set; }

    public HmiProperty<HmiColor>? CaptionBackgroundColor { get; set; }

    /// <summary>
    /// Gets or sets the touch-insensitive area inside the button bounds.
    /// </summary>
    public HmiThickness? TouchMargin { get; set; }
}
