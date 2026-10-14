using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using System.Xml;
using System.Xml.Linq;
using BaseHmiTypes.Common;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Shapes;
using BaseHmiTypes.Screens.Widgets;
using BaseHmiTypes.Scripts;

namespace BaseHmiTypes.Converters.UnifiedXml;

public sealed class HmiUnifiedXmlImportResult
{
    public HmiScreen Screen { get; }
    public bool SourceComplete { get; }
    public IReadOnlyList<HmiUnifiedXmlDiagnostic> Diagnostics { get; }
    internal HmiUnifiedXmlImportResult(HmiScreen screen, bool sourceComplete, List<HmiUnifiedXmlDiagnostic> diagnostics)
    { Screen = screen; SourceComplete = sourceComplete; Diagnostics = diagnostics.AsReadOnly(); }
}

/// <summary>Reads fixed V21 XML v2 screen archives, including incomplete inspection exports.</summary>
public sealed class HmiUnifiedXmlToScreenConverter
{
    private static readonly XNamespace N = HmiScreenToUnifiedXmlConverter.Namespace;
    private static readonly XNamespace U = HmiScreenToUnifiedXmlConverter.ContractNamespace;
    private static readonly Lazy<XElement> Catalog = new(() => { using var stream = HmiUnifiedXmlCatalog.OpenV21(); return XDocument.Load(stream).Root!; });
    private static readonly Dictionary<string, string> Names = new(StringComparer.Ordinal)
    {
        ["Name"] = "Name", ["Width"] = "Width", ["Height"] = "Height", ["ScreenNumber"] = "Number",
        ["Left"] = "X", ["Top"] = "Y", ["Enabled"] = "Enabled", ["Visible"] = "Visible",
        ["BackColor"] = "BackgroundColor", ["AlternateBackColor"] = "AlternateBackgroundColor",
        ["ForeColor"] = "ForegroundColor", ["BorderColor"] = "BorderColor", ["AlternateBorderColor"] = "AlternateBorderColor",
        ["BorderWidth"] = "BorderWidth", ["Opacity"] = "Opacity", ["RotationAngle"] = "RotationAngle",
        ["RotationCenterX"] = "RotationCenterX", ["RotationCenterY"] = "RotationCenterY", ["TabIndex"] = "TabIndex",
        ["ReadOnly"] = "ReadOnly", ["Graphic"] = "Source", ["HorizontalTextAlignment"] = "HorizontalAlignment",
        ["VerticalTextAlignment"] = "VerticalAlignment", ["BackFillPattern"] = "FillPattern"
    };

    public HmiUnifiedXmlImportResult Convert(string xml)
    {
        if (xml == null) throw new ArgumentNullException(nameof(xml));
        using var reader = XmlReader.Create(new StringReader(xml), new XmlReaderSettings
        { DtdProcessing = DtdProcessing.Prohibit, XmlResolver = null, MaxCharactersInDocument = 16 * 1024 * 1024 });
        var document = XDocument.Load(reader, LoadOptions.PreserveWhitespace);
        var root = document.Root!;
        if (root.Name != N + "unified-export" || (string?)root.Attribute("version") != "2" ||
            (string?)root.Attribute("scope") != "screen" || (string?)root.Attribute("catalog") != HmiScreenToUnifiedXmlConverter.CatalogId ||
            (string?)root.Attribute("apiVersion") != "21.0.0.0")
            throw new NotSupportedException("Expected a screen-scope XML v2 archive using the fixed V21 catalog.");
        var complete = (string?)root.Attribute("complete");
        if (complete != "true" && complete != "false") throw new FormatException("Invalid archive complete flag.");
        if (root.Elements().Count() != 1 || root.Elements().Single().Name != N + "screen") throw new FormatException("Exactly one screen root is required.");
        var source = root.Elements().Single();
        if (string.IsNullOrWhiteSpace((string?)source.Attribute("name")) || (string?)source.Attribute("name") != (string?)root.Attribute("screen"))
            throw new FormatException("Archive and screen names must agree.");
        var context = new Context();
        var ids = new Dictionary<string, XElement>(StringComparer.Ordinal);
        foreach (var node in root.Descendants())
        {
            if (node.Attribute(U + "id") is XAttribute id)
            {
                if (id.Value.Length == 0 || ids.ContainsKey(id.Value)) throw new FormatException("Duplicate or empty object ID.");
                ids.Add(id.Value, node);
            }
        }
        foreach (var reference in root.Descendants(U + "ref"))
            if (!ids.ContainsKey((string?)reference.Attribute("ref") ?? "")) throw new FormatException("Dangling object reference.");
        var screen = new HmiScreen { SourceFormat = "WinCCUnifiedXmlV2", SourceData = Encoding.UTF8.GetBytes(xml) };
        context.Map(source, screen, "screen");
        var layer = new HmiLayer { Name = "Unified screen items" };
        screen.Layers.Add(layer);
        var nodes = source.Elements().SelectMany(e => e.Name == N + "screen-items" ? e.Elements() : new[] { e })
            .Where(e => e.Name == N + "button" || e.Name == N + "text-box" || e.Name == N + "graphic-view" || e.Name == U + "ref" || e.Parent != source).ToArray();
        // Pre-create definitions so forward references reuse the same model instance.
        var items = new Dictionary<XElement, HmiScreenItemBase>();
        foreach (var node in nodes.Where(e => e.Name != U + "ref"))
        {
            HmiScreenItemBase? item = node.Name == N + "button" ? new HmiButton() : node.Name == N + "text-box" ? new HmiTextBox() : node.Name == N + "graphic-view" ? new HmiGraphicView() : null;
            if (item == null) { context.Report("screen." + node.Name.LocalName, "Unsupported control retained in screen SourceData."); continue; }
            items.Add(node, item);
            item.SourceFormat = "WinCCUnifiedXmlV2";
            item.SourceData = Encoding.UTF8.GetBytes(node.ToString(SaveOptions.DisableFormatting));
            context.Map(node, item, "screen." + node.Name.LocalName);
        }
        foreach (var node in nodes)
        {
            var target = node.Name == U + "ref" ? ids[(string)node.Attribute("ref")!] : node;
            if (items.TryGetValue(target, out var item)) layer.Items.Add(item);
            else context.Report("screen.screen-items", "Reference or control cannot be represented; retained in screen SourceData.");
        }
        if (complete == "false") context.Report("screen", "The source archive is marked incomplete.");
        return new(screen, complete == "true", context.Diagnostics);
    }

    private sealed class Context
    {
        public readonly List<HmiUnifiedXmlDiagnostic> Diagnostics = [];
        private readonly Dictionary<string, XElement> contracts = Catalog.Value.Element(U + "types")!.Elements().ToDictionary(e => (string)e.Attribute("id")!, StringComparer.Ordinal);
        public void Report(string path, string message) => Diagnostics.Add(new(path, message));

        private XElement Contract(XElement node)
        {
            if (node.Name.Namespace != N) throw new FormatException("Invalid object namespace.");
            if (node.Attribute(U + "type") is XAttribute marker)
            {
                if (!contracts.TryGetValue(marker.Value, out var type) || (string?)type.Attribute("tag") != node.Name.LocalName)
                    throw new FormatException("Unknown or incompatible contract selector.");
                return type;
            }
            var matches = contracts.Values.Where(c => (string?)c.Attribute("tag") == node.Name.LocalName).ToArray();
            if (matches.Length != 1) throw new FormatException("Missing or ambiguous contract selector for " + node.Name.LocalName);
            return matches[0];
        }

        public void Map(XElement node, HmiScreenModelBase model, string path)
        {
            var contract = Contract(node);
            model.Id = (string?)node.Attribute(U + "id");
            var source = model is HmiScreenBase s ? s.SourceProperties : ((HmiScreenItemBase)model).SourceProperties;
            var allowed = new HashSet<string>(StringComparer.Ordinal);
            foreach (var property in contract.Elements(U + "property"))
            {
                var name = (string)property.Attribute("name")!;
                var alias = (string)property.Attribute("xml")!;
                allowed.Add(alias);
                var lexical = (string?)node.Attribute(alias) ?? property.Element(U + "default")?.Value;
                if (lexical == null)
                {
                    if ((string?)property.Element(U + "value")?.Attribute("kind") != "null") Report(path + "." + name, "Required value is absent and has no catalog default.");
                    continue;
                }
                source[name] = lexical;
                var value = Decode(lexical, property.Element(U + "value")!);
                if (!Names.TryGetValue(name, out var target) || !Assign(model, target, value))
                    Report(path + "." + name, "Field retained in SourceProperties; no neutral-model mapping.");
            }
            foreach (var member in contract.Elements(U + "member"))
            {
                var name = (string)member.Attribute("name")!;
                var alias = (string)member.Attribute("xml")!;
                if (member.Attribute("attribute-map") is XAttribute mappings)
                {
                    var childContract = contracts[(string)member.Attribute("attribute-type")!];
                    var part = new XElement(N + alias, new XAttribute(U + "type", (string)childContract.Attribute("id")!));
                    var explicitParts = node.Elements(N + alias).ToArray();
                    if (explicitParts.Length > 1) throw new FormatException("Duplicate singleton part.");
                    if (explicitParts.Length == 1) part = explicitParts[0];
                    foreach (var pair in mappings.Value.Split(' '))
                    {
                        var fields = pair.Split('='); allowed.Add(fields[1]);
                        if (node.Attribute(fields[1]) is XAttribute attribute)
                        {
                            if (explicitParts.Length != 0) throw new FormatException("Conflicting promoted and explicit part.");
                            part.SetAttributeValue(fields[0], attribute.Value);
                        }
                    }
                    MapPart(part, childContract, model, name, source, path);
                }
                else if (name is "Text" or "AlternateText" or "ToolTipText")
                {
                    var elements = node.Elements(N + alias).ToArray();
                    if (elements.Length > 1) throw new FormatException("Duplicate text singleton.");
                    var textNode = elements.SingleOrDefault() ?? member.Element(U + "default-element")?.Elements().SingleOrDefault();
                    if (textNode != null && !Assign(model, name, ReadText(textNode, path + "." + name))) Report(path + "." + name, "Text has no neutral-model property.");
                }
            }
            foreach (var handler in node.Elements(N + "event-handlers").SelectMany(e => e.Elements()))
            {
                if (handler.Name != N + "button-event-handler" && handler.Name != N + "screen-event-handler") { Report(path + ".Events", "Unsupported event retained in SourceData."); continue; }
                Contract(handler);
                var script = handler.Element(N + "script");
                var code = script?.Element(N + "script-code");
                var eventName = (string?)handler.Attribute("event-type");
                if (code == null || eventName == null) { Report(path + ".Events", "Event has no readable script or event type."); continue; }
                Contract(script!);
                var events = model is HmiScreenBase screen ? screen.Events : ((HmiScreenItemBase)model).Events;
                events.Add(new HmiEventBinding { EventName = eventName, Action = new HmiTextScriptAction { Language = HmiScriptLanguage.JavaScript, SourceCode = ReadCode(code) } });
                // Script globals, async state and trigger settings are kept in SourceData.
                Report(path + ".Events." + eventName, "Event script mapped; additional engineering settings remain in SourceData.");
            }
            var dynamized = new HashSet<string>(StringComparer.Ordinal);
            foreach (var dynamic in node.Elements(N + "dynamizations").SelectMany(e => e.Elements()))
            {
                if (dynamic.Name != N + "script-dynamization") { Report(path + ".Dynamizations", "Unsupported dynamization retained in SourceData."); continue; }
                Contract(dynamic);
                var name = (string?)dynamic.Attribute("property-name") ?? throw new FormatException("Missing dynamized property name.");
                if (!dynamized.Add(name)) throw new FormatException("Duplicate property dynamization.");
                var target = name == "Text" ? "Text" : Names.TryGetValue(name, out var mapped) ? mapped : null;
                var property = target == null ? null : model.GetType().GetProperty(target);
                var code = dynamic.Element(N + "script-code");
                if (property == null || !property.PropertyType.IsGenericType || property.PropertyType.GetGenericTypeDefinition() != typeof(HmiProperty<>) || code == null)
                { Report(path + ".Dynamizations." + name, "Unmapped script dynamization retained in SourceData."); continue; }
                var wrapper = Activator.CreateInstance(typeof(HmiScriptProperty<>).MakeGenericType(property.PropertyType.GetGenericArguments()[0]))!;
                var type = wrapper.GetType();
                var previous = property.GetValue(model);
                if (previous != null) type.GetProperty("StaticValue")!.SetValue(wrapper, previous.GetType().GetProperty("StaticValue")!.GetValue(previous));
                type.GetProperty("Script")!.SetValue(wrapper, ReadCode(code));
                type.GetProperty("Language")!.SetValue(wrapper, HmiScriptLanguage.JavaScript);
                var trigger = dynamic.Element(N + "trigger");
                if (trigger != null) Contract(trigger);
                if (trigger != null && (string?)trigger.Attribute("type") == "Tags")
                {
                    var tagTrigger = new HmiTagTrigger();
                    foreach (var tag in trigger.Elements(N + "tag")) tagTrigger.TagNames.Add((string?)tag.Attribute("name") ?? throw new FormatException("Missing trigger tag name."));
                    ((IList<HmiTrigger>)type.GetProperty("Triggers")!.GetValue(wrapper)!).Add(tagTrigger);
                }
                property.SetValue(model, wrapper);
                Report(path + ".Dynamizations." + name, "Script and tag triggers mapped; other engineering settings remain in SourceData.");
            }
            foreach (var attribute in node.Attributes().Where(a => !a.IsNamespaceDeclaration && a.Name != U + "id" && a.Name != U + "type"))
                if (attribute.Name.Namespace != XNamespace.None || !allowed.Contains(attribute.Name.LocalName)) Report(path + ".@" + attribute.Name, "Unknown attribute retained in SourceData.");
            var handled = new HashSet<string> { "font", "padding", "text", "alternate-text", "tool-tip-text", "event-handlers", "dynamizations" };
            if (model is HmiScreenBase) handled.UnionWith(new[] { "button", "text-box", "graphic-view", "screen-items" });
            foreach (var child in node.Elements())
                if (child.Name != U + "ref" && (child.Name.Namespace != N || !handled.Contains(child.Name.LocalName)))
                    Report(path + "." + child.Name.LocalName, "Unsupported member retained in SourceData.");
        }

        private void MapPart(XElement node, XElement contract, object owner, string role, IDictionary<string, string> source, string path)
        {
            if (node.Attribute(U + "type") is XAttribute marker && marker.Value != (string?)contract.Attribute("id")) throw new FormatException("Incompatible part contract selector.");
            object? part = role == "Font" ? new HmiFont() : role == "Padding" ? new HmiThickness() : null;
            var allowed = new HashSet<string>(contract.Elements(U + "property").Select(p => (string)p.Attribute("xml")!), StringComparer.Ordinal);
            foreach (var property in contract.Elements(U + "property"))
            {
                var name = (string)property.Attribute("name")!;
                var lexical = (string?)node.Attribute((string)property.Attribute("xml")!) ?? property.Element(U + "default")?.Value;
                if (lexical == null)
                { Report(path + "." + role + "." + name, "Required part value is absent and has no catalog default."); continue; }
                source[role + "." + name] = lexical;
                var value = Decode(lexical, property.Element(U + "value")!);
                var target = name == "StrikeOut" ? "Strikethrough" : name;
                if (role == "Font" && name == "Weight") { target = "Bold"; value = lexical == "Bold" ? true : lexical == "Normal" ? false : value; }
                if (part == null || !Assign(part, target, value)) Report(path + "." + role + "." + name, "Part field retained in SourceProperties.");
            }
            if (part != null) owner.GetType().GetProperty(role)?.SetValue(owner, part);
            foreach (var attribute in node.Attributes().Where(a => !a.IsNamespaceDeclaration && a.Name != U + "id" && a.Name != U + "type"))
                if (attribute.Name.Namespace != XNamespace.None || !allowed.Contains(attribute.Name.LocalName)) Report(path + "." + role + ".@" + attribute.Name, "Unknown part attribute retained in SourceData.");
            foreach (var child in node.Elements()) Report(path + "." + role + "." + child.Name.LocalName, "Part member retained in SourceData.");
        }

        private HmiMultilingualText ReadText(XElement node, string path)
        {
            Contract(node);
            var result = new HmiMultilingualText();
            foreach (var child in node.Elements())
            {
                if (child.Name != N + "multilingual-text-item") { Report(path, "Unsupported text member retained in SourceData."); continue; }
                Contract(child);
                foreach (var attribute in child.Attributes().Where(a => !a.IsNamespaceDeclaration && a.Name != U + "id" && a.Name != U + "type"))
                    if (attribute.Name != "lang" && attribute.Name != "text") Report(path + ".@" + attribute.Name, "Unknown localized-text attribute retained in SourceData.");
                var lang = (string?)child.Attribute("lang") ?? throw new FormatException("Missing text language.");
                CultureInfo culture;
                try { culture = CultureInfo.GetCultureInfo(lang); }
                catch (CultureNotFoundException) { Report(path, "Unsupported language retained in SourceData: " + lang); continue; }
                if (culture.LCID == 4096) { Report(path, "Language has no stable culture LCID; retained in SourceData: " + lang); continue; }
                if (result.Texts.ContainsKey(culture.LCID)) throw new FormatException("Duplicate text language.");
                var text = (string?)child.Attribute("text") ?? throw new FormatException("Missing localized text.");
                result.Texts.Add(culture.LCID, text);
                // Retain the exact serialized text while allowing the HTML converter to recognize markup.
                if (text.StartsWith("<body", StringComparison.Ordinal)) result.FormattedTexts.Add(culture.LCID, text);
            }
            return result;
        }

        private static string ReadCode(XElement node)
        {
            if (!node.HasElements) return node.Value;
            var value = node.Element(U + "Value");
            if (node.Elements().Count() != 1 || value == null || value.HasElements || (string?)value.Attribute("kind") != "scalar" || (string?)value.Attribute("type") != "System.String") throw new FormatException("Unsupported script payload.");
            if ((string?)value.Attribute("encoding") == "text") return value.Value;
            if ((string?)value.Attribute("encoding") != "utf16le-base64") throw new FormatException("Unsupported script string encoding.");
            var bytes = System.Convert.FromBase64String(value.Value);
            if (bytes.Length % 2 != 0) throw new FormatException("Invalid UTF-16 script payload.");
            var units = new char[bytes.Length / 2];
            for (var i = 0; i < units.Length; i++) units[i] = (char)(bytes[2 * i] | bytes[2 * i + 1] << 8);
            return new string(units);
        }

        private static bool Assign(object model, string name, object value)
        {
            var property = model.GetType().GetProperty(name);
            if (property == null || !property.CanWrite) return false;
            var target = property.PropertyType;
            var wrapped = target.IsGenericType && target.GetGenericTypeDefinition() == typeof(HmiProperty<>);
            if (wrapped) target = target.GetGenericArguments()[0];
            target = Nullable.GetUnderlyingType(target) ?? target;
            object converted;
            if (target.IsInstanceOfType(value)) converted = value;
            else if (target.IsEnum && value is string text && Enum.GetNames(target).Contains(text)) converted = Enum.Parse(target, text, false);
            else if (target == typeof(double) && value is IConvertible) converted = System.Convert.ToDouble(value, CultureInfo.InvariantCulture);
            else if (target == typeof(int) && value is IConvertible && !(value is string)) converted = System.Convert.ToInt32(value, CultureInfo.InvariantCulture);
            else return false;
            if (wrapped)
            {
                var instance = Activator.CreateInstance(typeof(HmiStaticProperty<>).MakeGenericType(target))!;
                instance.GetType().GetProperty("StaticValue")!.SetValue(instance, converted);
                converted = instance;
            }
            property.SetValue(model, converted);
            return true;
        }

        private static object Decode(string lexical, XElement template)
        {
            var type = (string?)template.Attribute("type");
            if ((string?)template.Attribute("kind") == "enum" || type == "System.String") return lexical;
            if (type == "System.Boolean") return lexical == "True" ? true : lexical == "False" ? false : throw new FormatException("Invalid Boolean.");
            if (type == "System.Drawing.Color")
            {
                if (!Regex.IsMatch(lexical, "^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$")) throw new FormatException("Invalid color.");
                byte Channel(int offset) => byte.Parse(lexical.Substring(offset, 2), NumberStyles.HexNumber, CultureInfo.InvariantCulture);
                return new HmiColor(lexical.Length == 9 ? Channel(7) : (byte)255, Channel(1), Channel(3), Channel(5));
            }
            if (type == "System.Single") return float.Parse(lexical, NumberStyles.Float, CultureInfo.InvariantCulture);
            if (type == "System.Double") return double.Parse(lexical, NumberStyles.Float, CultureInfo.InvariantCulture);
            if (!Regex.IsMatch(lexical, "^-?[0-9]+$")) throw new FormatException("Invalid integer.");
            return type switch
            {
                "System.UInt32" => uint.Parse(lexical, CultureInfo.InvariantCulture), "System.UInt16" => ushort.Parse(lexical, CultureInfo.InvariantCulture),
                "System.Int32" => int.Parse(lexical, CultureInfo.InvariantCulture), "System.Int16" => short.Parse(lexical, CultureInfo.InvariantCulture),
                "System.Byte" => byte.Parse(lexical, CultureInfo.InvariantCulture), _ => throw new NotSupportedException("Unsupported value type: " + type)
            };
        }
    }
}
