using BaseHmiTypes.Scripts.Commands;

namespace BaseHmiTypes.Tests;

[TestClass]
public sealed class HmiAdvancedScriptCommandCatalogTests
{
    [TestMethod]
    public void Catalog_ContainsGeneratedAdvancedCommandsWithParameterMetadata()
    {
        var catalog = HmiAdvancedScriptCommandCatalog.Instance;

        Assert.AreEqual(467, catalog.Commands.Count);

        var activateScreen = catalog.FindByKey("Utah-Functions.ActivateScreen");

        Assert.IsNotNull(activateScreen);
        Assert.AreEqual("ActivateScreen", activateScreen.Name);
        Assert.AreEqual(typeof(ActivateScreenCommand), activateScreen.CommandType);
        Assert.AreEqual(2, activateScreen.Parameters.Count);
        Assert.AreEqual("Screen name", activateScreen.Parameters[0].Name);
        Assert.IsTrue(activateScreen.Parameters[0].AcceptedTypes.Count > 0);
    }

    [TestMethod]
    public void Catalog_CreatesDistinctTypedCommandsForDuplicateScriptNames()
    {
        var catalog = HmiAdvancedScriptCommandCatalog.Instance;

        var internalCommand = catalog.CreateCommandByKey("InternalFunctions.ActivatePreviousScreen");
        var utahCommand = catalog.CreateCommandByKey("Utah-Functions.ActivatePreviousScreen");

        Assert.AreEqual("ActivatePreviousScreen", internalCommand.CommandName);
        Assert.AreEqual("ActivatePreviousScreen", utahCommand.CommandName);
        Assert.AreNotEqual(internalCommand.GetType(), utahCommand.GetType());
    }
}

