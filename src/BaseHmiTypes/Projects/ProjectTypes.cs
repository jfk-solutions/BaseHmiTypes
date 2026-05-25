using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Projects;

public abstract class HmiProjectBase
{
    public HmiProjectInfo Info { get; } = new();

    public IList<HmiScreen> Screens { get; } = new List<HmiScreen>();

    public IList<HmiScreenMaster> ScreenMasters { get; } = new List<HmiScreenMaster>();

    public IList<HmiFaceplateType> FaceplateTypes { get; } = new List<HmiFaceplateType>();
}

public class HmiProject : HmiProjectBase
{
}

public class HmiProjectInfo
{
    public string? ProjectTitle { get; set; }

    public string? DeviceFamilyString { get; set; }

    public string? ProjectName { get; set; }

    public string? Author { get; set; }

    public string? EngineeringSoftwareVersionString { get; set; }

    public string? OriginalDateString { get; set; }
}
