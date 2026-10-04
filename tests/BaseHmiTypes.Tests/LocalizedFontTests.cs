using BaseHmiTypes.Screens.Base;
using Microsoft.VisualStudio.TestTools.UnitTesting;
namespace BaseHmiTypes.Tests;
[TestClass] public class LocalizedFontTests
{
    [TestMethod] public void PartialOverridesMergeWithoutChangingNeutralOrInventingMissingValues()
    {
        var font = new HmiFont { Name = "Neutral", Size = 12, Bold = true, Italic = true, CharacterHeight = 4 };
        font.LocalizedFonts[1031] = new HmiFont { Name = "", Size = 0, Bold = false, Italic = false };
        var localized = font.GetForCulture(1031);
        Assert.AreEqual("", localized.Name!.StaticValue); Assert.AreEqual(0d, localized.Size!.StaticValue);
        Assert.IsFalse(localized.Bold!.StaticValue); Assert.IsFalse(localized.Italic!.StaticValue);
        Assert.AreEqual(4d, localized.CharacterHeight!.StaticValue); Assert.IsNull(localized.Weight);
        Assert.AreSame(font, font.GetForCulture(null)); Assert.AreSame(font, font.GetForCulture(1036));
        Assert.AreEqual("Neutral", font.Name!.StaticValue); Assert.IsTrue(font.Bold!.StaticValue);
    }
}
