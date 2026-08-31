namespace BaseHmiTypes.Screens.Base;

public class HmiColorAnimation
{
    public string? Expression { get; set; }

    /// <summary>Gets or sets the complete blink cycle duration in seconds.</summary>
    public double? BlinkRate { get; set; }

    public List<HmiColorAnimationState> States { get; } = [];
}
