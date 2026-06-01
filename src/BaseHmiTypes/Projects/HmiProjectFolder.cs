namespace BaseHmiTypes.Projects;

public class HmiProjectFolder : IHmiProjectFolder
{
    private readonly Func<CancellationToken, ValueTask<IReadOnlyList<IHmiProjectFolder>>> getFolders;
    private readonly Func<CancellationToken, ValueTask<IReadOnlyList<IHmiProjectItemDescriptor>>> getItems;

    public HmiProjectFolder(
        HmiProjectFolderType folderType,
        string name,
        string? id = null,
        string? path = null,
        Func<CancellationToken, ValueTask<IReadOnlyList<IHmiProjectFolder>>>? getFolders = null,
        Func<CancellationToken, ValueTask<IReadOnlyList<IHmiProjectItemDescriptor>>>? getItems = null)
    {
        FolderType = folderType;
        Name = name;
        Id = id;
        Path = path ?? name;
        this.getFolders = getFolders ?? (_ => new ValueTask<IReadOnlyList<IHmiProjectFolder>>(Array.Empty<IHmiProjectFolder>()));
        this.getItems = getItems ?? (_ => new ValueTask<IReadOnlyList<IHmiProjectItemDescriptor>>(Array.Empty<IHmiProjectItemDescriptor>()));
    }

    public string? Id { get; }

    public string Name { get; }

    public string Path { get; }

    public HmiProjectFolderType FolderType { get; }

    public IReadOnlyList<IHmiProjectFolder> Folders => GetFoldersAsync().AsTask().GetAwaiter().GetResult();

    public IReadOnlyList<IHmiProjectItemDescriptor> Items => GetItemsAsync().AsTask().GetAwaiter().GetResult();

    public ValueTask<IReadOnlyList<IHmiProjectFolder>> GetFoldersAsync(CancellationToken cancellationToken = default)
    {
        return getFolders(cancellationToken);
    }

    public ValueTask<IReadOnlyList<IHmiProjectItemDescriptor>> GetItemsAsync(CancellationToken cancellationToken = default)
    {
        return getItems(cancellationToken);
    }
}
