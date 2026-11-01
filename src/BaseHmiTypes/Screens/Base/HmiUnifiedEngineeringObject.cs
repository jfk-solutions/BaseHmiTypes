using System.Xml.Linq;
using BaseHmiTypes.Converters.UnifiedXml;

namespace BaseHmiTypes.Screens.Base;

/// <summary>Editable engineering settings outside the neutral preview model; not original XML or parser snapshots.</summary>
public sealed class HmiUnifiedEngineeringObject : Dictionary<string, object?>
{
    public List<string> UnmappedProperties { get; } = [];
    public string TypeName { get; set; }
    public string Tag { get; set; }
    public HmiUnifiedEngineeringObject(string typeName, string tag) { TypeName = typeName; Tag = tag; }
    public static IReadOnlyList<HmiUnifiedEngineeringType> Types { get; } = ReadTypes();
    private static IReadOnlyList<HmiUnifiedEngineeringType> ReadTypes()
    {
        XNamespace c = HmiScreenToUnifiedXmlConverter.ContractNamespace;
        return XDocument.Parse(HmiUnifiedXmlCatalog.Read()).Root!.Element(c + "types")!.Elements().Select(t => new HmiUnifiedEngineeringType(
            (string)t.Attribute("name")!, (string)t.Attribute("tag")!,
            t.Elements(c + "property").Select(p => new HmiUnifiedEngineeringProperty((string)p.Attribute("name")!,
                (string)p.Element(c + "value")!.Attribute("kind")!, (string?)p.Element(c + "value")!.Attribute("type"),
                p.Element(c + "value")!.Elements(c + "enum").ToDictionary(e => (string)e.Attribute("name")!, e => (string)e.Attribute("value")!))).ToArray(),
            t.Elements(c + "member").Select(m => new HmiUnifiedEngineeringMember((string)m.Attribute("name")!,
                (string?)m.Attribute("collection") == "true", (string?)m.Attribute("declared-type"))).ToArray())).ToArray();
    }
}

public sealed class HmiUnifiedEngineeringType
{
    public string Name { get; }
    public string Tag { get; }
    public IReadOnlyList<HmiUnifiedEngineeringProperty> Properties { get; }
    public IReadOnlyList<HmiUnifiedEngineeringMember> Members { get; }
    public HmiUnifiedEngineeringType(string name, string tag, IReadOnlyList<HmiUnifiedEngineeringProperty> properties, IReadOnlyList<HmiUnifiedEngineeringMember> members)
    { Name = name; Tag = tag; Properties = properties; Members = members; }
}
public sealed class HmiUnifiedEngineeringProperty
{
    public string Name { get; }
    public string Kind { get; }
    public string? Type { get; }
    public IReadOnlyDictionary<string, string> EnumValues { get; }
    public HmiUnifiedEngineeringProperty(string name, string kind, string? type, IReadOnlyDictionary<string, string> enumValues)
    { Name = name; Kind = kind; Type = type; EnumValues = enumValues; }
}
public sealed class HmiUnifiedEngineeringMember
{
    public string Name { get; }
    public bool Collection { get; }
    public string? Type { get; }
    public HmiUnifiedEngineeringMember(string name, bool collection, string? type) { Name = name; Collection = collection; Type = type; }
}

/// <summary>Exact runtime type for object-valued properties, including arrays and enums.</summary>
public sealed class HmiUnifiedEngineeringValue
{
    public string Kind { get; set; }
    public string? TypeName { get; set; }
    public object? Value { get; set; }
    public string? Encoding { get; set; }
    public HmiUnifiedEngineeringValue(string kind, string? typeName, object? value, string? encoding = null)
    { Kind = kind; TypeName = typeName; Value = value; Encoding = encoding; }
}
