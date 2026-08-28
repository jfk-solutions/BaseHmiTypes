using BaseHmiTypes.Recipes;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public class HmiRecipeTests
{
    [TestMethod]
    public void Parameter_RetainsEngineeringMetadata()
    {
        var parameter = new HmiRecipeParameter
        {
            Name = "Pressure",
            Unit = "bar",
            MinimumValue = "0.0",
            MaximumValue = "16.0"
        };

        Assert.AreEqual("bar", parameter.Unit);
        Assert.AreEqual("0.0", parameter.MinimumValue);
        Assert.AreEqual("16.0", parameter.MaximumValue);
    }
}
