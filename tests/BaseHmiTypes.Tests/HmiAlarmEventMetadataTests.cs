using System.Text.Json;
using BaseHmiTypes.Alarms;
using BaseHmiTypes.Scripts;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public class HmiAlarmEventMetadataTests
{
    [TestMethod]
    public void AlarmEventAndSourceMetadataSerializeWithTheSharedCamelCaseContract()
    {
        var alarm = new HmiDiscreteAlarm { AlarmId = 3 };
        alarm.SourceProperties["NativeMessageSlot"] = "2";
        alarm.Events.Add(new HmiEventBinding { EventName = "MessageArrives" });
        using var json = JsonDocument.Parse(JsonSerializer.Serialize(alarm, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }));
        Assert.AreEqual(3, json.RootElement.GetProperty("alarmId").GetInt32());
        Assert.AreEqual("2", json.RootElement.GetProperty("sourceProperties").GetProperty("NativeMessageSlot").GetString());
        Assert.AreEqual("MessageArrives", json.RootElement.GetProperty("events")[0].GetProperty("eventName").GetString());
        var other = new HmiDiscreteAlarm(); Assert.IsEmpty(other.Events); Assert.IsEmpty(other.SourceProperties);
    }
}
