using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Controls;

public class HmiMediaControl : HmiControlWindowBase
{
    public HmiMediaControl()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiMediaControl;
    }

    public HmiProperty<string>? Source { get; set; }

    public HmiProperty<bool>? AutoPlay { get; set; }

    public HmiProperty<uint>? VideoOutput { get; set; }

    public HmiProperty<bool>? ShowToolbar { get; set; }

    public HmiProperty<HmiColor>? ToolbarBackgroundColor { get; set; }

    public HmiProperty<HmiColor>? ToolbarForegroundColor { get; set; }

    public HmiProperty<bool>? ShowStatusBar { get; set; }

    public HmiProperty<HmiColor>? StatusBarBackgroundColor { get; set; }

    public HmiProperty<HmiColor>? StatusBarForegroundColor { get; set; }
}
