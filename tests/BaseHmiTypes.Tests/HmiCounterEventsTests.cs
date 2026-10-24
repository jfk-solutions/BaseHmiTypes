using System.Text.Json;
using BaseHmiTypes.Projects;
using BaseHmiTypes.Scripts;
using Microsoft.VisualStudio.TestTools.UnitTesting;
namespace BaseHmiTypes.Tests;
[TestClass]
public class HmiCounterEventsTests
{
    private sealed class EmptyProject : HmiProjectBase { }
    private sealed class CounterProject(HmiEventBinding binding) : HmiProjectBase
    { public override IReadOnlyList<HmiEventBinding> CounterEvents => [binding]; }
    [TestMethod]
    public void CounterActionsRetainOwnerMetadataWithoutEnteringGlobalEvents()
    {
        Assert.IsEmpty(new EmptyProject().CounterEvents);
        var binding=new HmiEventBinding { EventName="Overflow" };
        binding.SourceProperties["NativeArchiveSlot"]="2";
        binding.SourceProperties["NativeArchiveName"]="ARCHIV_3";
        var project=new CounterProject(binding);
        using var json=JsonDocument.Parse(JsonSerializer.Serialize(project.CounterEvents,new JsonSerializerOptions { PropertyNamingPolicy=JsonNamingPolicy.CamelCase }));
        var counter=json.RootElement[0];Assert.AreEqual("Overflow",counter.GetProperty("eventName").GetString());
        Assert.AreEqual("2",counter.GetProperty("sourceProperties").GetProperty("NativeArchiveSlot").GetString());
        Assert.AreEqual("ARCHIV_3",counter.GetProperty("sourceProperties").GetProperty("NativeArchiveName").GetString());
        Assert.IsEmpty(project.GlobalEvents);
    }
}
