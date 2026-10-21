using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Controls;

public class HmiTrendCompanion : HmiCompanionBase
{
    public string? SourceControlId { get; set; }
    public HmiProperty<string>? SourceControlName { get; set; }
    /// <summary>0: ruler, 1: statistics area, 2: statistics result.</summary>
    public HmiProperty<int>? Mode { get; set; }
    public IList<HmiTrendCompanionColumn> Columns { get; } = new List<HmiTrendCompanionColumn>();
    public HmiTrendCompanion()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiTrendCompanion;
    }

}
