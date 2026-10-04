using BaseHmiTypes.Common;

namespace BaseHmiTypes.Recipes;

public sealed class HmiRecipe : IHmiObject
{
    public HmiClassicRecipeConfiguration? ClassicConfiguration { get; set; }
    public int? SourceId { get; set; }
    public string? SourceDisplayName { get; set; }
    public string? StoragePath { get; set; }
    public IDictionary<string, HmiRecipeReference> References { get; } = new Dictionary<string, HmiRecipeReference>();

    public HmiMultilingualText? DisplayName { get; set; }
    public HmiMultilingualText? InfoText { get; set; }
    public string? Name { get; set; }

    public string? Comment { get; set; }

    public DateTime? LastModified { get; set; }

    public IList<HmiRecipeParameter> Parameters { get; } = new List<HmiRecipeParameter>();

    public IList<HmiRecipeDataSet> DataSets { get; } = new List<HmiRecipeDataSet>();
    public IList<HmiRecipeTagDeclaration> SourceTagDeclarations { get; } = new List<HmiRecipeTagDeclaration>();
    public IList<HmiRecipePlcDeclaration> SourcePlcDeclarations { get; } = new List<HmiRecipePlcDeclaration>();
}

public enum HmiRecipeCommunicationType { Tags = 0, NoCommunication = 1, RawDataTag = 2 }
public enum HmiRecipeSizeType { Limited = 0, Unlimited = 1 }
public enum HmiRecipeStorageMedia { Database = 0, File = 1, Memory = 2 }

public sealed class HmiClassicRecipeConfiguration
{
    public int? SourceNumber { get; set; }
    public int? MaximumRecordCount { get; set; }
    public string? RecipeVersion { get; set; }
    public HmiRecipeCommunicationType? CommunicationType { get; set; }
    public HmiRecipeSizeType? SizeType { get; set; }
    public HmiRecipeStorageMedia? StorageMedia { get; set; }
    public bool? LastModificationUsed { get; set; }
    public bool? LastUserUsed { get; set; }
    public bool? LogUserAction { get; set; }
    public bool? Offline { get; set; }
    public bool? SignSaving { get; set; }
    public bool? SignTransferring { get; set; }
    public bool? SyncTags { get; set; }
    public bool? SyncTransfer { get; set; }
    public bool? Synchronized { get; set; }
}

public sealed class HmiRecipeReference
{
    public string? SourceId { get; set; }
    public string? Name { get; set; }
}

public sealed class HmiRecipeParameter : IHmiObject
{
    public IDictionary<string, HmiRecipeReference> References { get; } = new Dictionary<string, HmiRecipeReference>();
    public bool? TriggerRedraw { get; set; }
    public string? SourcePlcStartValue { get; set; }
    public string? SourcePlcTypeDefaultStartValue { get; set; }
    public string? SourcePlcStartValueConstantName { get; set; }
    public bool? SourcePlcHasExplicitStartValue { get; set; }
    public HmiMultilingualText? SourcePlcComment { get; set; }
    public HmiMultilingualText? SourceTagComment { get; set; }
    public string? SourceTagStartValue { get; set; }
    public HmiRecipeTagScaling? SourceTagScaling { get; set; }
    public string? SourceTagSubstituteValue { get; set; }
    public int? SourceTagSubstituteValueUsage { get; set; }

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

/// <summary>Configured source tag scaling; no recipe value transformation is implied.</summary>
public sealed class HmiRecipeTagScaling
{
    public bool? LinearScaling { get; set; }
    public double? HmiLow { get; set; }
    public double? HmiHigh { get; set; }
    public double? PlcLow { get; set; }
    public double? PlcHigh { get; set; }
}

/// <summary>Retains source HMI tag parent metadata alongside scalar recipe fields.</summary>
public sealed class HmiRecipeTagDeclaration
{
    public HmiRecipeTagScaling? Scaling { get; set; }
    public string? Name { get; set; }
    public string? DataType { get; set; }
    public HmiMultilingualText? Comment { get; set; }
    public string? StartValue { get; set; }
    public string? SubstituteValue { get; set; }
    public int? SubstituteValueUsage { get; set; }
    public string? MinimumValue { get; set; }
    public string? MaximumValue { get; set; }
}

/// <summary>Retains source parent and sparse declarations alongside scalar recipe fields.</summary>
public sealed class HmiRecipePlcDeclaration
{
    public string? Name { get; set; }
    public string? DataType { get; set; }
    public string? StartValue { get; set; }
    public string? TypeDefaultStartValue { get; set; }
    public string? StartValueConstantName { get; set; }
    public bool? HasExplicitStartValue { get; set; }
    public HmiMultilingualText? Comment { get; set; }
    public IDictionary<string, string> SubelementValues { get; } = new Dictionary<string, string>(StringComparer.Ordinal);
    public IDictionary<string, string> SubelementValueConstantNames { get; } = new Dictionary<string, string>(StringComparer.Ordinal);
    public IDictionary<string, string> TypeDefaultSubelementValues { get; } = new Dictionary<string, string>(StringComparer.Ordinal);
    public IDictionary<string, HmiMultilingualText> SubelementComments { get; } = new Dictionary<string, HmiMultilingualText>(StringComparer.Ordinal);
}

public sealed class HmiRecipeDataSet : IHmiObject
{
    public HmiMultilingualText? DisplayName { get; set; }
    public int? SourceNumber { get; set; }
    public string? Name { get; set; }

    public IDictionary<string, string?> Values { get; } = new Dictionary<string, string?>(StringComparer.OrdinalIgnoreCase);

    public IDictionary<string, string?> SourceValues { get; } = new Dictionary<string, string?>(StringComparer.Ordinal);
}
