namespace BaseHmiTypes.Screens.Base;

/// <summary>Nonvisual screen-local physical-key target. Native codes are opaque identities.</summary>
public sealed class HmiDeviceKeyBinding : HmiScreenItemBase
{
    public string InputCode { get; set; } = string.Empty;
}
