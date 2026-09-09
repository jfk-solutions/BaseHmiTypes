using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Widgets;
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

    [TestMethod]
    public void RetainsParserSpecificStateSourceData()
    {
        var source = new byte[] { 4, 5, 6 };
        var state = new HmiState
        {
            SourceFormat = "ExampleStateRecord",
            SourceData = source
        };
        state.SourceProperties["field.0x00.uint32le"] = "0x00000001";

        CollectionAssert.AreEqual(source, state.SourceData);
        Assert.AreEqual("ExampleStateRecord", state.SourceFormat);
        Assert.AreEqual("0x00000001", state.SourceProperties["field.0x00.uint32le"]);
    }
}
