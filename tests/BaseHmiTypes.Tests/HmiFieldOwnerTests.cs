using System.Text.Json;
using BaseHmiTypes.Projects;
using BaseHmiTypes.Scripts;
using Microsoft.VisualStudio.TestTools.UnitTesting;
namespace BaseHmiTypes.Tests;
[TestClass]
public class HmiFieldOwnerTests
{
    private sealed class EmptyProject : HmiProjectBase { }
    private sealed class FieldProject(HmiFieldOwner owner) : HmiProjectBase
    { public override IReadOnlyList<HmiFieldOwner> FieldOwners => [owner]; }
    [TestMethod]
    public void SourceOwnersRetainUnresolvedAssociationAndExposeTheirActions()
    {
        Assert.IsEmpty(new EmptyProject().FieldOwners);Assert.IsEmpty(new EmptyProject().FieldEvents);
        var owner=new HmiFieldOwner {Id="source/Fields/2/0",SourceFormat="ProTool.CEintragData",SourceData=[42,0]};
        owner.SourceProperties["OwnerScreenAssociation"]="Unresolved";
        var project=new FieldProject(owner);Assert.IsEmpty(project.FieldEvents);
        var binding=new HmiEventBinding {EventName="SelectField"};owner.Events.Add(binding);
        Assert.AreSame(binding,project.FieldEvents.Single());Assert.IsEmpty(project.GlobalEvents);
        using var json=JsonDocument.Parse(JsonSerializer.Serialize(project.FieldOwners,new JsonSerializerOptions {PropertyNamingPolicy=JsonNamingPolicy.CamelCase}));
        Assert.AreEqual("Unresolved",json.RootElement[0].GetProperty("sourceProperties").GetProperty("OwnerScreenAssociation").GetString());
        Assert.AreEqual("SelectField",json.RootElement[0].GetProperty("events")[0].GetProperty("eventName").GetString());
    }
}
