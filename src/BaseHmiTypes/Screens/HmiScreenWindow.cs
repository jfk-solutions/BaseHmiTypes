using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens;

public class HmiScreenWindow : HmiWindowBase
{
    public HmiScreenWindow()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiScreenWindow;
    }

    public HmiProperty<string>? ScreenId { get; set; }

    public HmiProperty<string>? ScreenName { get; set; }

    public HmiProperty<bool>? TabIntoWindow { get; set; }

    public HmiProperty<int>? StartupPosition { get; set; }

    public HmiProperty<int>? WindowState { get; set; }

    public HmiProperty<bool>? IsModal { get; set; }

    public HmiProperty<double>? OffsetLeft { get; set; }

    public HmiProperty<double>? OffsetTop { get; set; }

    /// <summary>
    /// Gets or sets whether the referenced screen is stretched to fill the configured window.
    /// </summary>
    public HmiProperty<bool>? FitScreenToWindow { get; set; }

    /// <summary>
    /// Gets or sets whether the window is resized to the referenced screen.
    /// </summary>
    public HmiProperty<bool>? FitWindowToScreen { get; set; }

    /// <summary>
    /// Gets or sets whether scroll bars are shown when the referenced screen exceeds the window.
    /// </summary>
    public HmiProperty<bool>? ShowScrollBars { get; set; }

    /// <summary>
    /// Gets or sets the referenced screen zoom as a percentage.
    /// </summary>
    public HmiProperty<double>? ZoomPercent { get; set; }
}
