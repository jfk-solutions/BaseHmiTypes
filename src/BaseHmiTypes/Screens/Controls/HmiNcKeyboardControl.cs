using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Controls;

public sealed class HmiNcKeyboardControl : HmiControlWindowBase
{
    public HmiNcKeyboardControl() => HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiNcKeyboardControl;
    public HmiProperty<int>? KeyboardStyle { get; set; }
    public HmiProperty<HmiColor>? KeyboardBackgroundColor { get; set; }
    public HmiNcKeyboardKeyAppearance NormalKeys { get; } = new();
    public HmiNcKeyboardKeyAppearance SpecialKeys { get; } = new();
    public HmiNcKeyboardKeyAppearance EnterKey { get; } = new();
}

public sealed class HmiNcKeyboardKeyAppearance
{
    public HmiProperty<HmiColor>? NormalBackgroundColor { get; set; }
    public HmiProperty<HmiColor>? NormalForegroundColor { get; set; }
    public HmiProperty<HmiColor>? PressedBackgroundColor { get; set; }
    public HmiProperty<HmiColor>? PressedForegroundColor { get; set; }
}
