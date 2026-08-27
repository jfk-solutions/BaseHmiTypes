namespace BaseHmiTypes.Recipes;

public sealed class HmiRecipe : IHmiObject
{
    public string? Name { get; set; }

    public string? Comment { get; set; }

    public DateTime? LastModified { get; set; }

    public IList<HmiRecipeParameter> Parameters { get; } = new List<HmiRecipeParameter>();

    public IList<HmiRecipeDataSet> DataSets { get; } = new List<HmiRecipeDataSet>();
}

public sealed class HmiRecipeParameter : IHmiObject
{
    public int? SourceIndex { get; set; }

    public string? Name { get; set; }

    public string? Tag { get; set; }

    public string? DataType { get; set; }

    public string? Unit { get; set; }

    public string? Comment { get; set; }
}

public sealed class HmiRecipeDataSet : IHmiObject
{
    public string? Name { get; set; }

    public IDictionary<string, string?> Values { get; } = new Dictionary<string, string?>(StringComparer.OrdinalIgnoreCase);
}
