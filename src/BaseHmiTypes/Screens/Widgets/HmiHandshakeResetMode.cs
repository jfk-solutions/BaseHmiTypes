namespace BaseHmiTypes.Screens.Widgets;

/// <summary>
/// Defines how a nonzero acknowledgement signal resets a latched or pending operation.
/// </summary>
public enum HmiHandshakeResetMode
{
    NonZeroValue,
    ZeroToNonZeroTransition
}
