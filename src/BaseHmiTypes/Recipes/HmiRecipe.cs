using BaseHmiTypes.Common;

namespace BaseHmiTypes.Recipes;

public sealed class HmiRecipe : IHmiObject
{
    public HmiMultilingualText? DisplayName { get; set; }
    public HmiMultilingualText? InfoText { get; set; }
    public string? Name { get; set; }

    public string? Comment { get; set; }

    public DateTime? LastModified { get; set; }

    public IList<HmiRecipeParameter> Parameters { get; } = new List<HmiRecipeParameter>();

    public IList<HmiRecipeDataSet> DataSets { get; } = new List<HmiRecipeDataSet>();
}

public sealed class HmiRecipeParameter : IHmiObject
{
    public HmiMultilingualText? DisplayName { get; set; }
    public HmiMultilingualText? InfoText { get; set; }
    public int? SourceIndex { get; set; }
    public int? SourceElementId { get; set; }
    public string? DefaultValue { get; set; }
    public int? DecimalPlaces { get; set; }
    public int? MaximumLength { get; set; }
    public int? TagArrayCount { get; set; }
    public bool? Required { get; set; }
    public bool? Unique { get; set; }
    public bool? Indexed { get; set; }

    public string? Name { get; set; }

    public string? Tag { get; set; }

    public string? DataType { get; set; }

    public string? Unit { get; set; }

    public string? MinimumValue { get; set; }

    public string? MaximumValue { get; set; }

    public string? Comment { get; set; }
}

public sealed class HmiRecipeDataSet : IHmiObject
{
    public HmiMultilingualText? DisplayName { get; set; }
    public int? SourceNumber { get; set; }
    public string? Name { get; set; }

    public IDictionary<string, string?> Values { get; } = new Dictionary<string, string?>(StringComparer.OrdinalIgnoreCase);
}
