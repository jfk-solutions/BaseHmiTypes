using BaseHmiTypes.Screens;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public sealed class HmiScreenSourceDataTests
{
    [TestMethod]
    public void RetainsParserSpecificScreenSourceData()
    {
        var source = new byte[] { 1, 2, 3 };
        var screen = new HmiScreen
        {
            SourceFormat = "ExampleDisplay",
            SourceData = source
        };
        screen.SourceProperties["futureSetting"] = "enabled";

        CollectionAssert.AreEqual(source, screen.SourceData);
        Assert.AreEqual("ExampleDisplay", screen.SourceFormat);
        Assert.AreEqual("enabled", screen.SourceProperties["futureSetting"]);
    }
}
