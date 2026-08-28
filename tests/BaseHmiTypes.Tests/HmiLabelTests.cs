using BaseHmiTypes.Common;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public class HmiLabelTests
{
    [TestMethod]
    public void TagLabel_RetainsMetadataBindingAndFieldLength()
    {
        var label = new HmiLabel
        {
            Text = HmiProperty.Tag(
                "Tank.Level",
                HmiMultilingualText.FromText("bar"),
                "EngineeringUnits"),
            FieldLength = 12
        };

        var binding = Assert.IsInstanceOfType<HmiTagProperty<HmiMultilingualText>>(label.Text);
        Assert.AreEqual("Tank.Level", binding.TagName);
        Assert.AreEqual("EngineeringUnits", binding.PropertyName);
        Assert.AreEqual(12, label.FieldLength!.StaticValue);
    }
}
