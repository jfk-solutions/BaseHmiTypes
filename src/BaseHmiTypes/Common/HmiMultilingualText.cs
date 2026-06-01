using System.Globalization;

namespace BaseHmiTypes.Common;

public sealed class HmiMultilingualText
{
    public IDictionary<int, string> Texts { get; } = new Dictionary<int, string>();

    public IDictionary<int, string> FormattedTexts { get; } = new Dictionary<int, string>();

    public int CategoryTypeId { get; set; }

    public string? CategorySubtype { get; set; }

    public string GetText(CultureInfo? cultureInfo)
    {
        if (cultureInfo == null)
            return GetDefaultText();

        string? text;
        return Texts.TryGetValue(cultureInfo.LCID, out text) ? text : string.Empty;
    }

    public string GetDefaultText()
    {
        return Texts.Count == 0 ? string.Empty : Texts.First().Value ?? string.Empty;
    }

    public override string ToString()
    {
        return GetDefaultText();
    }
}

