using BaseHmiTypes.Common;
using BaseHmiTypes.Screens.Base;
namespace BaseHmiTypes.Screens.Controls;
/// <summary>A configured message block independent of displayed alarm columns.</summary>
public sealed class HmiAlarmMessageBlock
{
    public string? Name { get; set; }
    public HmiMultilingualText? Caption { get; set; }
    public HmiProperty<HmiHorizontalAlignment>? Alignment { get; set; }
    public HmiProperty<int>? DecimalPlaces { get; set; }
    public HmiProperty<int>? LeadingZeros { get; set; }
    public HmiProperty<bool>? AutomaticDecimalPlaces { get; set; }
    public HmiProperty<bool>? ExponentialFormat { get; set; }
    public string? DateFormat { get; set; }
    public string? TimeFormat { get; set; }
    public HmiProperty<bool>? ShowDate { get; set; }
}
