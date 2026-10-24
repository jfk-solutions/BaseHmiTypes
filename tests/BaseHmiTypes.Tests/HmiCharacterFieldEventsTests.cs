using System.Text.Json;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Scripts;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public class HmiCharacterFieldEventsTests
{
    [TestMethod]
    public void FieldActionsKeepOwnerMetadataAndSerializeWithTheSharedContract()
    {
        var screen = new HmiCharacterScreen();
        var binding = new HmiEventBinding { EventName = "SelectField" };
        binding.SourceProperties["NativeFieldGroupSlot"] = "2";
        binding.SourceProperties["NativeFieldIndex"] = "1";
        screen.FieldEvents.Add(binding);
        using var json = JsonDocument.Parse(JsonSerializer.Serialize(screen, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }));
        var field = json.RootElement.GetProperty("fieldEvents")[0];
        Assert.AreEqual("SelectField", field.GetProperty("eventName").GetString());
        Assert.AreEqual("2", field.GetProperty("sourceProperties").GetProperty("NativeFieldGroupSlot").GetString());
        Assert.IsEmpty(new HmiCharacterScreen().FieldEvents);
        Assert.IsEmpty(screen.Events);
    }
}
