using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public class HmiGaugeTests
{
    [TestMethod]
    public void LinearGauge_RetainsProcessAndLimitBindings()
    {
        var gauge = new HmiGauge
        {
            EngineeringUnit = HmiProperty.Expression<string>("{Unit}"),
            TargetValue = HmiProperty.Expression<double>("{Target}"),
            TargetHighDeviation = HmiProperty.Expression<double>("{HighDeviation}"),
            TargetLowDeviation = HmiProperty.Expression<double>("{LowDeviation}"),
            SetpointValue = HmiProperty.Expression<double>("{Setpoint}"),
            ThresholdHighHigh = HmiProperty.Expression<double>("{HighHigh}"),
            ThresholdHigh = HmiProperty.Expression<double>("{High}"),
            ThresholdLow = HmiProperty.Expression<double>("{Low}"),
            ThresholdLowLow = HmiProperty.Expression<double>("{LowLow}"),
            ControlLimitHighHigh = HmiProperty.Expression<double>("{ControlHighHigh}"),
            ControlLimitHigh = HmiProperty.Expression<double>("{ControlHigh}"),
            ControlLimitLow = HmiProperty.Expression<double>("{ControlLow}"),
            ControlLimitLowLow = HmiProperty.Expression<double>("{ControlLowLow}")
        };

        Assert.AreEqual("{Unit}", Assert.IsInstanceOfType<HmiExpressionProperty<string>>(gauge.EngineeringUnit).Expression);
        Assert.AreEqual("{Target}", Assert.IsInstanceOfType<HmiExpressionProperty<double>>(gauge.TargetValue).Expression);
        Assert.AreEqual("{ControlLowLow}", Assert.IsInstanceOfType<HmiExpressionProperty<double>>(gauge.ControlLimitLowLow).Expression);
    }
}
