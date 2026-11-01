using System.Reflection;
using System.Runtime.Loader;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Xml.Linq;
using System.IO.Compression;

// Offline schema authoring. Read public SDK metadata, never project values/defaults.
if (args.Length != 2) throw new ArgumentException("Usage: UnifiedCatalogBuilder <SDK net48 directory> <BaseHmiTypes repository>");
var sdk = Path.GetFullPath(args[0]); var repository = Path.GetFullPath(args[1]);
AssemblyLoadContext.Default.Resolving += (_, name) => File.Exists(Path.Combine(sdk, name.Name + ".dll"))
    ? AssemblyLoadContext.Default.LoadFromAssemblyPath(Path.Combine(sdk, name.Name + ".dll")) : null;
var api = AssemblyLoadContext.Default.LoadFromAssemblyPath(Path.Combine(sdk, "Siemens.Engineering.WinCCUnified.dll")).GetExportedTypes();
XNamespace c = "urn:s7mcp:wincc-unified:2:contract";
var path = Path.Combine(repository, "catalogs/unified/catalog.xml"); var document = XDocument.Load(path); var contracts = document.Root!.Element(c + "types")!;
string Tag(string name) => name == "HmiText" ? "static-text" : Regex.Replace(Regex.Replace(name, "^(IHmi|Hmi)", ""), "([a-z0-9])([A-Z])", "$1-$2").ToLowerInvariant();
bool Engineering(Type type) => type.GetInterfaces().Any(i => i.FullName == "Siemens.Engineering.IEngineeringObject")
    || type.FullName == "Siemens.Engineering.HmiUnified.UI.Dynamization.Script.IHmiScript";
Type? ItemType(Type type) => type.GetInterfaces().FirstOrDefault(i => i.IsGenericType && i.GetGenericTypeDefinition() == typeof(IEnumerable<>))?.GetGenericArguments()[0];
bool Scalar(Type type) => type.IsEnum || type.IsPrimitive || type == typeof(string) || type == typeof(decimal)
    || type.FullName is "System.Drawing.Color" or "System.DateTime" or "System.TimeSpan" or "System.Guid";
var types = api.Where(t => t.FullName!.StartsWith("Siemens.Engineering.HmiUnified.UI.", StringComparison.Ordinal) && !t.IsAbstract && !t.IsInterface && Engineering(t)).ToList();
foreach (var obsolete in contracts.Elements(c + "type").Where(t => (string?)t.Attribute("name") == "Siemens.Engineering.HmiUnified.UI.Dynamization.Script.IHmiScript").ToArray()) obsolete.Remove();
foreach (var text in contracts.Elements(c + "type").Where(t => (string?)t.Attribute("name") == "Siemens.Engineering.HmiUnified.UI.Shapes.HmiText" && (string?)t.Attribute("tag") == "text"))
{ text.SetAttributeValue("tag", "static-text"); text.SetAttributeValue("id", "StaticText"); }
var roles = new List<(Type Type, string Tag)>();
foreach (var type in types)
{
    roles.Add((type, Tag(type.Name)));
    roles.AddRange(type.GetProperties().Where(p => p.Name != "Parent" && Engineering(p.PropertyType)).Select(p =>
        (p.PropertyType.FullName == "Siemens.Engineering.HmiUnified.UI.Dynamization.Script.IHmiScript" ? api.Single(t => t.FullName == "Siemens.Engineering.HmiUnified.UI.Dynamization.Script.ScriptDynamization") : p.PropertyType, Tag(p.Name))));
}
int added = 0, fields = 0;
foreach (var (type, tag) in roles.DistinctBy(r => (r.Type.FullName, r.Tag)).OrderBy(r => r.Type.FullName, StringComparer.Ordinal).ThenBy(r => r.Tag, StringComparer.Ordinal))
{
    var candidates = contracts.Elements(c + "type").Where(e => (string?)e.Attribute("name") == type.FullName && (string?)e.Attribute("tag") == tag).ToArray();
    if (candidates.Length == 0)
    {
        var id = string.Concat(tag.Split('-').Select(p => char.ToUpperInvariant(p[0]) + p[1..]));
        if (contracts.Elements().Any(e => (string?)e.Attribute("id") == id)) id += "." + type.Name;
        var contract = new XElement(c + "type", new XAttribute("name", type.FullName!), new XAttribute("tag", tag), new XAttribute("id", id));
        contracts.Add(contract); candidates = [contract]; added++;
    }
    foreach (var contract in candidates)
    {
        foreach (var property in type.GetProperties().Where(p => p.CanRead && p.GetIndexParameters().Length == 0 && p.Name != "Parent").OrderBy(p => p.Name, StringComparer.Ordinal))
        {
            var valueType = Nullable.GetUnderlyingType(property.PropertyType) ?? property.PropertyType;
            if (contract.Elements().FirstOrDefault(e => (string?)e.Attribute("name") == property.Name) is { } existing)
            {
                if (valueType == typeof(object) && candidates.Length == 1 && existing.Element(c + "items") == null && existing.Element(c + "value") is { } objectValue)
                {
                    objectValue.ReplaceWith(new XElement(c + "value", new XAttribute("kind", "variant")));
                    existing.SetAttributeValue("inline", false);
                }
                else if (Scalar(valueType) && existing.Element(c + "value") is { } nullValue && (string?)nullValue.Attribute("kind") == "null")
                {
                    var value = new XElement(c + "value", new XAttribute("kind", valueType.IsEnum ? "enum" : "scalar"), new XAttribute("type", valueType.FullName!), new XAttribute("nullable", true));
                    if (valueType == typeof(string)) value.Add(new XAttribute("encoding", "text"), new XAttribute(XNamespace.Xml + "space", "preserve"));
                    nullValue.ReplaceWith(value); existing.SetAttributeValue("inline", !property.Name.Contains("ScriptCode"));
                }
                if (existing.Element(c + "value") is { } nullableValue && (valueType == typeof(string) || Nullable.GetUnderlyingType(property.PropertyType) != null)) nullableValue.SetAttributeValue("nullable", true);
                if (existing.Name == c + "member" && existing.Attribute("declared-type") == null)
                    existing.Add(new XAttribute("declared-type", (Engineering(valueType) ? valueType : ItemType(valueType))?.FullName ?? valueType.FullName!));
                if (existing.Name == c + "member" && (string?)existing.Attribute("collection") == "false") existing.SetAttributeValue("nullable", true);
                if (existing.Element(c + "value") is { } enumValue && valueType.IsEnum && !enumValue.Elements(c + "enum").Any())
                    foreach (var enumName in Enum.GetNames(valueType)) enumValue.Add(new XElement(c + "enum", new XAttribute("name", enumName), new XAttribute("value", Enum.Format(valueType, Enum.Parse(valueType, enumName), "d"))));
                continue;
            }
            if (Scalar(valueType) || valueType == typeof(object) || valueType.IsArray)
            {
                var variant = valueType == typeof(object) || valueType.IsArray;
                var value = new XElement(c + "value", new XAttribute("kind", variant ? "variant" : valueType.IsEnum ? "enum" : "scalar"));
                if (!variant) value.Add(new XAttribute("type", valueType.FullName!));
                if (valueType.IsEnum) foreach (var enumName in Enum.GetNames(valueType)) value.Add(new XElement(c + "enum", new XAttribute("name", enumName), new XAttribute("value", Enum.Format(valueType, Enum.Parse(valueType, enumName), "d"))));
                if (valueType == typeof(string)) value.Add(new XAttribute(XNamespace.Xml + "space", "preserve"), new XAttribute("encoding", "text"));
                if (Nullable.GetUnderlyingType(property.PropertyType) != null || valueType == typeof(string)) value.Add(new XAttribute("nullable", true));
                contract.Add(new XElement(c + "property", new XAttribute("name", property.Name), new XAttribute("writable", property.CanWrite), new XAttribute("source", "property"),
                    new XAttribute("xml", Tag(property.Name)), new XAttribute("inline", !variant && !property.Name.Contains("ScriptCode")), new XAttribute("optional", true), value)); fields++;
            }
            else if (Engineering(valueType) || ItemType(valueType) is { } item && Engineering(item))
            {
                var collection = !Engineering(valueType);
                contract.Add(new XElement(c + "member", new XAttribute("name", property.Name), new XAttribute("collection", collection), new XAttribute("xml", Tag(property.Name)),
                    new XAttribute("optional", true), new XAttribute("declared-type", (collection ? ItemType(valueType) : valueType)!.FullName!), collection ? null : new XAttribute("flattened", true))); fields++;
                if (!collection) contract.Elements(c + "member").Last().SetAttributeValue("nullable", true);
            }
        }
        if (contract.Element(c + "creation") == null) contract.Add(new XElement(c + "creation", new XAttribute("explicit", true)));
    }
}
// Anonymous owned collections have ordered slots, not public identity keys.
foreach (var member in contracts.Descendants(c + "member").Where(m => (string?)m.Attribute("collection") == "true"))
{
    var item = api.FirstOrDefault(t => t.FullName == (string?)member.Attribute("declared-type"));
    if (item != null && !item.FullName!.Contains(".Dynamization.") && !item.GetProperties().Any(p => p.Name is "Name" or "PropertyName" or "EventType" or "Language"))
        member.SetAttributeValue("identity", "position");
}
// Creation recipes come from public composition overloads, not sample instances.
var createMethods = api.Where(t => t.Name.EndsWith("Composition", StringComparison.Ordinal))
    .SelectMany(t => t.GetMethods().Where(m => m.Name == "Create" && m.GetParameters().Length > 0)).ToArray();
foreach (var contract in contracts.Elements(c + "type").Where(t => (string?)t.Element(c + "creation")?.Attribute("explicit") == "true" || (string?)t.Element(c + "creation")?.Attribute("available") == "false"))
{
    if ((string?)contract.Attribute("tag") == "screen") continue;
    var type = api.FirstOrDefault(t => t.FullName == (string?)contract.Attribute("name"));
    if (type == null) continue;
    foreach (var method in createMethods)
    {
        var returnsType = method.ReturnType == type || method.IsGenericMethodDefinition && method.GetGenericArguments().Length == 1 && ItemType(method.DeclaringType!)?.IsAssignableFrom(type) == true;
        if (!returnsType) continue;
        var creationFields = method.GetParameters().Select(p => (Parameter: p, Property: type.GetProperties().FirstOrDefault(f => string.Equals(f.Name, p.Name, StringComparison.OrdinalIgnoreCase)))).ToArray();
        if (creationFields.Any(f => f.Property == null || !contract.Elements(c + "property").Any(p => (string?)p.Attribute("name") == f.Property.Name))) continue;
        contract.Element(c + "creation")!.ReplaceWith(new XElement(c + "creation", creationFields.Select(f => new XElement(c + "parameter", new XAttribute("name", f.Parameter.Name!), new XAttribute("property", f.Property!.Name)))));
        break;
    }
}
foreach (var attribute in contracts.DescendantsAndSelf().Attributes().Where(a => a.IsNamespaceDeclaration).ToArray()) attribute.Remove();
foreach (var screen in contracts.Elements(c + "type").Where(t => (string?)t.Attribute("tag") == "screen"))
    screen.Element(c + "creation")?.ReplaceWith(new XElement(c + "creation", new XAttribute("explicit", true)));
var idHash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(contracts.ToString(SaveOptions.DisableFormatting)))).ToLowerInvariant();
document.Root.SetAttributeValue("id", idHash);
File.WriteAllText(path, document.ToString(SaveOptions.DisableFormatting), new UTF8Encoding(false));
var hash = Convert.ToHexString(SHA256.HashData(File.ReadAllBytes(path))).ToLowerInvariant();
File.WriteAllText(Path.Combine(repository, "catalogs/unified/manifest.json"), JsonSerializer.Serialize(new { id = idHash, sha256 = hash }, new JsonSerializerOptions { WriteIndented = true }) + "\n");
using (var file = File.Create(path + ".gz")) using (var gzip = new GZipStream(file, CompressionLevel.SmallestSize)) gzip.Write(File.ReadAllBytes(path));
File.WriteAllText(Path.Combine(repository, "src/BaseHmiTypes/Converters/UnifiedXml/HmiUnifiedXmlContract.g.cs"),
    "// Generated from the shared format definition.\nnamespace BaseHmiTypes.Converters.UnifiedXml;\ninternal static class HmiUnifiedXmlContract { internal const string Id = \"" + idHash + "\"; }\n");
Console.WriteLine($"Added {added} type roles and {fields} public properties/members; {contracts.Elements().Count()} total contracts.");
