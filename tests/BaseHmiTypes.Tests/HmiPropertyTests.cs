using BaseHmiTypes.Screens.Base;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public class HmiPropertyTests
{
    [TestMethod]
    public void StaticProperty_CanBeAssignedWithPlainValue()
    {
        HmiProperty<double> property = 42;

        Assert.AreEqual(HmiPropertyKind.Static, property.Kind);
        Assert.AreEqual(42, property.GetStaticValueOrDefault());
    }

    [TestMethod]
    public void ScriptProperty_StoresScriptLanguageAndFallbackValue()
    {
        var property = HmiProperty.Script("return Tags.Speed > 10;", HmiScriptLanguage.JavaScript, false);

        Assert.AreEqual(HmiPropertyKind.Script, property.Kind);
        Assert.AreEqual(HmiScriptLanguage.JavaScript, property.Language);
        Assert.AreEqual("return Tags.Speed > 10;", property.Script);
        Assert.AreEqual(false, property.GetStaticValueOrDefault(true));
    }

    [TestMethod]
    public void DynamicProperties_StoreTriggers()
    {
        var property = HmiProperty.Script("return Tags.Speed > 10;", HmiScriptLanguage.JavaScript, false);

        property.Triggers.Add(new HmiTagTrigger
        {
            Name = "SpeedChanged",
            Mode = HmiTagTriggerMode.ValueChange
        });
        ((HmiTagTrigger)property.Triggers[0]).TagNames.Add("Speed");

        Assert.AreEqual(1, property.Triggers.Count);
        Assert.AreEqual(HmiTriggerKind.Tag, property.Triggers[0].Kind);
        Assert.AreEqual("SpeedChanged", property.Triggers[0].Name);
        CollectionAssert.AreEqual(new[] { "Speed" }, ((HmiTagTrigger)property.Triggers[0]).TagNames.ToArray());
    }

    [TestMethod]
    public void ExpressionProperty_StoresConverters()
    {
        var property = HmiProperty.Expression("Tags.Speed", 0d);

        property.Converters.Add(new HmiValueConverter
        {
            Kind = HmiValueConverterKind.Linear,
            Name = "ScaleSpeed"
        });
        property.Converters[0].Parameters["factor"] = 0.1d;

        Assert.AreEqual(HmiPropertyKind.Expression, property.Kind);
        Assert.AreEqual(1, property.Converters.Count);
        Assert.AreEqual(HmiValueConverterKind.Linear, property.Converters[0].Kind);
        Assert.AreEqual("ScaleSpeed", property.Converters[0].Name);
        Assert.AreEqual(0.1d, property.Converters[0].Parameters["factor"]);
    }

    [TestMethod]
    public void Thickness_AllowsDynamicValuesPerSide()
    {
        var thickness = new HmiThickness
        {
            Left = 4,
            Top = HmiProperty.Script("return Tags.MarginTop;", HmiScriptLanguage.JavaScript, 8d),
            Right = 12,
            Bottom = 16
        };

        Assert.AreEqual(HmiPropertyKind.Static, thickness.Left.Kind);
        Assert.AreEqual(HmiPropertyKind.Script, thickness.Top.Kind);
        Assert.AreEqual(8, thickness.Top.GetStaticValueOrDefault());
        Assert.AreEqual(12, thickness.Right.GetStaticValueOrDefault());
        Assert.AreEqual(16, thickness.Bottom.GetStaticValueOrDefault());
    }

    [TestMethod]
    public void BlinkProperty_StoresAlternateValueRateAndCondition()
    {
        var baseColor = HmiColor.FromArgb(255, 0, 0, 0);
        var blinkColor = HmiColor.FromArgb(255, 255, 0, 0);

        var property = HmiProperty.Blink(
            baseColor,
            blinkColor,
            HmiBlinkRate.Fast,
            HmiBlinkCondition.WhenTrue,
            "AlarmActive");

        Assert.AreEqual(HmiPropertyKind.Blink, property.Kind);
        Assert.AreEqual(baseColor, property.GetStaticValueOrDefault());
        Assert.AreEqual(blinkColor, property.BlinkValue);
        Assert.AreEqual(HmiBlinkRate.Fast, property.Rate);
        Assert.AreEqual(HmiBlinkCondition.WhenTrue, property.Condition);
        Assert.AreEqual("AlarmActive", property.ConditionTagName);
    }
}
