using System.Collections;
using System.Globalization;
using System.Text;
using System.Xml;
using System.Xml.Linq;
using BaseHmiTypes.Common;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Shapes;
using BaseHmiTypes.Screens.Widgets;

namespace BaseHmiTypes.Converters.UnifiedXml;

public sealed class HmiUnifiedXmlDiagnostic
{
    public string Path { get; }
    public string Message { get; }
    internal HmiUnifiedXmlDiagnostic(string path, string message) { Path = path; Message = message; }
}

public sealed class HmiUnifiedXmlExportResult
{
    public string Xml { get; }
    /// <summary>The neutral model cannot certify the full Unified engineering graph.</summary>
    public bool Complete => false;
    public IReadOnlyList<HmiUnifiedXmlDiagnostic> Diagnostics { get; }
    internal HmiUnifiedXmlExportResult(string xml, List<HmiUnifiedXmlDiagnostic> diagnostics)
    { Xml = xml; Diagnostics = diagnostics.AsReadOnly(); }
}

/// <summary>
/// Writes inspection archives using the fixed V21 WinCC Unified XML format contracts.
/// Output is always incomplete: the neutral model has no version-specific coverage proof.
/// No source field or catalog default is used to invent missing engineering values.
/// </summary>
public sealed class HmiScreenToUnifiedXmlConverter
{
    public const string CatalogId = "89ce7b2e33155ea0da70a8cfd76f09798b9a9f9d68c08155a7afb646a76bdd1a";
    public const string Namespace = "urn:s7mcp:wincc-unified:2";
    public const string ContractNamespace = "urn:s7mcp:wincc-unified:2:contract";
    private static readonly XNamespace Ns = Namespace;
    private static readonly XNamespace Contract = ContractNamespace;

    /// <param name="defaultCultureLcid">Explicit language for neutral default-language text (LCID -1 or 0).</param>
    public HmiUnifiedXmlExportResult Convert(HmiScreenBase screen, string deviceName, int? defaultCultureLcid = null)
    {
        if (screen == null) throw new ArgumentNullException(nameof(screen));
        if (string.IsNullOrWhiteSpace(deviceName)) throw new ArgumentException("A device name is required.", nameof(deviceName));
        if (string.IsNullOrWhiteSpace(screen.Name)) throw new ArgumentException("A screen name is required.", nameof(screen));
        if (screen.GetType() != typeof(HmiScreen) || screen.Kind != HmiScreenKind.Screen)
            throw new NotSupportedException("The fixed V21 profile only maps ordinary screens.");
        XmlConvert.VerifyXmlChars(deviceName);
        XmlConvert.VerifyXmlChars(screen.Name);
        var context = new Context(defaultCultureLcid);
        var root = new XElement(Ns + "unified-export",
            new XAttribute(XNamespace.Xmlns + "u", ContractNamespace),
            new XAttribute("version", "2"), new XAttribute("catalog", CatalogId),
            new XAttribute("device", deviceName), new XAttribute("apiVersion", "21.0.0.0"),
            new XAttribute("scope", "screen"), new XAttribute("screen", screen.Name!),
            new XAttribute("coverage", "exposed-openness-graph"), new XAttribute("complete", "false"));
        context.Report("screen", "The neutral model has no complete V21 engineering source mapping; this archive is for inspection and cannot be restored as a complete archive.");
        var element = context.Object(screen, "screen", "t1");
        root.Add(element);
        var mapped = context.Common(screen, element, "screen", false);
        context.Attribute(screen, mapped, element, "Number", "screen-number", "screen", "u16");
        context.Attribute(screen, mapped, element, "BackgroundColor", "back-color", "screen", "color");
        mapped.UnionWith(new[] { "Kind", "Layers" });
        context.Audit(screen, mapped, "screen");
        for (var i = 0; i < screen.Layers.Count; i++)
        {
            var layer = screen.Layers[i];
            var path = "screen.Layers[" + i + "]";
            context.Report(path, "Layer metadata has no released encoding contract; items are flattened in layer order.");
            for (var j = 0; j < layer.Items.Count; j++)
                context.Item(layer.Items[j], element, path + ".Items[" + j + "]");
        }
        // Entitize CR in text and CR/LF/TAB in attributes; never normalize persisted text.
        var text = new StringBuilder();
        using (var writer = XmlWriter.Create(text, new XmlWriterSettings
        { OmitXmlDeclaration = true, Indent = true, NewLineHandling = NewLineHandling.Entitize })) root.WriteTo(writer);
        return new HmiUnifiedXmlExportResult("<?xml version=\"1.0\" encoding=\"utf-8\"?>\n" + text, context.Diagnostics);
    }

    private sealed class Context(int? defaultCultureLcid)
    {
        public readonly List<HmiUnifiedXmlDiagnostic> Diagnostics = [];
        private readonly Dictionary<HmiModelBase, string> identities = [];
        public void Report(string path, string message) => Diagnostics.Add(new(path, message));

        public XElement Object(HmiModelBase model, string tag, string type)
        {
            var id = "o" + (identities.Count + 1).ToString(CultureInfo.InvariantCulture);
            identities.Add(model, id);
            return new XElement(Ns + tag, new XAttribute(Contract + "id", id), new XAttribute(Contract + "type", type));
        }

        public HashSet<string> Common(object model, XElement element, string path, bool item)
        {
            var mapped = new HashSet<string> { "Id", "HmiObjectType" };
            Attribute(model, mapped, element, "Name", "name", path, "string");
            Attribute(model, mapped, element, "Width", "width", path, "u32");
            Attribute(model, mapped, element, "Height", "height", path, "u32");
            if (!item) return mapped;
            foreach (var mapping in new[] { ("X", "left", "i32"), ("Y", "top", "i32"),
                ("Visible", "visible", "bool"), ("Enabled", "enabled", "bool"), ("Opacity", "opacity", "single"),
                ("RotationAngle", "rotation-angle", "i16"), ("RotationCenterX", "rotation-center-x", "single"),
                ("RotationCenterY", "rotation-center-y", "single"), ("TabIndex", "tab-index", "u16"),
                ("BackgroundColor", "back-color", "color"), ("AlternateBackgroundColor", "alternate-back-color", "color") })
                Attribute(model, mapped, element, mapping.Item1, mapping.Item2, path, mapping.Item3);
            return mapped;
        }

        public void Item(HmiScreenItemBase item, XElement parent, string path)
        {
            if (identities.TryGetValue(item, out var id))
            { parent.Add(new XElement(Contract + "ref", new XAttribute("ref", id))); return; }
            var type = item.GetType();
            var tag = type == typeof(HmiButton) ? "button" : type == typeof(HmiTextBox) ? "text-box" : type == typeof(HmiGraphicView) ? "graphic-view" : null;
            if (tag == null) { Report(path, "Unsupported control type: " + type.Name); return; }
            var element = Object(item, tag, tag == "button" ? "t9" : tag == "text-box" ? "t14" : "t6");
            parent.Add(element);
            var mapped = Common(item, element, path, true);
            if (tag != "graphic-view")
            {
                foreach (var mapping in new[] { ("ForegroundColor", "fore-color", "color"), ("BorderColor", "border-color", "color"),
                    ("AlternateBorderColor", "alternate-border-color", "color"), ("BorderWidth", "border-width", "byte") })
                    Attribute(item, mapped, element, mapping.Item1, mapping.Item2, path, mapping.Item3);
                Part(item, mapped, element, "Font", path);
                if (tag == "text-box") Attribute(item, mapped, element, "ReadOnly", "read-only", path, "bool");
            }
            else Attribute(item, mapped, element, "Source", "graphic", path, "string");
            Part(item, mapped, element, "Padding", path);
            // Parts with attributes must precede text children.
            if (tag != "graphic-view") Text(item, mapped, element, "Text", "text", path);
            if (tag == "button") Text(item, mapped, element, "AlternateText", "alternate-text", path);
            Text(item, mapped, element, "ToolTipText", "tool-tip-text", path);
            Audit(item, mapped, path);
        }

        private object? Value(object? value, string path)
        {
            if (value == null) return null;
            var kind = value.GetType().GetProperty("Kind");
            if (kind == null || kind.PropertyType != typeof(HmiPropertyKind)) return value;
            if ((HmiPropertyKind)kind.GetValue(value)! != HmiPropertyKind.Static)
            { Report(path, "Dynamic/default properties require a semantic mapping; no static fallback was exported."); return null; }
            return value.GetType().GetProperty("StaticValue")!.GetValue(value);
        }

        public void Attribute(object model, HashSet<string> mapped, XElement element, string property, string alias, string path, string codec)
        {
            mapped.Add(property);
            var value = Value(model.GetType().GetProperty(property)?.GetValue(model), path + "." + property);
            if (value == null) return;
            try
            {
                string lexical;
                if (codec == "color")
                {
                    var color = (HmiColor)value;
                    lexical = "#" + color.Red.ToString("X2") + color.Green.ToString("X2") + color.Blue.ToString("X2") + (color.Alpha == 255 ? "" : color.Alpha.ToString("X2"));
                }
                else if (codec == "bool") lexical = (bool)value ? "True" : "False";
                else if (codec == "string") lexical = XmlConvert.VerifyXmlChars((string)value);
                else
                {
                    var number = System.Convert.ToDouble(value, CultureInfo.InvariantCulture);
                    if (codec == "single")
                    {
                        var single = (float)number;
                        if (!double.IsNaN(number) && (double)single != number) throw new ArgumentException("Value is not exactly representable as System.Single.");
                        lexical = single.ToString("R", CultureInfo.InvariantCulture);
                    }
                    else
                    {
                        var min = codec == "i32" ? int.MinValue : codec == "i16" ? short.MinValue : 0d;
                        double max = codec == "u32" ? uint.MaxValue : codec == "i32" ? int.MaxValue : codec == "i16" ? short.MaxValue : codec == "u16" ? ushort.MaxValue : byte.MaxValue;
                        if (double.IsNaN(number) || number < min || number > max || Math.Truncate(number) != number)
                            throw new ArgumentException("Value is outside the exact " + codec + " integer range.");
                        lexical = number.ToString("0", CultureInfo.InvariantCulture);
                    }
                }
                element.SetAttributeValue(alias, lexical);
            }
            catch (Exception exception) when (exception is ArgumentException || exception is XmlException || exception is InvalidCastException || exception is FormatException || exception is OverflowException)
            { Report(path + "." + property, exception.Message); }
        }

        private void Part(object owner, HashSet<string> mapped, XElement element, string property, string path)
        {
            mapped.Add(property);
            var part = owner.GetType().GetProperty(property)?.GetValue(owner);
            if (part == null) return;
            var fields = new HashSet<string>();
            if (property == "Padding")
                foreach (var side in new[] { "Left", "Top", "Right", "Bottom" })
                    Attribute(part, fields, element, side, "padding-" + side.ToLowerInvariant(), path + ".Padding", "i32");
            else
            {
                // The font family is a Unified enum, not an arbitrary CSS font name.
                fields.Add("Name");
                var name = Value(((HmiFont)part).Name, path + ".Font.Name") as string;
                if (name == "Arial" || name == "SiemensSans") element.SetAttributeValue("font-family", name);
                else if (name != null) Report(path + ".Font.Name", "Unmapped Unified font enum: " + name);
                foreach (var mapping in new[] { ("Size", "font-size", "single"), ("Italic", "font-italic", "bool"),
                    ("Underline", "font-underline", "bool"), ("Strikethrough", "font-strike-out", "bool") })
                    Attribute(part, fields, element, mapping.Item1, mapping.Item2, path + ".Font", mapping.Item3);
            }
            Audit(part, fields, path + "." + property);
        }

        private void Text(object model, HashSet<string> mapped, XElement element, string property, string alias, string path)
        {
            mapped.Add(property);
            var text = Value(model.GetType().GetProperty(property)?.GetValue(model), path + "." + property) as HmiMultilingualText;
            if (text == null) return;
            var wrapper = new XElement(Ns + alias);
            element.Add(wrapper); // Explicit empty wrapper suppresses a catalog blank-language template.
            foreach (var lcid in text.Texts.Keys.Concat(text.FormattedTexts.Keys).Distinct())
            {
                try
                {
                    var effective = lcid <= 0 ? defaultCultureLcid : lcid;
                    if (!effective.HasValue || effective <= 0) throw new ArgumentException("Default-language text requires an explicit defaultCultureLcid.");
                    var culture = CultureInfo.GetCultureInfo(effective.Value).Name;
                    var value = text.FormattedTexts.TryGetValue(lcid, out var formatted) ? formatted : text.Texts[lcid];
                    XmlConvert.VerifyXmlChars(value);
                    if (wrapper.Elements().Any(child => (string?)child.Attribute("lang") == culture))
                        throw new ArgumentException("Multiple source language keys map to " + culture + ".");
                    wrapper.Add(new XElement(Ns + "multilingual-text-item", new XAttribute(Contract + "type", "t3"),
                        new XAttribute("lang", culture), new XAttribute("text", value)));
                }
                catch (Exception exception) when (exception is ArgumentException || exception is XmlException)
                { Report(path + "." + property + "[" + lcid + "]", exception.Message); }
            }
            if (text.Parts.Count > 0) Report(path + "." + property + ".Parts", "Structured text parts have no mapping.");
            if (text.SourceDefaultLanguageId.HasValue || text.CategoryTypeId != 0 || text.CategorySubtype != null)
                Report(path + "." + property, "Native text category/default-language metadata has no mapping.");
        }

        public void Audit(object model, HashSet<string> mapped, string path)
        {
            foreach (var property in model.GetType().GetProperties().OrderBy(p => p.Name, StringComparer.Ordinal))
            {
                if (mapped.Contains(property.Name) || property.GetIndexParameters().Length != 0) continue;
                var value = property.GetValue(model);
                if (value == null || value is ICollection collection && collection.Count == 0) continue;
                Report(path + "." + property.Name, "No released semantic mapping for this populated field.");
            }
        }
    }
}
