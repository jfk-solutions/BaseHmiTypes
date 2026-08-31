using BaseHmiTypes.Tags;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public class HmiTagTests
{
    [TestMethod]
    public void Tag_RetainsExportedAlarmAndValueTypeMetadata()
    {
        var tag = new HmiTag { Name = "Pressure", Alarmed = true, ValueType = "F", AccessRight = "both" };

        Assert.IsTrue(tag.Alarmed);
        Assert.AreEqual("F", tag.ValueType);
        Assert.AreEqual("both", tag.AccessRight);
    }
}
