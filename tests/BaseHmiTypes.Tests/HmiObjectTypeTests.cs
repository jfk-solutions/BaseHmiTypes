using System.Text.Json;
using BaseHmiTypes.Common;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Controls;
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
        Assert.AreEqual(HmiObjectType.HmiArrowIndicator, new HmiArrowIndicator().HmiObjectType);
        Assert.AreEqual(HmiObjectType.HmiDynamicSvg, new HmiDynamicSvg().HmiObjectType);
        Assert.AreEqual(HmiObjectType.HmiRadarChartControl, new HmiRadarChartControl().HmiObjectType);
    }

    [TestMethod]
    public void JsonSerialization_IncludesStringHmiObjectType()
    {
        var json = JsonSerializer.Serialize(new HmiButton { Name = "Start" });

        StringAssert.Contains(json, "\"HmiObjectType\":\"HmiButton\"");
    }

    [TestMethod]
    public void ReferenceObjectSettings_RetainParameterAssignments()
    {
        var settings = new HmiReferenceObjectSettings { Source = "Library.Motor" };
        settings.Parameters.Add(new HmiReferenceParameter { Name = "#1", Description = "Motor tag", Value = "[PLC]Motor1" });

        var parameter = settings.Parameters.Single();
        Assert.AreEqual("#1", parameter.Name);
        Assert.AreEqual("Motor tag", parameter.Description);
        Assert.AreEqual("[PLC]Motor1", parameter.Value);
    }

    [TestMethod]
    public void ButtonOperations_ExposeNavigationHistoryActions()
    {
        var names = Enum.GetNames<HmiButtonOperation>();

        CollectionAssert.IsSubsetOf(
            new[] { "NavigateToPreviousScreen", "NavigateToNextScreen", "ShowNavigationHistory" },
            names);
    }

    [TestMethod]
    public void ButtonActions_ExposeConfiguredButtonValueWriteWithoutRenumberingExistingActions()
    {
        var names = Enum.GetNames<HmiButtonAction>();

        CollectionAssert.Contains(names, "ButtonValue");
        CollectionAssert.Contains(names, "SetToZero");
        CollectionAssert.Contains(names, "ToggleTagValue");
        Assert.AreEqual(3, Convert.ToInt32(Enum.Parse<HmiButtonAction>("SetToOne")));
        Assert.AreEqual(4, Convert.ToInt32(Enum.Parse<HmiButtonAction>("ButtonValue")));
        Assert.AreEqual(5, Convert.ToInt32(Enum.Parse<HmiButtonAction>("SetToZero")));
        Assert.AreEqual(6, Convert.ToInt32(Enum.Parse<HmiButtonAction>("ToggleTagValue")));
    }

    [TestMethod]
    public void ButtonActions_RetainDiagnosticRemark()
    {
        var button = new HmiButton
        {
            ActionRemark = HmiMultilingualText.FromText("Changed mode from /C to /N")
        };

        Assert.AreEqual("Changed mode from /C to /N", button.ActionRemark.StaticValue?.GetText(null));
    }
}
