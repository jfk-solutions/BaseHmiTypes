namespace BaseHmiTypes.Projects;

/// <summary>A device node containing its screens, tags and other device-owned folders.</summary>
public class HmiProjectDevice : HmiProjectFolder
{
    public HmiDeviceInfo Info { get; }

    public HmiProjectDevice(HmiDeviceInfo info, IReadOnlyList<IHmiProjectFolder> folders)
        : base(HmiProjectFolderType.Device, info.Name, info.Id, info.Name,
            getFolders: _ => new ValueTask<IReadOnlyList<IHmiProjectFolder>>(folders))
    {
        Info = info;
    }
}
