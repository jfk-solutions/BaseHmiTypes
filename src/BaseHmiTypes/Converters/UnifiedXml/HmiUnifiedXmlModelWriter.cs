using BaseHmiTypes.Screens.Controls;
using System.Collections;
using System.Globalization;
using System.Xml;
using System.Xml.Linq;
using BaseHmiTypes.Common;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Shapes;
using BaseHmiTypes.Screens.Widgets;
using BaseHmiTypes.Scripts;

namespace BaseHmiTypes.Converters.UnifiedXml;

/// <summary>Writes editable model values against a selected, immutable engineering contract.</summary>
internal sealed class HmiUnifiedXmlModelWriter
{
    private static readonly XNamespace N = HmiScreenToUnifiedXmlConverter.Namespace;
    private static readonly XNamespace U = HmiScreenToUnifiedXmlConverter.ContractNamespace;
    private readonly XElement catalog;
    private readonly XElement[] contracts;
    private readonly List<HmiUnifiedXmlDiagnostic> diagnostics = [];
    private readonly Dictionary<object, string> identities = [];
    private readonly int? culture;
    internal HmiUnifiedXmlModelWriter(string catalogXml, int? defaultCulture)
    {
        using var reader = XmlReader.Create(new StringReader(catalogXml), new XmlReaderSettings { DtdProcessing = DtdProcessing.Prohibit, XmlResolver = null, MaxCharactersInDocument = 16 * 1024 * 1024 });
        catalog = XDocument.Load(reader).Root!;
        if (catalog.Name != U + "catalog" || catalog.Attribute("id") == null) throw new FormatException("Invalid Unified catalog.");
        contracts = catalog.Element(U + "types")!.Elements().ToArray(); culture = defaultCulture;
    }
    private void Report(string path, string message) => diagnostics.Add(new(path, message));
    internal HmiUnifiedXmlExportResult Convert(HmiScreenBase screen, string device)
    {
        Report("screen", "Engineering model export is not yet certified complete.");
        if (screen.Kind != HmiScreenKind.Screen) Report("screen.kind", "Screen kind has no Unified XML mapping.");
        var root = new XElement(N + "unified-export", new XAttribute(XNamespace.Xmlns + "u", U),
            new XAttribute("version", "2"),
            screen.EngineeringApiVersion == null ? null : new XAttribute("apiVersion", screen.EngineeringApiVersion),
            new XAttribute("coverage", "exposed-openness-graph"));
        var node = Write(screen, "screen", "screen"); if (node != null) root.Add(node);
        var referenced = new HashSet<string>(root.Descendants(U + "ref").Select(e => (string)e.Attribute("ref")!));
        foreach (var owner in root.Descendants().Where(e => e.Attribute(U + "type") != null).ToArray())
        {
            var contract = contracts.Single(c => (string?)c.Attribute("id") == (string?)owner.Attribute(U + "type"));
            foreach (var member in contract.Elements(U + "member").Where(m => m.Element(U + "default-element") != null))
            {
                var child = owner.Elements(N + (string)member.Attribute("xml")!).SingleOrDefault();
                var baseline = member.Element(U + "default-element")!.Elements().SingleOrDefault();
                if (child == null || baseline == null || child.DescendantsAndSelf().Any(e => e.Name == U + "ref" || referenced.Contains((string?)e.Attribute(U + "id") ?? ""))) continue;
                var childContract = contracts.SingleOrDefault(c => (string?)c.Attribute("id") == (string?)child.Attribute(U + "type"));
                if ((string?)childContract?.Attribute("name") != "Siemens.Engineering.MultilingualText") continue;
                XElement TextShape(XElement source)
                {
                    var shape = new XElement(source);
                    foreach (var attribute in shape.DescendantsAndSelf().Attributes().Where(a => a.IsNamespaceDeclaration || a.Name == U + "id" || a.Name == U + "type").ToArray()) attribute.Remove();
                    foreach (var text in shape.DescendantNodes().OfType<XText>().Where(t => string.IsNullOrWhiteSpace(t.Value)).ToArray()) text.Remove();
                    return shape;
                }
                if (XNode.DeepEquals(TextShape(child), TextShape(baseline))) child.Remove();
            }
            foreach (var member in contract.Elements(U + "member").Where(m => m.Attribute("attribute-map") != null))
            {
                var child = owner.Elements(N + (string)member.Attribute("xml")!).SingleOrDefault();
                if (child == null || child.HasElements || referenced.Contains((string?)child.Attribute(U + "id") ?? "")) continue;
                var mappings = ((string)member.Attribute("attribute-map")!).Split(' ').Select(pair => pair.Split('=')).ToDictionary(pair => pair[0], pair => pair[1]);
                var attributes = child.Attributes().Where(a => a.Name.Namespace == XNamespace.None).ToArray();
                if (attributes.Any(a => !mappings.ContainsKey(a.Name.LocalName))) continue;
                foreach (var attribute in attributes) owner.SetAttributeValue(mappings[attribute.Name.LocalName], attribute.Value);
                child.Remove();
            }
        }
        foreach (var element in root.Descendants())
        {
            if (element.Attribute(U + "id") is XAttribute id && !referenced.Contains(id.Value)) id.Remove();
            if (contracts.Count(c => (string?)c.Attribute("tag") == element.Name.LocalName) == 1) element.Attribute(U + "type")?.Remove();
        }
        var buffer = new System.Text.StringBuilder();
        using (var writer = XmlWriter.Create(buffer, new XmlWriterSettings { OmitXmlDeclaration = true, Indent = true, IndentChars = "  ", NewLineChars = "\n", NewLineHandling = NewLineHandling.Entitize })) root.WriteTo(writer);
        return new("<?xml version=\"1.0\" encoding=\"utf-8\"?>\n" + buffer, diagnostics);
    }
    private XElement? Select(object model, string tag, string path)
    {
        var candidates = contracts.Where(c => (string?)c.Attribute("tag") == tag).ToArray();
        var matching = candidates.Where(c => c.Elements(U + "property").All(p => Compatible(Unwrap(Get(model, (string)p.Attribute("name")!), path, false), p.Element(U + "value")!))).ToArray();
        if (matching.Length == 1) return matching[0];
        if (matching.Length > 1)
        {
            XElement Shape(XElement source) { var clone = new XElement(source); clone.Attribute("id")?.Remove(); clone.Descendants(U + "default").Remove(); return clone; }
            var first = Shape(matching[0]);
            if (matching.All(c => XNode.DeepEquals(first, Shape(c))) && matching.SelectMany(c => c.Elements(U + "property")).Where(p => p.Element(U + "default") != null).All(p => Unwrap(Get(model, (string)p.Attribute("name")!), path, false) != null)) return matching[0];
        }
        if (candidates.Length == 1) return candidates[0];
        Report(path, candidates.Length == 0 ? "No selected catalog contract for " + tag + "." : "Ambiguous typed contract for " + tag + "."); return null;
    }
    private static bool Compatible(object? value, XElement template)
    {
        if (value == null) return true;
        if ((string?)template.Attribute("kind") == "null") return false;
        return (string?)template.Attribute("type") switch { "System.Boolean" => value is bool, "System.Drawing.Color" => value is HmiColor, "System.String" => value is string, _ => true };
    }
    private XElement? Write(object model, string tag, string path, XElement? schema = null)
    {
        schema ??= Select(model, tag, path); if (schema == null) return null;
        if (identities.TryGetValue(model, out var previous)) return new XElement(U + "ref", new XAttribute("ref", previous));
        var id = "o" + (identities.Count + 1); identities.Add(model, id);
        var node = new XElement(N + tag, new XAttribute(U + "id", id), new XAttribute(U + "type", (string)schema.Attribute("id")!));
        foreach (var property in schema.Elements(U + "property"))
        {
            var name = (string)property.Attribute("name")!; var alias = (string)property.Attribute("xml")!;
            var value = Unwrap(Get(model, name), path + "." + name);
            var template = property.Element(U + "value")!;
            if (value == null) { if (property.Element(U + "default") == null && (string?)template.Attribute("kind") != "null") Report(path + "." + name, "Required engineering value is absent."); continue; }
            try
            {
                if (property.Element(U + "items") is XElement list && value is IEnumerable strings)
                {
                    var values = strings.Cast<object>().Select(v => new XElement(N + ((string?)list.Attribute("tag") ?? "tag"), new XAttribute("name", System.Convert.ToString(v, CultureInfo.InvariantCulture) ?? "")));
                    if ((string?)list.Attribute("flattened") == "true") node.Add(values); else node.Add(new XElement(N + alias, values));
                    continue;
                }
                var scalarType = (string?)template.Attribute("type");
                if (scalarType != null && (scalarType.EndsWith(".HmiFontFamily") || scalarType.EndsWith(".HmiFontName")) && value is string family && !new[] { "Arial", "Siemens Sans", "SiemensSans", "Times New Roman", "TimesNewRoman", "SimSun" }.Contains(family))
                    Report(path + "." + name, "The selected SDK font contract projects this native family to Arial; the model retains the native name.");
                var lexical = Scalar(value, template);
                if (HmiUnifiedXmlScriptText.IsScript(name)) lexical = HmiUnifiedXmlScriptText.ToXml(lexical);
                if (tag == "multilingual-text-item" && name == "Text") { HmiUnifiedXmlText.Write(node, lexical); continue; }
                if (name != "ScriptCode" && (name != "Name" || model is not HmiScreenBase && model is not HmiScreenItemBase) && property.Element(U + "default")?.Value == lexical) continue;
                if ((string?)property.Attribute("inline") == "true") node.SetAttributeValue(alias, lexical);
                else node.Add(new XElement(N + alias, name is "ScriptCode" or "GlobalDefinitionAreaScriptCode" ? new XAttribute(XNamespace.Xml + "space", "preserve") : null, lexical));
            }
            catch (Exception ex) when (ex is ArgumentException or FormatException or OverflowException or XmlException) { Report(path + "." + name, ex.Message); }
        }
        foreach (var member in schema.Elements(U + "member"))
        {
            var name = (string)member.Attribute("name")!; var alias = (string)member.Attribute("xml")!;
            object[] values;
            try { values = Members(model, name, path).ToArray(); }
            catch (Exception ex) when (ex is ArgumentException or FormatException) { Report(path + "." + name, ex.Message); continue; }
            var children = new List<XElement>();
            foreach (var value in values)
            {
                var childTag = Tag(value, name);
                XElement? partSchema = (member.Attribute("attribute-type") ?? member.Attribute("default-type")) is XAttribute partId ? contracts.Single(c => (string?)c.Attribute("id") == partId.Value) : null;
                var child = Write(value, childTag, path + "." + name, partSchema); if (child != null) children.Add(child);
            }
            if (name == "ScreenItems" || member.Attribute("item-tags") != null || (string?)member.Attribute("flattened") == "true" || member.Attribute("attribute-type") != null) node.Add(children);
            else if (children.Count > 0 || name is "Items" or "Entries") node.Add(new XElement(N + alias, children));
        }
        var mapped = new HashSet<string>(schema.Elements(U + "property").Select(p => (string)p.Attribute("name")!).Concat(schema.Elements(U + "member").Select(m => (string)m.Attribute("name")!)), StringComparer.Ordinal);
        var ignored = new HashSet<string> { "Id", "HmiObjectType", "SourceData", "SourceProperties", "SourceFormat", "StorageBusinessObject", "HandlerTag", "Kind", "EngineeringApiVersion" };
        if (mapped.Contains("ScreenItems")) ignored.Add("Layers");
        if (mapped.Contains("EventHandlers") || mapped.Contains("PropertyEventHandlers")) ignored.Add("Events");
        if (mapped.Contains("ContainedType")) ignored.UnionWith(new[] { "FaceplateName", "FaceplateVersion" });
        if (mapped.Contains("Content")) ignored.UnionWith(new[] { "Mode", "ContentSpacing", "ContentSplitRatio", "ContentTextPosition", "GraphicStretchMode", "HorizontalAlignment", "VerticalAlignment", "TextTrimming" });
        if (mapped.Contains("Url") && model is HmiMediaControl) ignored.Add("Source");
        if (mapped.Contains("Graphic")) ignored.UnionWith(new[] { "Image", "Source" });
        if (mapped.Contains("AlternateGraphic")) ignored.Add("AlternateImage");
        if (mapped.Contains("BackGraphic")) ignored.Add("BackgroundImage");
        if (mapped.Contains("Weight")) ignored.Add("Bold");
        if (mapped.Contains("Items") && model is HmiMultilingualText) ignored.UnionWith(new[] { "Texts", "FormattedTexts", "CategoryTypeId", "CategorySubtype", "SourceDefaultLanguageId" });
        if (model is HmiTextScriptAction) ignored.UnionWith(new[] { "Language", "FunctionName", "ParameterNames" });
        var fields = model is IDictionary<string, object?> dictionary ? dictionary : model.GetType().GetProperties().Where(p => p.CanRead && p.GetIndexParameters().Length == 0).ToDictionary(p => p.Name, p => p.GetValue(model));
        var mappedFields = new HashSet<string>(mapped.Concat(mapped.Select(name => Aliases.TryGetValue(name, out var alias) ? alias : name)));
        foreach (var field in fields)
        {
            if (field.Value == null || field.Value is ICollection collection && collection.Count == 0 || ignored.Contains(field.Key) || mappedFields.Contains(field.Key)) continue;
            Report(path + "." + field.Key, "Populated model field has no selected catalog mapping.");
        }
        return node;
    }
    private IEnumerable<object> Members(object model, string name, string path)
    {
        if (name == "ScreenItems" && model is HmiScreenBase screen) return screen.Layers.SelectMany(l => l.Items).Cast<object>();
        if (name == "Dynamizations")
        {
            var bindings = new List<object>();
            foreach (var property in model.GetType().GetProperties().Where(p => p.CanRead && p.GetIndexParameters().Length == 0))
            {
                if (model is HmiIOField io && property.Name == "Text" && io.ProcessValue != null) continue;
                var value = property.GetValue(model); if (value == null) continue;
                var settings = value.GetType().GetProperty("UnifiedTagDynamization")?.GetValue(value) as HmiUnifiedTagDynamization;
                var target = model is HmiMediaControl && property.Name == "Source" ? "Url" : property.Name == "GraphicStretchMode" && model is not HmiScreenBase ? "GraphicStretchMode" : NativeName(property.Name);
                if (settings != null)
                {
                    bindings.Add(new Dictionary<string, object?> { ["PropertyName"] = settings.PropertyName ?? target, ["DynamizationType"] = settings.ResourceList != null ? "ResourceList" : "Tag", ["Tag"] = value.GetType().GetProperty("TagName")?.GetValue(value) ?? settings.TagName,
                        ["ResourceList"] = settings.ResourceList, ["Address"] = settings.Address, ["DataType"] = settings.DataType, ["PlcTag"] = settings.PlcTag,
                        ["ReadOnly"] = settings.ReadOnly, ["UseIndirectAddressing"] = settings.UseIndirectAddressing, ["ValueConverter"] = settings.ValueConverter });
                }
                else if (value.GetType().GetProperty("Kind")?.GetValue(value) is HmiPropertyKind.Script && value.GetType().GetProperty("Language")?.GetValue(value) is HmiScriptLanguage.JavaScript)
                {
                    bindings.Add(new Dictionary<string, object?> { ["PropertyName"] = target, ["DynamizationType"] = "Script", ["ScriptCode"] = value.GetType().GetProperty("Script")?.GetValue(value),
                        ["Async"] = value.GetType().GetProperty("Async")?.GetValue(value), ["GlobalDefinitionAreaScriptCode"] = value.GetType().GetProperty("GlobalDefinitionAreaScriptCode")?.GetValue(value),
                        ["Trigger"] = value.GetType().GetProperty("Triggers")?.GetValue(value) is IList<HmiTrigger> triggers && triggers.Count == 1 ? triggers[0] : null });
                }
            }
            return bindings;
        }
        if (name is "EventHandlers" or "PropertyEventHandlers" && Get(model, "Events") is IEnumerable events)
            return events.Cast<HmiEventBinding>().Where(e => (e.PropertyName != null) == (name == "PropertyEventHandlers")).Where(e => e.Action is HmiTextScriptAction { Language: HmiScriptLanguage.JavaScript }).Select(e => (object)new Dictionary<string, object?> { ["EventType"] = e.EventName, ["PropertyName"] = e.PropertyName, ["Script"] = e.Action, ["HandlerTag"] = e.PropertyName != null ? "property-event-handler" : model is HmiScreenBase ? "screen-event-handler" : EventTag(model) });
        if (model is HmiMultilingualText text && name == "Items")
            return text.Texts.Keys.Concat(text.FormattedTexts.Keys).Distinct().Where(k => k != 127).Select(k => (object)new Dictionary<string, object?> {
                ["Language"] = CultureInfo.GetCultureInfo(k <= 0 ? culture ?? throw new FormatException("Default language requires an explicit LCID.") : k).Name,
                ["Text"] = text.FormattedTexts.TryGetValue(k, out var formatted) ? formatted : text.Texts[k] });
        if (name == "Content") return new[] { Content(model) };
        var memberValue = Unwrap(Get(model, name), path + "." + name);
        if (memberValue == null) return [];
        if (memberValue is IEnumerable list && memberValue is not string && memberValue is not IDictionary) return list.Cast<object>();
        return new[] { memberValue };
    }
    private static Dictionary<string, object?> Content(object owner) => new() {
        ["ContentMode"] = Get(owner, "Mode"), ["GraphicStretchMode"] = Get(owner, "GraphicStretchMode"), ["HorizontalTextAlignment"] = Get(owner, "HorizontalAlignment"),
        ["VerticalTextAlignment"] = Get(owner, "VerticalAlignment"), ["TextTrimming"] = Get(owner, "TextTrimming"), ["Spacing"] = Get(owner, "ContentSpacing"), ["SplitRatio"] = Get(owner, "ContentSplitRatio"), ["TextPosition"] = Get(owner, "ContentTextPosition") };
    private string Tag(object value, string role)
    {
        if (value is HmiScreenItemBase item)
        {
            if (item is HmiText || item is HmiTextBox) return "text-box";
            var className = item is HmiCustomWidgetContainer ? "HmiCustomWebControlContainer" : item.GetType().Name;
            var declaredTags = contracts.Where(c => ((string?)c.Attribute("name"))?.EndsWith("." + className, StringComparison.Ordinal) == true).Select(c => (string)c.Attribute("tag")!).Distinct().ToArray();
            if (declaredTags.Length == 1) return declaredTags[0];
            var name = item.GetType().Name.Substring(3);
            return System.Text.RegularExpressions.Regex.Replace(name, "(?<!^)([A-Z][a-z]|(?<=[a-z])[A-Z])", "-$1").ToLowerInvariant().Replace("io-field", "iofield");
        }
        if (role == "Entries" && value is HmiUnifiedMappingEntry entry) return entry.RangeType != null ? "mapping-table-entry-range" : "mapping-table-entry-bitmask";
        if (role == "Dynamizations") return Get(value, "ResourceList") != null ? "resource-list-dynamization" : Get(value, "DynamizationType") as string == "Script" ? "script-dynamization" : "tag-dynamization";
        if (role is "EventHandlers" or "PropertyEventHandlers") return Get(value, "HandlerTag") as string ?? "button-event-handler";
        if (role == "Items") return "multilingual-text-item";
        return System.Text.RegularExpressions.Regex.Replace(role, "(?<!^)([A-Z])", "-$1").ToLowerInvariant();
    }
    private string EventTag(object model)
    {
        var nativeName = model is HmiText || model is HmiTextBox ? "HmiText" : model.GetType().Name;
        return contracts.Where(c => ((string?)c.Attribute("name"))?.EndsWith("." + nativeName + "EventHandler", StringComparison.Ordinal) == true).Select(c => (string)c.Attribute("tag")!).FirstOrDefault() ?? "button-event-handler";
    }
    private static readonly Dictionary<string, string> Aliases = new() { ["ScreenNumber"] = "Number", ["Left"] = "X", ["Top"] = "Y", ["SelectionBackColor"] = "SelectionBackgroundColor", ["SelectionForeColor"] = "SelectionForegroundColor", ["BackColor"] = "BackgroundColor", ["AlternateBackColor"] = "AlternateBackgroundColor", ["ForeColor"] = "ForegroundColor", ["AlternateForeColor"] = "AlternateForegroundColor", ["BackFillPattern"] = "FillPattern", ["HorizontalTextAlignment"] = "HorizontalAlignment", ["VerticalTextAlignment"] = "VerticalAlignment", ["BackGraphicStretchMode"] = "GraphicStretchMode", ["Screen"] = "ScreenName", ["StrikeOut"] = "Strikethrough", ["Graphic"] = "Image", ["AlternateGraphic"] = "AlternateImage", ["BackGraphic"] = "BackgroundImage", ["ScriptCode"] = "SourceCode", ["Tags"] = "TagNames" };
    private static string NativeName(string name) => Aliases.FirstOrDefault(p => p.Value == name).Key ?? name;
    private static object? Get(object model, string name)
    {
        if (model is HmiTagTrigger && name == "Type") return "Tags";
        if (model is HmiTagTrigger && name == "CustomDuration") return "";
        if (name == "Weight" && model is HmiFont font && font.Weight == null && font.Bold != null) return font.Bold.StaticValue ? 700 : 400;
        if (model is IDictionary<string, object?> map) return map.TryGetValue(name, out var value) ? value : null;
        if (name == "Url" && model is HmiMediaControl media) return media.Source;
        if (name == "ScreenItems" && model is HmiContainerBase container) return container.Items;
        if (name == "ScreenItems" && model is HmiLayoutContainerBase layout) return layout.Items;
        if (name == "ContainedType" && model is HmiFaceplateContainer faceplate) return faceplate.FaceplateVersion == null ? faceplate.FaceplateName : "V" + faceplate.FaceplateVersion + "\\" + faceplate.FaceplateName;
        if (name is "Graphic" or "AlternateGraphic" or "BackGraphic")
        {
            var image = Get(model, name == "Graphic" ? "Image" : name == "AlternateGraphic" ? "AlternateImage" : "BackgroundImage");
            var source = image?.GetType().GetProperty("StaticValue")?.GetValue(image) as HmiImageSource ?? image as HmiImageSource;
            return source?.ImageName ?? (name == "Graphic" ? Get(model, "Source") : null);
        }
        return (model.GetType().GetProperty(name) ?? model.GetType().GetProperty(Aliases.TryGetValue(name, out var alias) ? alias : name))?.GetValue(model);
    }
    private object? Unwrap(object? value, string path, bool report = true)
    {
        if (value == null) return null;
        var type = value.GetType();
        if (type.GetProperty("Kind")?.GetValue(value) is not HmiPropertyKind kind) return value;
        if (kind == HmiPropertyKind.Default && type.GetProperty("StyleValues")?.GetValue(value) is IDictionary styles && type.GetProperty("ProfileName")?.GetValue(value) is string selected)
        {
            if (!styles.Contains(selected) && report) Report(path, "Style property has no resolved engineering value.");
            return styles.Contains(selected) ? styles[selected] : null;
        }
        if (kind is not (HmiPropertyKind.Static or HmiPropertyKind.Default) && type.GetProperty("UnifiedTagDynamization")?.GetValue(value) == null && kind != HmiPropertyKind.Script && report) Report(path, "Dynamic binding lacks engineering settings.");
        return type.GetProperty("StaticValue")?.GetValue(value);
    }
    private static string Scalar(object value, XElement template)
    {
        var type = (string?)template.Attribute("type");
        if (type == "System.Drawing.Color" && value is HmiColor color) return "#" + color.Red.ToString("X2") + color.Green.ToString("X2") + color.Blue.ToString("X2") + (color.Alpha == 255 ? "" : color.Alpha.ToString("X2"));
        if (type == "System.Boolean" && value is bool flag) return flag ? "True" : "False";
        if ((string?)template.Attribute("kind") == "language") return (string)value;
        if ((string?)template.Attribute("kind") == "enum")
        {
            if ((type!.EndsWith(".HmiFontFamily") || type.EndsWith(".HmiFontName"))) return value.ToString() switch { "Siemens Sans" => "SiemensSans", "Times New Roman" => "TimesNewRoman", "Arial" or "SiemensSans" or "TimesNewRoman" or "SimSun" => value.ToString()!, _ => "Arial" };
            if (type.EndsWith(".HmiFontWeight") && value is int weight) return weight switch { 0 => "None", 300 => "Light", 400 => "Normal", 600 => "SemiBold", 700 => "Bold", _ => throw new FormatException("Unknown font weight.") };
            if (type.EndsWith(".HmiGraphicStretchMode") && value is int stretch && stretch >= 0 && stretch <= 4) return new[] { "None", "Fill", "Uniform", "UniformToFill", "Tiled" }[stretch];
            if (type.EndsWith(".HmiTextWrapping") && value is int wrapping && wrapping >= 0 && wrapping <= 1) return wrapping == 0 ? "NoWrap" : "WordWrap";
            if (type.EndsWith(".HmiTextTrimming") && value is int trimming && trimming >= 0 && trimming <= 1) return trimming == 0 ? "None" : "CharacterEllipsis";
            return value.ToString()!;
        }
        if (!Compatible(value, template)) throw new FormatException("Value is incompatible with the selected typed contract.");
        var result = System.Convert.ToString(value, CultureInfo.InvariantCulture)!; XmlConvert.VerifyXmlChars(result);
        if (type is "System.Byte" or "System.Int16" or "System.UInt16" or "System.Int32" or "System.UInt32" or "System.UInt64")
        {
            if (decimal.Parse(result, CultureInfo.InvariantCulture) != decimal.Truncate(decimal.Parse(result, CultureInfo.InvariantCulture))) throw new FormatException("Fractional engineering integer.");
            _ = type switch { "System.Byte" => (object)byte.Parse(result, CultureInfo.InvariantCulture), "System.Int16" => short.Parse(result, CultureInfo.InvariantCulture), "System.UInt16" => ushort.Parse(result, CultureInfo.InvariantCulture), "System.Int32" => int.Parse(result, CultureInfo.InvariantCulture), "System.UInt32" => uint.Parse(result, CultureInfo.InvariantCulture), _ => ulong.Parse(result, CultureInfo.InvariantCulture) };
        }
        return result;
    }
}
