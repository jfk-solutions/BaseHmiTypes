using BaseHmiTypes.Projects;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Scripts;
using System.Text.Json;

namespace BaseHmiTypes.Tests;

[TestClass]
public class HmiDeviceFrameContractTests
{
    [TestMethod]
    public void NonvisualKeysAndDeviceLedRoutesSurviveNeutralSerialization()
    {
        var screen = new HmiScreen();
        var key = new HmiDeviceKeyBinding { Name = "F1", InputCode = "0:200" };
        key.Events.Add(new HmiEventBinding { EventName = "PressKey", RepeatIntervalSeconds = .5 });
        screen.DeviceKeys.Add(key);
        Assert.HasCount(0, screen.Layers);
        Assert.HasCount(0, new HmiScreen().DeviceKeys);
        var json = JsonDocument.Parse(JsonSerializer.Serialize(screen));
        Assert.AreEqual("0:200", json.RootElement.GetProperty("DeviceKeys")[0].GetProperty("InputCode").GetString());
        Assert.AreEqual(.5, json.RootElement.GetProperty("DeviceKeys")[0].GetProperty("Events")[0].GetProperty("RepeatIntervalSeconds").GetDouble());
        var info = new HmiDeviceInfo { FrameLedRouting = new HmiDeviceFrameLedRouting { Encoding = HmiDeviceFrameLedEncoding.OffSlowFastOn } };
        info.FrameLedRouting.Bindings.Add(new HmiDeviceFrameLedBinding { OutputCode = "1", LedId = "F1:led", BitIndex = 7 });
        var restored = JsonSerializer.Deserialize<HmiDeviceInfo>(JsonSerializer.Serialize(info))!;
        Assert.AreEqual(HmiDeviceFrameLedEncoding.OffSlowFastOn, restored.FrameLedRouting!.Encoding);
        // The routing collection is getter-only, like the other shared graph collections.
        Assert.AreEqual(2, info.FrameLedRouting.Bindings[0].BitCount);
        Assert.IsNull(new HmiDeviceInfo().FrameLedRouting);
    }
}
