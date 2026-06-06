using System.Text.Json;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public class HmiObjectTypeTests
{
    [TestMethod]
    public void Constructors_SetConcreteHmiObjectType()
    {
        Assert.AreEqual(HmiObjectType.HmiScreen, new HmiScreen().HmiObjectType);
        Assert.AreEqual(HmiObjectType.HmiButton, new HmiButton().HmiObjectType);
        Assert.AreEqual(HmiObjectType.HmiToggleSwitch, new HmiToggleSwitch().HmiObjectType);
        Assert.AreEqual(HmiObjectType.HmiDynamicSvg, new HmiDynamicSvg().HmiObjectType);
    }

    [TestMethod]
    public void JsonSerialization_IncludesStringHmiObjectType()
    {
        var json = JsonSerializer.Serialize(new HmiButton { Name = "Start" });

        StringAssert.Contains(json, "\"HmiObjectType\":\"HmiButton\"");
    }
}
