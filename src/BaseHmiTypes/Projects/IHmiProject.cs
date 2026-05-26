using BaseHmiTypes.Screens;

namespace BaseHmiTypes.Projects;

public interface IHmiProject
{
    HmiProjectInfo Info { get; }

    ValueTask<IReadOnlyList<HmiScreenDescriptor>> GetScreensAsync(
        CancellationToken cancellationToken = default);

    ValueTask<HmiScreen?> GetScreenAsync(
        string screenId,
        CancellationToken cancellationToken = default);
}
