namespace BaseHmiTypes.Screens.Base;

public class HmiReferenceObjectSettings
{
    public string? Source { get; set; }

    /// <summary>Gets or sets whether the source display and base object were resolved.</summary>
    public bool? IsResolved { get; set; }

    /// <summary>Gets or sets the project item ID of the resolved global-object display.</summary>
    public string? ResolvedSourceId { get; set; }

    /// <summary>Gets or sets the resolved base object's parser-neutral ID, when present.</summary>
    public string? ResolvedObjectId { get; set; }

    /// <summary>Gets or sets the resolved base object's name.</summary>
    public string? ResolvedObjectName { get; set; }

    /// <summary>
    /// Gets or sets the resolved base-object definition. This is source
    /// configuration, not a materialized reference instance.
    /// </summary>
    public HmiScreenItemBase? ResolvedObject { get; set; }

    public HmiReferenceAnimationMode? AnimationMode { get; set; }

    public bool? ConnectionsLinked { get; set; }

    public bool? SizeLinked { get; set; }

    public bool? ToolTipLinked { get; set; }

    public IList<HmiReferenceParameter> Parameters { get; } = new List<HmiReferenceParameter>();
}
