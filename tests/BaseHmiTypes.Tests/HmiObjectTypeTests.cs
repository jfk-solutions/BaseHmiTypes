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
    public void ReferenceObjectSettings_SeparateSharedAndMaterializedObjects()
    {
        var shared = new HmiButton { Name = "#1 shared" };
        var materialized = new HmiButton { Name = "Motor shared" };
        var settings = new HmiReferenceObjectSettings
        {
            ResolvedObject = shared,
            MaterializedObject = materialized
        };

        Assert.AreSame(shared, settings.ResolvedObject);
        Assert.AreSame(materialized, settings.MaterializedObject);
        Assert.AreNotSame(settings.ResolvedObject, settings.MaterializedObject);
    }

    [TestMethod]
    public void ScreenItem_RetainsGlobalObjectParameterDefinitions()
    {
        var item = new HmiGroup();
        item.Parameters.Add(new HmiScreenParameter { Name = "#1", Description = "Motor tag" });

        var parameter = item.Parameters.Single();
        Assert.AreEqual("#1", parameter.Name);
        Assert.AreEqual("Motor tag", parameter.Description);
        Assert.IsNull(item.ReferenceObject);
    }

    [TestMethod]
    public void ScreenItem_RetainsNamedSourceConnections()
    {
        var item = new HmiIOField();
        item.Connections.Add(new HmiObjectConnection { Name = "Value", Expression = "{[PLC]Speed}" });

        var connection = item.Connections.Single();
        Assert.AreEqual("Value", connection.Name);
        Assert.AreEqual("{[PLC]Speed}", connection.Expression);
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
