namespace BaseHmiTypes.Common;

public enum HmiTextPartKind
{
    Literal,
    NumericVariable,
    StringVariable,
    DateTimeVariable
}

public enum HmiTextFillMode
{
    None,
    Zero,
    Space
}

/// <summary>
/// Represents one ordered part of a text that combines literal content with
/// dynamic variables. Expressions are preserved as inert source text and are
/// not evaluated by BaseHmiTypes.
/// </summary>
public sealed class HmiTextPart
{
    public HmiTextPartKind Kind { get; set; }

    public string SourceText { get; set; } = string.Empty;

    public string? Text { get; set; }

    public string? Expression { get; set; }

    public bool IsLiteral { get; set; }

    public int? FieldLength { get; set; }

    public bool UseRightmostCharacters { get; set; }

    public bool ShowTruncationIndicator { get; set; }

    public HmiTextFillMode FillMode { get; set; }

    public int? DigitsAfterDecimal { get; set; }

    public string? Format { get; set; }

    public string? PreviewText { get; set; }
}
