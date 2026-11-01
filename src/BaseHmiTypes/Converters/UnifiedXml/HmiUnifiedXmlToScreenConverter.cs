using BaseHmiTypes.Screens.Controls;
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
    /// <summary>False when source engineering completeness is not independently certified; not an XML import gate.</summary>
    public bool SourceComplete { get; }
    public IReadOnlyList<HmiUnifiedXmlDiagnostic> Diagnostics { get; }
    internal HmiUnifiedXmlImportResult(HmiScreen screen, bool sourceComplete, List<HmiUnifiedXmlDiagnostic> diagnostics)
    { Screen = screen; SourceComplete = sourceComplete; Diagnostics = diagnostics.AsReadOnly(); }
}

/// <summary>Reads XML v2 screen archives and software authoring documents with bundled catalogs.</summary>
public sealed class HmiUnifiedXmlToScreenConverter
{
    private static readonly XNamespace N = HmiScreenToUnifiedXmlConverter.Namespace;
    private static readonly XNamespace U = HmiScreenToUnifiedXmlConverter.ContractNamespace;
    private XElement? catalog;
    private static readonly Dictionary<string, string> Names = new(StringComparer.Ordinal)
    {
        ["AcceptOnDeactivated"] = "AcceptOnDeactivated", ["AllowColumnReorder"] = "AllowColumnReorder", ["AllowColumnResize"] = "AllowColumnResize", ["AllowFilter"] = "AllowFilter", ["AllowSort"] = "AllowSort", ["AlternateLineColor"] = "AlternateLineColor", ["AutoPlay"] = "AutoPlay", ["AutoRange"] = "AutoRange", ["BeginValue"] = "BeginValue", ["CaptionColor"] = "CaptionColor", ["ClearOnActivate"] = "ClearOnActivate", ["Color"] = "Color", ["DialLabelColor"] = "DialLabelColor", ["DivisionCount"] = "DivisionCount", ["EndValue"] = "EndValue", ["Filter"] = "Filter", ["FlashingColor"] = "FlashingColor", ["GridLineColor"] = "GridLineColor", ["HiddenInput"] = "HiddenInput", ["HideDetails"] = "HideDetails", ["HomeUrl"] = "HomeUrl", ["InteractiveZooming"] = "InteractiveZooming", ["IsAlternateState"] = "IsAlternateState", ["IsFlashingRequired"] = "IsFlashingRequired", ["Italic"] = "Italic", ["LabelColor"] = "LabelColor", ["LineColor"] = "LineColor", ["MarkerColor"] = "MarkerColor", ["MaximumWidth"] = "MaximumWidth", ["MinimumWidth"] = "MinimumWidth", ["OriginValue"] = "OriginValue", ["ScreenName"] = "ScreenName", ["SelectFullRow"] = "SelectFullRow", ["SelectionBorderColor"] = "SelectionBorderColor", ["ShowDate"] = "ShowDate", ["ShowHours"] = "ShowHours", ["ShowMinutes"] = "ShowMinutes", ["ShowSeconds"] = "ShowSeconds", ["ShowValue"] = "ShowValue", ["Source"] = "Source", ["SubDivisionCount"] = "SubDivisionCount", ["SuppressFlashing"] = "SuppressFlashing", ["TabIntoWindow"] = "TabIntoWindow", ["TickColor"] = "TickColor", ["UncertainColor"] = "UncertainColor", ["Underline"] = "Underline", ["Url"] = "Url", ["UseAlarmColors"] = "UseAlarmColors", ["Value"] = "Value",
        ["Authorization"] = "Authorization", ["RequireExplicitUnlock"] = "RequireExplicitUnlock", ["CurrentQuality"] = "CurrentQuality",
        ["RotationCenterPlacement"] = "RotationCenterPlacement", ["ShowFocusVisual"] = "ShowFocusVisual", ["StyleItemClass"] = "StyleItemClass",
        ["VisualizeQuality"] = "VisualizeQuality", ["BackgroundFillMode"] = "BackgroundFillMode", ["FillDirection"] = "FillDirection",
        ["FillLevel"] = "FillLevel", ["ShowFillLevel"] = "ShowFillLevel", ["HorizontalAlignment"] = "HorizontalAlignment", ["VerticalAlignment"] = "VerticalAlignment",
        ["ToolTipText"] = "ToolTipText", ["AlternateText"] = "AlternateText", ["AlternateForeColor"] = "AlternateForegroundColor",
        ["ProcessValue"] = "ProcessValue", ["IOFieldType"] = "IOFieldType", ["OutputFormat"] = "OutputFormat", ["ResourceList"] = "ResourceList", ["SelectedIndex"] = "SelectedIndex",
        ["SelectionBackColor"] = "SelectionBackgroundColor", ["SelectionForeColor"] = "SelectionForegroundColor",
        ["Name"] = "Name", ["Width"] = "Width", ["Height"] = "Height", ["ScreenNumber"] = "Number",
        ["Left"] = "X", ["Top"] = "Y", ["Enabled"] = "Enabled", ["Visible"] = "Visible",
        ["BackColor"] = "BackgroundColor", ["AlternateBackColor"] = "AlternateBackgroundColor",
        ["ForeColor"] = "ForegroundColor", ["BorderColor"] = "BorderColor", ["AlternateBorderColor"] = "AlternateBorderColor",
        ["BorderWidth"] = "BorderWidth", ["Opacity"] = "Opacity", ["RotationAngle"] = "RotationAngle",
        ["RotationCenterX"] = "RotationCenterX", ["RotationCenterY"] = "RotationCenterY", ["TabIndex"] = "TabIndex",
        ["ReadOnly"] = "ReadOnly", ["Graphic"] = "Source", ["HorizontalTextAlignment"] = "HorizontalAlignment",
        ["VerticalTextAlignment"] = "VerticalAlignment", ["BackFillPattern"] = "FillPattern", ["Screen"] = "ScreenName"
    };

    public HmiUnifiedXmlToScreenConverter(string? catalogXml = null)
    {
        if (catalogXml == null) return;
        catalog = Parse(catalogXml);
        if (catalog.Name != U + "catalog" || catalog.Attribute("id") == null) throw new FormatException("Invalid Unified catalog.");

    }

    private static XElement Parse(string xml)
    {
        if (xml == null) throw new ArgumentNullException(nameof(xml));
        using var reader = XmlReader.Create(new StringReader(xml), new XmlReaderSettings
        { DtdProcessing = DtdProcessing.Prohibit, XmlResolver = null, MaxCharactersInDocument = 16 * 1024 * 1024 });
        return XDocument.Load(reader, LoadOptions.PreserveWhitespace).Root!;
    }

    public IReadOnlyList<HmiUnifiedXmlImportResult> ConvertScreens(string xml)
    {
        var root = Parse(xml);
        if (root.Elements().Count() == 1 && root.Elements().Single().Name == N + "screen") return new[] { Convert(xml) };
        if (root.Name != N + "unified-export" || (string?)root.Attribute("version") != "2"
            || root.Elements().Count() != 1 || root.Elements().Single().Name != N + "software")
            throw new NotSupportedException("Expected a Unified XML v2 screen or software document.");
        var screens = root.Descendants(N + "screen").ToArray();
        if (screens.Length == 0) throw new FormatException("The Unified XML document contains no screens.");
        var results = new List<HmiUnifiedXmlImportResult>();
        foreach (var screen in screens)
        {
            var envelope = new XElement(root.Name, root.Attributes());
            var selected = new XElement(screen);
            var operation = screen.AncestorsAndSelf().Select(e => (string?)e.Attribute(U + "operation")).FirstOrDefault(value => value != null);
            if (operation != null) selected.SetAttributeValue(U + "operation", operation);
            envelope.Add(selected);
            var result = Convert(envelope.ToString(SaveOptions.DisableFormatting));
            result.Screen.SourceData = Encoding.UTF8.GetBytes(xml); results.Add(result);
        }
        return results.AsReadOnly();
    }

    public HmiUnifiedXmlImportResult Convert(string xml)
    {
        var root = Parse(xml);
        if (root.Name != N + "unified-export" || (string?)root.Attribute("version") != "2" ||
            (root.Attribute("apiVersion") != null && !Regex.IsMatch((string)root.Attribute("apiVersion")!, @"^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$")))
            throw new NotSupportedException("Expected a screen-scope Unified XML v2 archive with a valid engineering API version.");
        if (root.Elements().Count() != 1 || root.Elements().Single().Name != N + "screen") throw new FormatException("Exactly one screen root is required.");
        var source = root.Elements().Single();
        if (string.IsNullOrWhiteSpace((string?)source.Attribute("name")))
            throw new FormatException("Screen name is required.");
        catalog ??= Parse(HmiUnifiedXmlCatalog.Read());
        var context = new Context(catalog);
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
        var screen = new HmiScreen { EngineeringApiVersion = (string?)root.Attribute("apiVersion"), SourceFormat = "WinCCUnifiedXmlV2", SourceData = Encoding.UTF8.GetBytes(xml) };
        context.Map(source, screen, "screen");
        var layer = new HmiLayer { Name = "Unified screen items" };
        screen.Layers.Add(layer);
        var nodes = source.Elements().SelectMany(e => e.Name == N + "screen-items" ? e.Elements() : new[] { e })
            .Where(e => e.Name == U + "ref" || context.ControlType(e) != null).ToArray();
        // Pre-create definitions so forward references reuse the same model instance.
        var items = new Dictionary<XElement, HmiScreenItemBase>();
        foreach (var node in source.Descendants().Where(e => context.ControlType(e) != null))
        {
            var modelType = context.ControlType(node);
            HmiScreenItemBase? item = modelType == null ? null : (HmiScreenItemBase)Activator.CreateInstance(modelType)!;
            if (item == null) { context.Report("screen." + node.Name.LocalName, "Unsupported control retained in screen SourceData."); continue; }
            items.Add(node, item);
            item.SourceFormat = "WinCCUnifiedXmlV2";
            item.SourceData = Encoding.UTF8.GetBytes(node.ToString(SaveOptions.DisableFormatting));
            context.Map(node, item, "screen." + node.Name.LocalName);
        }
        foreach (var owner in items.Where(pair => pair.Value is HmiContainerBase or HmiLayoutContainerBase))
        {
            var containerItems = owner.Value is HmiContainerBase container ? container.Items : ((HmiLayoutContainerBase)owner.Value).Items;
            foreach (var node in owner.Key.Elements().SelectMany(e => e.Name == N + "screen-items" ? e.Elements() : new[] { e }).Where(e => e.Name == U + "ref" || context.ControlType(e) != null))
            {
                var target = node.Name == U + "ref" ? ids[(string)node.Attribute("ref")!] : node;
                if (items.TryGetValue(target, out var child)) containerItems.Add(child);
                else context.Report("screen.screen-items", "Container child has no typed model.");
            }
        }
        foreach (var node in nodes)
        {
            var target = node.Name == U + "ref" ? ids[(string)node.Attribute("ref")!] : node;
            if (items.TryGetValue(target, out var item)) layer.Items.Add(item);
            else context.Report("screen.screen-items", "Reference or control cannot be represented; retained in screen SourceData.");
        }
        if ((string?)root.Attribute("coverage") == "authored-objects") context.Report("screen", "Authoring preview uses catalog defaults; existing target values and external project resources are unavailable.");
        return new(screen, false, context.Diagnostics);
    }

    private sealed class Context
    {
        public readonly List<HmiUnifiedXmlDiagnostic> Diagnostics = [];
        private readonly Dictionary<string, XElement> contracts;
        public Context(XElement catalog) => contracts = catalog.Element(U + "types")!.Elements().ToDictionary(e => (string)e.Attribute("id")!, StringComparer.Ordinal);
        private static readonly Dictionary<string, Type> ControlTypes = typeof(HmiScreenItemBase).Assembly.GetTypes().Where(t => !t.IsAbstract && typeof(HmiScreenItemBase).IsAssignableFrom(t) && t.GetConstructor(Type.EmptyTypes) != null).ToDictionary(t => t.Name, StringComparer.Ordinal);
        public Type? ControlType(XElement node)
        {
            if (node.Name.Namespace != N || node.Ancestors(N + "multilingual-text-item").Any() || !HasContract(node)) return null;
            var name = ((string?)Contract(node).Attribute("name"))?.Split('.').Last();
            if (name == "HmiTextBox") return typeof(HmiText);
            if (name == "HmiSwitch") name = "HmiToggleSwitch";
            if (name == "HmiCustomWebControlContainer") name = "HmiCustomWidgetContainer";
            return name != null && ControlTypes.TryGetValue(name, out var type) ? type : null;
        }
        public bool HasContract(XElement node) => node.Attribute(U + "type") != null || contracts.Values.Count(e => (string?)e.Attribute("tag") == node.Name.LocalName) == 1;
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
            var operation = (string?)node.Attribute(U + "operation");
            if (operation != null && operation != "create" && operation != "update" && operation != "upsert") throw new FormatException("Invalid authoring operation.");
            if (operation == "update" || operation == "upsert") Report(path, "Partial authoring object: omitted values use preview defaults; the existing target is unavailable.");
            var source = model is HmiScreenBase s ? s.SourceProperties : ((HmiScreenItemBase)model).SourceProperties;
            var allowed = new HashSet<string>(StringComparer.Ordinal);
            foreach (var property in contract.Elements(U + "property"))
            {
                var name = (string)property.Attribute("name")!;
                var alias = (string)property.Attribute("xml")!;
                allowed.Add(alias);
                if (node.Attribute(alias) == null && (string?)property.Element(U + "default")?.Attribute("kind") == "null") continue;
                var lexical = (string?)node.Attribute(alias) ?? property.Element(U + "default")?.Value;
                if (lexical == null)
                {
                    if ((string?)property.Element(U + "value")?.Attribute("kind") != "null") Report(path + "." + name, "Required value is absent and has no catalog default.");
                    continue;
                }
                source[name] = lexical;
                var value = Decode(lexical, property.Element(U + "value")!);
                if (name == "ContainedType" && model is HmiFaceplateContainer faceplate)
                {
                    var match = Regex.Match(lexical, @"^V([^\\]+)\\(.+)$");
                    faceplate.FaceplateName = match.Success ? match.Groups[2].Value : lexical;
                    faceplate.FaceplateVersion = match.Success ? match.Groups[1].Value : null;
                    Report(path, "Faceplate library definition requires an external project resource."); continue;
                }
                if (!Visual(model, name, value, path + "." + name) && (!Names.TryGetValue(name, out var target) || !Assign(model, target, value)))
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
                else if ((name == "Font" || name == "Padding" || name == "Content" || name == "InputBehavior") && node.Elements(N + alias).Any())
                {
                    var part = node.Elements(N + alias).First(); MapPart(part, Contract(part), model, name, source, path);
                }
                else if (name is "Text" or "AlternateText" or "ToolTipText" or "DisplayName")
                {
                    var elements = node.Elements(N + alias).ToArray();
                    if (elements.Length > 1) throw new FormatException("Duplicate text singleton.");
                    var textNode = elements.SingleOrDefault() ?? member.Element(U + "default-element")?.Elements().SingleOrDefault() ?? (member.Attribute("default-type") != null ? new XElement(N + alias) : null);
                    if (textNode != null && !Assign(model, name, ReadText(textNode, path + "." + name))) Report(path + "." + name, "Text has no neutral-model property.");
                }
            }
            foreach (var handler in node.Elements().Where(e => e.Name == N + "event-handlers" || e.Name == N + "property-event-handlers").SelectMany(e => e.Elements()))
            {
                if (!handler.Name.LocalName.EndsWith("event-handler", StringComparison.Ordinal) || handler.Name.Namespace != N) { Report(path + ".Events", "Unsupported event retained in SourceData."); continue; }
                Contract(handler);
                var script = handler.Element(N + "script");
                var code = script?.Element(N + "script-code");
                var eventName = (string?)handler.Attribute("event-type");
                if (code == null || eventName == null) { Report(path + ".Events", "Event has no readable script or event type."); continue; }
                Contract(script!);
                var events = model is HmiScreenBase screen ? screen.Events : ((HmiScreenItemBase)model).Events;
                var action = new HmiTextScriptAction { Language = HmiScriptLanguage.JavaScript, SourceCode = ReadCode(code) };
                var scriptProperties = Contract(script!).Elements(U + "property").ToArray();
                action.GlobalDefinitionAreaScriptCode = script!.Element(N + "global-definition-area-script-code") is XElement globals ? ReadCode(globals)
                    : scriptProperties.SingleOrDefault(p => (string?)p.Attribute("name") == "GlobalDefinitionAreaScriptCode")?.Element(U + "default")?.Value;
                var asyncValue = (string?)script.Attribute("async") ?? scriptProperties.SingleOrDefault(p => (string?)p.Attribute("name") == "Async")?.Element(U + "default")?.Value;
                if (asyncValue != null) action.Async = (bool)Decode(asyncValue, new XElement("value", new XAttribute("type", "System.Boolean")));
                events.Add(new HmiEventBinding { EventName = eventName, PropertyName = (string?)handler.Attribute("property-name"), Action = action });
            }
            var dynamized = new HashSet<string>(StringComparer.Ordinal);
            foreach (var dynamic in node.Elements(N + "dynamizations").SelectMany(e => e.Elements()))
            {
                if (dynamic.Name == N + "tag-dynamization" || dynamic.Name == N + "resource-list-dynamization")
                { ReadTagDynamization(dynamic, model, path); continue; }
                if (dynamic.Name != N + "script-dynamization") { Report(path + ".Dynamizations", "Unsupported dynamization retained in SourceData."); continue; }
                Contract(dynamic);
                var name = (string?)dynamic.Attribute("property-name") ?? throw new FormatException("Missing dynamized property name.");
                if (!dynamized.Add(name)) throw new FormatException("Duplicate property dynamization.");
                var target = name == "Url" && model is HmiMediaControl ? "Source" : name == "Text" ? "Text" : Names.TryGetValue(name, out var mapped) ? mapped : null;
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
                var settings = Contract(dynamic).Elements(U + "property").ToArray();
                var globals = dynamic.Element(N + "global-definition-area-script-code");
                type.GetProperty("GlobalDefinitionAreaScriptCode")!.SetValue(wrapper, globals != null ? ReadCode(globals) : settings.SingleOrDefault(p => (string?)p.Attribute("name") == "GlobalDefinitionAreaScriptCode")?.Element(U + "default")?.Value);
                var asyncValue = (string?)dynamic.Attribute("async") ?? settings.SingleOrDefault(p => (string?)p.Attribute("name") == "Async")?.Element(U + "default")?.Value;
                if (asyncValue != null) type.GetProperty("Async")!.SetValue(wrapper, (bool)Decode(asyncValue, new XElement("value", new XAttribute("type", "System.Boolean"))));
                var trigger = dynamic.Element(N + "trigger");
                if (trigger != null) Contract(trigger);
                if (trigger != null)
                {
                    if (!Enum.TryParse<HmiScriptTriggerType>((string?)trigger.Attribute("type"), out var triggerType) || !Enum.IsDefined(typeof(HmiScriptTriggerType), triggerType)) throw new FormatException("Invalid script trigger type.");
                    var scriptTrigger = new HmiScriptTrigger { Type = triggerType, CustomDuration = (string?)trigger.Attribute("custom-duration") ?? "" };
                    foreach (var tag in trigger.Elements(N + "tag")) scriptTrigger.TagNames.Add((string?)tag.Attribute("name") ?? throw new FormatException("Missing trigger tag name."));
                    ((IList<HmiTrigger>)type.GetProperty("Triggers")!.GetValue(wrapper)!).Add(scriptTrigger);
                }
                property.SetValue(model, wrapper);
                Report(path + ".Dynamizations." + name, "Script and tag triggers mapped; other engineering settings remain in SourceData.");
            }
            if (model is HmiFaceplateContainer container)
            {
                var supplied = new HashSet<string>(StringComparer.Ordinal);
                foreach (var entry in node.Elements(N + "interface").Elements(N + "faceplate-interface"))
                {
                    var entryContract = Contract(entry);
                    var name = (string?)entry.Attribute("property-name");
                    if (string.IsNullOrWhiteSpace(name) || !supplied.Add(name)) throw new FormatException("Missing or duplicate faceplate interface property name.");
                    var property = entryContract.Elements(U + "property").SingleOrDefault(property => (string?)property.Attribute("name") == "Value");
                    var lexical = (string?)entry.Attribute("value") ?? property?.Element(U + "default")?.Value;
                    if (property == null || lexical == null) throw new FormatException("Missing faceplate interface value.");
                    container.InterfaceValues.Add(new HmiFaceplateInterfaceValue { Name = name, Value = Decode(lexical, property.Element(U + "value")!) });
                }
            }
            foreach (var attribute in node.Attributes().Where(a => !a.IsNamespaceDeclaration && a.Name != U + "id" && a.Name != U + "type" && a.Name != U + "operation"))
                if (attribute.Name.Namespace != XNamespace.None || !allowed.Contains(attribute.Name.LocalName)) Report(path + ".@" + attribute.Name, "Unknown attribute retained in SourceData.");
            var handled = new HashSet<string> { "font", "padding", "content", "input-behavior", "display-name", "text", "alternate-text", "tool-tip-text", "event-handlers", "property-event-handlers", "dynamizations" };
            if (model is HmiScreenBase) handled.Add("screen-items");
            foreach (var child in node.Elements())
                if (child.Name != U + "ref" && (child.Name.Namespace != N || !handled.Contains(child.Name.LocalName) && ControlType(child) == null))
                    Report(path + "." + child.Name.LocalName, "Unsupported member retained in SourceData.");
        }

        private void ReadTagDynamization(XElement node, object model, string path)
        {
            Contract(node);
            var name = (string?)node.Attribute("property-name") ?? throw new FormatException("Missing dynamized property name.");
            var target = name == "Url" && model is HmiMediaControl ? "Source" : Names.TryGetValue(name, out var mapped) ? mapped : name;
            var property = model.GetType().GetProperty(target);
            if (property == null || !property.CanWrite || !property.PropertyType.IsGenericType || property.PropertyType.GetGenericTypeDefinition() != typeof(HmiProperty<>))
            { Report(path + ".Dynamizations." + name, "No typed model target for dynamization."); return; }
            var settings = new HmiUnifiedTagDynamization { PropertyName = name };
            void ReadProperties(XElement source, object destination)
            {
                foreach (var p in Contract(source).Elements(U + "property"))
                {
                    var field = (string)p.Attribute("name")!;
                    if (source.Attribute((string)p.Attribute("xml")!) == null && (string?)p.Element(U + "default")?.Attribute("kind") == "null") continue;
                    var lexical = (string?)source.Attribute((string)p.Attribute("xml")!) ?? p.Element(U + "default")?.Value;
                    if (lexical == null) continue;
                    if (destination == settings && field == "Tag") settings.TagName = lexical;
                    else if (field is not ("PropertyName" or "DynamizationType")) Assign(destination, field, Decode(lexical, p.Element(U + "value")!));
                }
            }
            ReadProperties(node, settings);
            if (node.Name == N + "resource-list-dynamization") settings.ResourceList ??= "";
            var converter = node.Element(N + "value-converter");
            if (converter != null)
            {
                Contract(converter); settings.ValueConverter = new HmiUnifiedValueConverter();
                var table = converter.Element(N + "mapping-table");
                if (table != null)
                {
                    var mapping = settings.ValueConverter.MappingTable = new HmiUnifiedMappingTable(); ReadProperties(table, mapping);
                    foreach (var entry in table.Elements(N + "entries").SelectMany(e => e.Elements()))
                    {
                        if (entry.Name != N + "mapping-table-entry-range" && entry.Name != N + "mapping-table-entry-bitmask") throw new FormatException("Invalid mapping-table entry.");
                        var value = new HmiUnifiedMappingEntry(); ReadProperties(entry, value); mapping.Entries.Add(value);
                    }
                }
            }
            var wrapper = Activator.CreateInstance(typeof(HmiTagProperty<>).MakeGenericType(property.PropertyType.GetGenericArguments()[0]))!;
            wrapper.GetType().GetProperty("TagName")!.SetValue(wrapper, settings.TagName);
            wrapper.GetType().GetProperty("UnifiedTagDynamization")!.SetValue(wrapper, settings);
            var original = property.GetValue(model);
            if (original != null) wrapper.GetType().GetProperty("StaticValue")!.SetValue(wrapper, original.GetType().GetProperty("StaticValue")!.GetValue(original));
            property.SetValue(model, wrapper);
        }

        private bool Visual(object model, string name, object value, string path)
        {
            if (name == "Url" && model is HmiMediaControl) return Assign(model, "Source", value);
            if (name == "BackFillPattern") return Assign(model, "FillPattern", value);
            if (name == "BackGraphic" && model is HmiScreen screen)
            { if (((string)value).Length != 0) screen.BackgroundImage = new HmiImageSource { ImageName = (string)value }; return true; }
            if ((name == "Graphic" || name == "AlternateGraphic") && (model is HmiButton || model is HmiGraphicView))
            {
                var reference = (string)value;
                if (reference.Length != 0)
                {
                    Assign(model, name == "Graphic" ? "Image" : "AlternateImage", new HmiImageSource { ImageName = reference });
                    Report(path, "Graphic reference mapped; image data is external and must be supplied by the project.");
                }
                if (name == "Graphic" && model is HmiGraphicView graphic) graphic.Source = reference;
                return true;
            }
            if (model is HmiButton && (name == "Spacing" || name == "SplitRatio" || name == "TextPosition"))
                return Assign(model, "Content" + name, value);
            if (name == "ContentMode" && model is HmiButton && value is string mode && Enum.GetNames(typeof(HmiButtonType)).Contains(mode))
                return Assign(model, "Mode", Enum.Parse(typeof(HmiButtonType), mode));
            if ((name == "GraphicStretchMode" || name == "BackGraphicStretchMode") && (model is HmiScreen || model is HmiButton || model is HmiGraphicView))
            {
                var modes = new Dictionary<string, int> { ["None"] = 0, ["Fill"] = 1, ["Uniform"] = 2, ["UniformToFill"] = 3, ["Tiled"] = 4 };
                if (value is string stretch && modes.TryGetValue(stretch, out var number)) return Assign(model, "GraphicStretchMode", number);
            }
            if (name == "TextWrapping" || name == "TextTrimming")
            {
                var modes = name == "TextWrapping" ? new Dictionary<string, int> { ["NoWrap"] = 0, ["WordWrap"] = 1 }
                    : new Dictionary<string, int> { ["None"] = 0, ["CharacterEllipsis"] = 1 };
                if (value is string modeName && modes.TryGetValue(modeName, out var number)) return Assign(model, name, number);
            }
            if (name == "HorizontalTextAlignment" || name == "VerticalTextAlignment") return Assign(model, Names[name], value);
            return false;
        }

        private void MapPart(XElement node, XElement contract, object owner, string role, IDictionary<string, string> source, string path)
        {
            if (node.Attribute(U + "type") is XAttribute marker && marker.Value != (string?)contract.Attribute("id")) throw new FormatException("Incompatible part contract selector.");
            object? part = role == "Font" ? new HmiFont() : role == "Padding" ? new HmiThickness() : role == "InputBehavior" ? new HmiInputBehavior() : null;
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
                if (role == "Font" && name == "Weight")
                {
                    if (lexical is "Bold" or "Normal") { target = "Bold"; value = lexical == "Bold"; }
                    else if (lexical is "Light" or "SemiBold" or "None") { target = "Weight"; value = lexical == "Light" ? 300 : lexical == "SemiBold" ? 600 : 0; }
                }
                if (!(role == "Content" && Visual(owner, name, value, path + "." + role + "." + name)) && (part == null || !Assign(part, target, value))) Report(path + "." + role + "." + name, "Part field retained in SourceProperties.");
            }
            if (part != null) owner.GetType().GetProperty(role)?.SetValue(owner, part);
            foreach (var dynamic in node.Elements(N + "dynamizations").SelectMany(wrapper => wrapper.Elements()))
                if (dynamic.Name == N + "tag-dynamization" || dynamic.Name == N + "resource-list-dynamization") ReadTagDynamization(dynamic, part ?? owner, path + "." + role);
            foreach (var attribute in node.Attributes().Where(a => !a.IsNamespaceDeclaration && a.Name != U + "id" && a.Name != U + "type" && a.Name != U + "operation"))
                if (attribute.Name.Namespace != XNamespace.None || !allowed.Contains(attribute.Name.LocalName)) Report(path + "." + role + ".@" + attribute.Name, "Unknown part attribute retained in SourceData.");
            foreach (var child in node.Elements().Where(child => child.Name != N + "dynamizations")) Report(path + "." + role + "." + child.Name.LocalName, "Part member retained in SourceData.");
        }

        private HmiMultilingualText ReadText(XElement node, string path)
        {
            Contract(node);
            var result = new HmiMultilingualText();
            foreach (var child in node.Elements())
            {
                if (child.Name != N + "multilingual-text-item") { Report(path, "Unsupported text member retained in SourceData."); continue; }
                Contract(child);
                foreach (var attribute in child.Attributes().Where(a => !a.IsNamespaceDeclaration && a.Name != U + "id" && a.Name != U + "type" && a.Name != U + "operation"))
                    if (attribute.Name != "lang" && attribute.Name != "text" && !HmiUnifiedXmlText.IsPayloadAttribute(attribute)) Report(path + ".@" + attribute.Name, "Unknown localized-text attribute retained in SourceData.");
                var lang = (string?)child.Attribute("lang") ?? throw new FormatException("Missing text language.");
                CultureInfo culture;
                try { culture = CultureInfo.GetCultureInfo(lang); }
                catch (CultureNotFoundException) { Report(path, "Unsupported language retained in SourceData: " + lang); continue; }
                if (culture.LCID == 4096) { Report(path, "Language has no stable culture LCID; retained in SourceData: " + lang); continue; }
                if (result.Texts.ContainsKey(culture.LCID)) throw new FormatException("Duplicate text language.");
                var text = HmiUnifiedXmlText.Read(child);
                result.Texts.Add(culture.LCID, text);
                // Retain the exact serialized text while allowing the HTML converter to recognize markup.
                if (text.StartsWith("<body", StringComparison.Ordinal)) result.FormattedTexts.Add(culture.LCID, text);
            }
            return result;
        }

        private static string ReadCode(XElement node)
        {
            if (!node.HasElements) return HmiUnifiedXmlScriptText.ToNative(node.Value);
            var value = node.Element(U + "Value");
            if (node.Elements().Count() != 1 || value == null || value.HasElements || (string?)value.Attribute("kind") != "scalar" || (string?)value.Attribute("type") != "System.String") throw new FormatException("Unsupported script payload.");
            if ((string?)value.Attribute("encoding") == "text") return HmiUnifiedXmlScriptText.ToNative(value.Value);
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
                "System.UInt64" => ulong.Parse(lexical, CultureInfo.InvariantCulture), "System.Int64" => long.Parse(lexical, CultureInfo.InvariantCulture),
                "System.UInt32" => uint.Parse(lexical, CultureInfo.InvariantCulture), "System.UInt16" => ushort.Parse(lexical, CultureInfo.InvariantCulture),
                "System.Int32" => int.Parse(lexical, CultureInfo.InvariantCulture), "System.Int16" => short.Parse(lexical, CultureInfo.InvariantCulture),
                "System.Byte" => byte.Parse(lexical, CultureInfo.InvariantCulture), _ => throw new NotSupportedException("Unsupported value type: " + type)
            };
        }
    }
}
