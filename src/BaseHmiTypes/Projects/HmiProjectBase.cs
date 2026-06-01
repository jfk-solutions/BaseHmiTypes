using BaseHmiTypes.Alarms;
using BaseHmiTypes.Connections;
using BaseHmiTypes.Cycles;
using BaseHmiTypes.Images;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Scripts;
using BaseHmiTypes.Tags;
using BaseHmiTypes.TextGraphicLists;

namespace BaseHmiTypes.Projects;

public abstract class HmiProjectBase : IHmiProject
{
    public HmiProjectInfo Info { get; } = new();

    public virtual string? Id => null;

    public virtual string Name => string.IsNullOrWhiteSpace(Info.ProjectName) ? "Project" : Info.ProjectName!;

    public virtual string Path => Name;

    public virtual HmiProjectFolderType FolderType => HmiProjectFolderType.Unknown;

    public IReadOnlyList<IHmiProjectFolder> Folders => GetFoldersAsync().AsTask().GetAwaiter().GetResult();

    public IReadOnlyList<IHmiProjectItemDescriptor> Items => GetItemsAsync().AsTask().GetAwaiter().GetResult();

    public virtual IHmiProjectFolder? Screens => GetFolder(HmiProjectFolderType.Screens);

    public virtual IHmiProjectFolder? Tags => GetFolder(HmiProjectFolderType.Tags);

    public virtual IHmiProjectFolder? Scripts => GetFolder(HmiProjectFolderType.Scripts);

    public virtual IHmiProjectFolder? TextLists => GetFolder(HmiProjectFolderType.TextLists);

    public virtual IHmiProjectFolder? GraphicLists => GetFolder(HmiProjectFolderType.GraphicLists);

    public virtual IHmiProjectFolder? Images => GetFolder(HmiProjectFolderType.Images);

    public virtual IHmiProjectFolder? Cycles => GetFolder(HmiProjectFolderType.Cycles);

    public virtual IHmiProjectFolder? Alarms => GetFolder(HmiProjectFolderType.Alarms);

    public virtual IHmiProjectFolder? Connections => GetFolder(HmiProjectFolderType.Connections);

    public virtual ValueTask<IReadOnlyList<IHmiProjectFolder>> GetFoldersAsync(CancellationToken cancellationToken = default)
    {
        return new ValueTask<IReadOnlyList<IHmiProjectFolder>>(Array.Empty<IHmiProjectFolder>());
    }

    public virtual ValueTask<IReadOnlyList<IHmiProjectItemDescriptor>> GetItemsAsync(CancellationToken cancellationToken = default)
    {
        return new ValueTask<IReadOnlyList<IHmiProjectItemDescriptor>>(Array.Empty<IHmiProjectItemDescriptor>());
    }

    public virtual ValueTask<HmiScreen?> GetScreenAsync(string id, CancellationToken cancellationToken = default)
    {
        return new ValueTask<HmiScreen?>((HmiScreen?)null);
    }

    public virtual ValueTask<HmiTagTable?> GetTagTableAsync(string id, CancellationToken cancellationToken = default)
    {
        return new ValueTask<HmiTagTable?>((HmiTagTable?)null);
    }

    public virtual ValueTask<HmiScript?> GetScriptAsync(string id, CancellationToken cancellationToken = default)
    {
        return new ValueTask<HmiScript?>((HmiScript?)null);
    }

    public virtual ValueTask<HmiTextList?> GetTextListAsync(string id, CancellationToken cancellationToken = default)
    {
        return new ValueTask<HmiTextList?>((HmiTextList?)null);
    }

    public virtual ValueTask<HmiGraphicList?> GetGraphicListAsync(string id, CancellationToken cancellationToken = default)
    {
        return new ValueTask<HmiGraphicList?>((HmiGraphicList?)null);
    }

    public virtual ValueTask<HmiImage?> GetImageAsync(string id, CancellationToken cancellationToken = default)
    {
        return new ValueTask<HmiImage?>((HmiImage?)null);
    }

    public virtual ValueTask<HmiCycle?> GetCycleAsync(string id, CancellationToken cancellationToken = default)
    {
        return new ValueTask<HmiCycle?>((HmiCycle?)null);
    }

    public virtual ValueTask<HmiAlarmList?> GetAlarmListAsync(string id, CancellationToken cancellationToken = default)
    {
        return new ValueTask<HmiAlarmList?>((HmiAlarmList?)null);
    }

    public virtual ValueTask<HmiConnectionList?> GetConnectionListAsync(string id, CancellationToken cancellationToken = default)
    {
        return new ValueTask<HmiConnectionList?>((HmiConnectionList?)null);
    }

    public virtual async ValueTask<IReadOnlyList<HmiScreenDescriptor>> GetScreensAsync(CancellationToken cancellationToken = default)
    {
        var result = new List<HmiScreenDescriptor>();
        var screens = Screens;
        if (screens == null)
            return result;

        await CollectScreensAsync(screens, result, cancellationToken).ConfigureAwait(false);
        return result;
    }

    protected IHmiProjectFolder? GetFolder(HmiProjectFolderType folderType)
    {
        return Folders.FirstOrDefault(folder => folder.FolderType == folderType);
    }

    private static async ValueTask CollectScreensAsync(
        IHmiProjectFolder folder,
        IList<HmiScreenDescriptor> result,
        CancellationToken cancellationToken)
    {
        foreach (var item in await folder.GetItemsAsync(cancellationToken).ConfigureAwait(false))
        {
            if (item.Kind == HmiProjectItemKind.Screen)
            {
                result.Add(new HmiScreenDescriptor
                {
                    Id = item.Id,
                    Name = item.Name,
                    DisplayName = item.Name,
                    Path = item.Path,
                    SourceType = item.SourceType
                });
            }
        }

        foreach (var child in await folder.GetFoldersAsync(cancellationToken).ConfigureAwait(false))
            await CollectScreensAsync(child, result, cancellationToken).ConfigureAwait(false);
    }
}
