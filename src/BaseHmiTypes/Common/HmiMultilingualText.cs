using System.Globalization;
using System.Xml;
using System.Xml.Linq;

namespace BaseHmiTypes.Common;

public sealed class HmiMultilingualText
{
    public IDictionary<int, string> Texts { get; } = new Dictionary<int, string>();

    public IDictionary<int, string> FormattedTexts { get; } = new Dictionary<int, string>();

    public IDictionary<int, IList<HmiTextPart>> Parts { get; } = new Dictionary<int, IList<HmiTextPart>>();

    public int CategoryTypeId { get; set; }

    public string? CategorySubtype { get; set; }

    public static HmiMultilingualText FromText(string? text, int cultureLcid = -1)
    {
        var result = new HmiMultilingualText();
        result.Texts[cultureLcid] = text ?? string.Empty;
        return result;
    }

    public string GetText(CultureInfo? cultureInfo)
    {
        return GetCultureValue(Texts, cultureInfo) ?? GetDefaultText();
    }

    public string GetFormattedText(CultureInfo? cultureInfo)
    {
        return GetCultureValue(FormattedTexts, cultureInfo) ?? string.Empty;
    }

    public string GetDisplayText(CultureInfo? cultureInfo)
    {
        var formattedText = GetFormattedText(cultureInfo);
        if (!string.IsNullOrWhiteSpace(formattedText))
            return ExtractFormattedTextBody(formattedText);

        return GetText(cultureInfo);
    }

    public string GetFormattedTextBody(CultureInfo? cultureInfo)
    {
        return ExtractFormattedTextBody(GetFormattedText(cultureInfo));
    }

    public IReadOnlyList<HmiTextPart> GetParts(CultureInfo? cultureInfo)
    {
        if (Parts.Count == 0)
            return Array.Empty<HmiTextPart>();

        if (cultureInfo != null && Parts.TryGetValue(cultureInfo.LCID, out var cultureParts))
            return cultureParts as IReadOnlyList<HmiTextPart> ?? cultureParts.ToArray();

        if (Parts.TryGetValue(-1, out var invariantParts))
            return invariantParts as IReadOnlyList<HmiTextPart> ?? invariantParts.ToArray();

        if (Parts.TryGetValue(0, out var defaultParts))
            return defaultParts as IReadOnlyList<HmiTextPart> ?? defaultParts.ToArray();

        var first = Parts.First().Value;
        return first as IReadOnlyList<HmiTextPart> ?? first.ToArray();
    }

    public string GetDefaultText()
    {
        return Texts.Count == 0 ? string.Empty : Texts.First().Value ?? string.Empty;
    }

    public override string ToString()
    {
        return GetDefaultText();
    }

    private static string? GetCultureValue(IDictionary<int, string> values, CultureInfo? cultureInfo)
    {
        if (values.Count == 0)
            return null;

        if (cultureInfo != null && values.TryGetValue(cultureInfo.LCID, out var cultureValue))
            return cultureValue;

        if (values.TryGetValue(-1, out var invariantValue))
            return invariantValue;

        if (values.TryGetValue(0, out var defaultValue))
            return defaultValue;

        return values.First().Value ?? string.Empty;
    }

    private static string ExtractFormattedTextBody(string? formattedText)
    {
        if (string.IsNullOrWhiteSpace(formattedText))
            return string.Empty;

        try
        {
            using var reader = XmlReader.Create(
                new StringReader(formattedText!),
                new XmlReaderSettings { DtdProcessing = DtdProcessing.Prohibit, XmlResolver = null });
            var document = XDocument.Load(reader, LoadOptions.PreserveWhitespace);
            var body = document
                .Descendants()
                .FirstOrDefault(element => string.Equals(element.Name.LocalName, "body", StringComparison.OrdinalIgnoreCase));

            if (body == null)
                return formattedText!;

            return string.Concat(body.Nodes().Select(node => RemoveNamespaces(node).ToString(SaveOptions.DisableFormatting)));
        }
        catch (XmlException)
        {
            return formattedText!;
        }
    }

    private static XNode RemoveNamespaces(XNode node)
    {
        if (node is XElement element)
        {
            return new XElement(
                element.Name.LocalName,
                element.Attributes()
                    .Where(attribute => !attribute.IsNamespaceDeclaration)
                    .Select(attribute => new XAttribute(attribute.Name.LocalName, attribute.Value)),
                element.Nodes().Select(RemoveNamespaces));
        }

        return node;
    }
}
