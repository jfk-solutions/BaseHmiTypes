using BaseHmiTypes.Alarms;
using BaseHmiTypes.Connections;
using BaseHmiTypes.Cycles;
using BaseHmiTypes.DataLogging;
using BaseHmiTypes.Images;
using BaseHmiTypes.Recipes;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Scripts;
using BaseHmiTypes.Tags;
using BaseHmiTypes.TextGraphicLists;

namespace BaseHmiTypes.Projects;

public interface IHmiProject :
    IHmiProjectFolder,
    IHmiScreenProvider,
    IHmiFaceplateProvider,
    IHmiTagProvider,
    IHmiScriptProvider,
    IHmiTextListProvider,
    IHmiGraphicListProvider,
    IHmiImageProvider,
    IHmiCycleProvider,
    IHmiAlarmProvider,
    IHmiConnectionProvider,
    IHmiRecipeProvider,
    IHmiDataLogProvider
{
    HmiProjectInfo Info { get; }
}

public interface IHmiProjectFolder
{
    string? Id { get; }

    string Name { get; }

    string Path { get; }

    HmiProjectFolderType FolderType { get; }

    IReadOnlyList<IHmiProjectFolder> Folders { get; }

    IReadOnlyList<IHmiProjectItemDescriptor> Items { get; }

    ValueTask<IReadOnlyList<IHmiProjectFolder>> GetFoldersAsync(
        CancellationToken cancellationToken = default);

    ValueTask<IReadOnlyList<IHmiProjectItemDescriptor>> GetItemsAsync(
        CancellationToken cancellationToken = default);
}

public interface IHmiProjectItemDescriptor
{
    string Id { get; }

    string Name { get; }

    string Path { get; }

    HmiProjectItemKind Kind { get; }

    HmiProjectFolderType FolderType { get; }

    string? SourceType { get; }
}

public interface IHmiScreenProvider
{
    ValueTask<HmiScreenBase?> GetScreenAsync(string id, CancellationToken cancellationToken = default);
}

public interface IHmiFaceplateProvider
{
    ValueTask<HmiFaceplateType?> GetFaceplateAsync(string id, CancellationToken cancellationToken = default);

    ValueTask<HmiFaceplateType?> GetFaceplateAsync(string name, string version, CancellationToken cancellationToken = default);
}

public interface IHmiTagProvider
{
    ValueTask<HmiTagTable?> GetTagTableAsync(string id, CancellationToken cancellationToken = default);
}

public interface IHmiScriptProvider
{
    ValueTask<HmiScript?> GetScriptAsync(string id, CancellationToken cancellationToken = default);
}

public interface IHmiTextListProvider
{
    ValueTask<HmiTextList?> GetTextListAsync(string id, CancellationToken cancellationToken = default);
}

public interface IHmiGraphicListProvider
{
    ValueTask<HmiGraphicList?> GetGraphicListAsync(string id, CancellationToken cancellationToken = default);
}

public interface IHmiImageProvider
{
    ValueTask<HmiImage?> GetImageAsync(string id, CancellationToken cancellationToken = default);
}

public interface IHmiCycleProvider
{
    ValueTask<HmiCycle?> GetCycleAsync(string id, CancellationToken cancellationToken = default);
}

public interface IHmiAlarmProvider
{
    ValueTask<HmiAlarmList?> GetAlarmListAsync(string id, CancellationToken cancellationToken = default);
}

public interface IHmiConnectionProvider
{
    ValueTask<HmiConnectionList?> GetConnectionListAsync(string id, CancellationToken cancellationToken = default);
}

public interface IHmiRecipeProvider
{
    ValueTask<HmiRecipe?> GetRecipeAsync(string id, CancellationToken cancellationToken = default);
}

public interface IHmiDataLogProvider
{
    ValueTask<HmiDataLog?> GetDataLogAsync(string id, CancellationToken cancellationToken = default);
}
