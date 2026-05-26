namespace BaseHmiTypes.Projects;

public class HmiScreenDescriptor
{
    public required string Id { get; init; }

    public string? Name { get; init; }

    public string? DisplayName { get; init; }

    public string? SourceType { get; init; }
}
