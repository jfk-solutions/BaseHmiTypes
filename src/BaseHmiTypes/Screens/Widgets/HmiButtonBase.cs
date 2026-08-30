using BaseHmiTypes.Common;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Controls;

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

    public HmiProperty<HmiButtonVisualStyle>? VisualStyle { get; set; }

    public HmiProperty<bool>? CaptureCursor { get; set; }

    public HmiProperty<bool>? HighlightOnFocus { get; set; }

    public HmiProperty<bool>? DownStateSameAsUp { get; set; }

    /// <summary>
    /// Gets or sets whether the operator can activate the button with a pointer or touch screen.
    /// </summary>
    public HmiProperty<bool>? TouchEnabled { get; set; }

    /// <summary>
    /// Gets or sets whether activation requests operator audio feedback.
    /// </summary>
    public HmiProperty<bool>? AudioEnabled { get; set; }

    /// <summary>
    /// Gets or sets whether the button uses a distinct visual presentation while disabled.
    /// </summary>
    public HmiProperty<bool>? ShowDisabledState { get; set; }

    public HmiProperty<HmiDisabledImageMode>? DisabledImageMode { get; set; }

    public HmiProperty<HmiImageSource>? DisabledImage { get; set; }

    public HmiProperty<bool>? DisabledImageScaled { get; set; }

    public HmiConfirmationDialogSettings? ConfirmationDialog { get; set; }

    public HmiSignatureButtonSettings? SignatureSettings { get; set; }

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

    /// <summary>
    /// Gets or sets the tag that receives a direct button write action.
    /// </summary>
    public HmiProperty<string>? ActionTag { get; set; }

    /// <summary>
    /// Gets or sets the diagnostic or audit message associated with the configured action.
    /// </summary>
    public HmiProperty<HmiMultilingualText>? ActionRemark { get; set; }

    public HmiProperty<double>? ButtonValue { get; set; }

    /// <summary>
    /// Gets or sets whether closing a display also writes the configured button value to its action tag.
    /// </summary>
    public HmiProperty<bool>? WriteValueOnClose { get; set; }

    public HmiProperty<HmiButtonNextStateMode>? NextStateMode { get; set; }

    /// <summary>
    /// Gets or sets the predefined runtime operation requested by the button.
    /// </summary>
    public HmiProperty<HmiButtonOperation>? Operation { get; set; }

    /// <summary>
    /// Gets or sets whether a user-login dialog conceals the user-name entry at runtime.
    /// </summary>
    public HmiProperty<bool>? HideUserNameEntry { get; set; }

    /// <summary>
    /// Gets or sets whether a user-logout operation opens the configured navigation target.
    /// </summary>
    public HmiProperty<bool>? ShowDisplayOnLogout { get; set; }

    /// <summary>
    /// Gets or sets whether a password operation targets the current user or an administrator-selected user.
    /// </summary>
    public HmiProperty<HmiPasswordChangeMode>? PasswordChangeMode { get; set; }

    /// <summary>
    /// Gets the alarm trigger labels affected by an alarm operation. An empty list means all triggers.
    /// </summary>
    public IList<string> AlarmFilteredTriggers { get; } = new List<string>();

    /// <summary>
    /// Gets or sets the alarm-status view printed by an alarm-status print operation.
    /// </summary>
    public HmiProperty<HmiAlarmListMode>? AlarmPrintListMode { get; set; }

    public HmiProperty<bool>? PrintAlarmTime { get; set; }

    public HmiProperty<bool>? PrintAcknowledgeTime { get; set; }

    public HmiProperty<bool>? PrintTriggerLabel { get; set; }

    public HmiProperty<int>? PrintTriggerLabelWidth { get; set; }

    public HmiProperty<bool>? PrintTriggerValue { get; set; }

    public HmiProperty<int>? PrintTriggerValueWidth { get; set; }

    public HmiProperty<bool>? PrintMessage { get; set; }

    public HmiProperty<bool>? PrintAlarmQuantity { get; set; }

    public HmiProperty<bool>? PrintAccumulatedTime { get; set; }

    public HmiProperty<bool>? PrintAlarmState { get; set; }

    /// <summary>
    /// Gets or sets whether clearing alarm history also requests an alarm-status reset.
    /// </summary>
    public HmiProperty<bool>? ResetAlarmStatusOnClearHistory { get; set; }

    /// <summary>
    /// Gets or sets whether a specialized button sends its press to the focused or linked object.
    /// </summary>
    public HmiProperty<HmiButtonPressTarget>? PressTarget { get; set; }

    /// <summary>
    /// Gets or sets the name of the object that receives the press when <see cref="PressTarget"/> is linked.
    /// </summary>
    public HmiProperty<string>? LinkedObject { get; set; }

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
