using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Widgets;

public sealed class HmiScreenNavigationSettings
{
    public HmiProperty<string>? TargetScreen { get; set; }

    public string? ParameterFile { get; set; }

    public string? ParameterList { get; set; }

    public HmiDisplayParameterSource? ParameterSource { get; set; }

    public bool? UseVariableTarget { get; set; }

    public bool? PositionEnabled { get; set; }

    public bool? UseVariablePosition { get; set; }

    public HmiProperty<double>? PositionX { get; set; }

    public HmiProperty<double>? PositionY { get; set; }
}
