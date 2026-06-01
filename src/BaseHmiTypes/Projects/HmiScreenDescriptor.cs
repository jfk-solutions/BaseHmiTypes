namespace BaseHmiTypes.Projects;

public class HmiScreenDescriptor : HmiProjectItemDescriptor
{
    public string? DisplayName { get; set; }

    public HmiScreenDescriptor()
    {
        Kind = HmiProjectItemKind.Screen;
        FolderType = HmiProjectFolderType.Screens;
    }
}
