using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens;

public class HmiTopLevelScreenWindow : HmiScreenModelBase
{
}

public class HmiScreen : HmiScreenBase
{
}

public class HmiScreenMaster : HmiScreenBase
{
}

public class HmiScreenWindow : HmiWindowBase
{
    public HmiScreen? Screen { get; set; }
}

public class HmiPopupScreenWindow : HmiScreenWindow
{
}
