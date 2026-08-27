namespace BaseHmiTypes.Screens.Base;

public class HmiColorAnimation
{
    public string? Expression { get; set; }

    public int? BlinkRate { get; set; }

    public List<HmiColorAnimationState> States { get; } = [];
}
