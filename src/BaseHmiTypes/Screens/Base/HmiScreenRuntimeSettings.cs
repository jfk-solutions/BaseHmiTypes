namespace BaseHmiTypes.Screens.Base;

public enum HmiScreenDisplayType
{
    Replace,
    Overlay,
    OnTop
}

public enum HmiScreenPositionMode
{
    CurrentPosition,
    SpecifiedPixels
}

public enum HmiScreenSizeMode
{
    CurrentSize,
    SpecifiedPixels
}

public enum HmiScreenResizeMode
{
    None,
    Pan,
    Scale
}

public sealed class HmiScreenRuntimeSettings
{
    public HmiScreenDisplayType? DisplayType { get; set; }

    public HmiScreenPositionMode? PositionMode { get; set; }

    public HmiScreenSizeMode? SizeMode { get; set; }

    public string? SecurityCode { get; set; }

    public bool? TitleBarVisible { get; set; }

    public string? TitleBarText { get; set; }

    public double? MaximumTagUpdateRateSeconds { get; set; }

    public bool? InitialInputFocusEnabled { get; set; }

    public bool? FocusHighlightEnabled { get; set; }

    public HmiColor? FocusHighlightColor { get; set; }

    public bool? AllowMultipleRunningCopies { get; set; }

    public bool? CacheAfterDisplaying { get; set; }

    /// <summary>
    /// Gets or sets whether the screen is cached and whether it keeps updating while cached.
    /// </summary>
    public HmiScreenCacheMode? CacheMode { get; set; }

    public bool? SystemMenuVisible { get; set; }

    public bool? MinimizeButtonVisible { get; set; }

    public bool? SizeToMainWindow { get; set; }

    public HmiScreenResizeMode? ResizeMode { get; set; }

    public bool? ShowLastAcquiredValue { get; set; }

    public bool? TrackForNavigation { get; set; }

    public string? NavigationHistoryName { get; set; }

    public bool? BeepOnPress { get; set; }

    public bool? HighlightWhenPointerPassesOver { get; set; }

    public HmiColor? InteractiveHighlightColor { get; set; }

    public HmiColor? FieldNotSelectedTextColor { get; set; }

    public HmiColor? FieldNotSelectedFillColor { get; set; }

    public HmiColor? FieldSelectedTextColor { get; set; }

    public HmiColor? FieldSelectedFillColor { get; set; }

    public HmiColor? FieldInErrorNotSelectedTextColor { get; set; }

    public HmiColor? FieldInErrorNotSelectedFillColor { get; set; }

    public HmiColor? FieldInErrorSelectedTextColor { get; set; }

    public HmiColor? FieldInErrorSelectedFillColor { get; set; }

    public bool? DisplayOnScreenKeyboard { get; set; }

    public bool? AllowButtonActionOnError { get; set; }

    public string? StartupCommand { get; set; }

    public string? ShutdownCommand { get; set; }
}
