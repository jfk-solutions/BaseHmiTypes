namespace BaseHmiTypes.Screens.Widgets;

/// <summary>
/// Describes the tag-write behavior requested when a button is activated.
/// </summary>
public enum HmiButtonAction
{
    NormallyOpen,
    NormallyClosed,
    StateValues,
    SetToOne,

    /// <summary>
    /// Writes the button's configured <see cref="HmiButtonBase.ButtonValue"/> when activated.
    /// </summary>
    ButtonValue,

    /// <summary>
    /// Writes zero to the configured action tag when activated.
    /// </summary>
    SetToZero,

    /// <summary>
    /// Toggles the configured action tag between zero and one when activated.
    /// </summary>
    ToggleTagValue
}
