using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Tests;

[TestClass]
public sealed class HmiColorAnimationTests
{
    [TestMethod]
    public void RetainsFractionalBlinkCycleDurationInSeconds()
    {
        var animation = new HmiColorAnimation { BlinkRate = 1.5 };

        Assert.AreEqual(1.5, animation.BlinkRate);
    }
}
