using BaseHmiTypes.Screens;

namespace BaseHmiTypes.Projects;

public abstract class HmiProjectBase : IHmiProject
{
    public HmiProjectInfo Info { get; } = new();

    public abstract ValueTask<IReadOnlyList<HmiScreenDescriptor>> GetScreensAsync(
        CancellationToken cancellationToken = default);

    public abstract ValueTask<HmiScreen?> GetScreenAsync(
        string screenId,
        CancellationToken cancellationToken = default);
}
