using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public class HmiArrowIndicatorTests
{
    [TestMethod]
    public void ArrowIndicator_RetainsTravelRangeAndValueBinding()
    {
        var arrow = new HmiArrowIndicator
        {
            Value = HmiProperty.Expression<double>("{Level}", 50),
            BeginValue = 0,
            EndValue = 100,
            Orientation = 1
        };

        Assert.AreEqual("{Level}", Assert.IsInstanceOfType<HmiExpressionProperty<double>>(arrow.Value).Expression);
        Assert.AreEqual(0, arrow.BeginValue!.StaticValue);
        Assert.AreEqual(100, arrow.EndValue!.StaticValue);
        Assert.AreEqual(1, arrow.Orientation!.StaticValue);
    }
}
