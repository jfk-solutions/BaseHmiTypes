using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public class LocalizedImageHtmlTests
{
    [TestMethod]
    public async Task SelectsRenderCultureAndRetainsNeutralFallback()
    {
        var source = new HmiImageSource { Uri = "default.svg" };
        source.LocalizedUris[1031] = "german.svg"; source.LocalizedUris[2057] = "english.svg";
        var screen = new HmiScreen(); var layer = new HmiLayer(); screen.Layers.Add(layer);
        layer.Items.Add(new HmiButton { Name = "Language", Image = source });
        foreach (var (culture, expected) in new[] { (1031, "german.svg"), (2057, "english.svg"), (1036, "default.svg") })
        {
            var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen, options: new HmiHtmlConvertOptions { CultureLcid = culture });
            StringAssert.Contains(html, $"src=\"{expected}\"");
        }
        Assert.AreEqual("default.svg", source.Uri); Assert.AreEqual(2, source.LocalizedUris.Count);
    }
}
