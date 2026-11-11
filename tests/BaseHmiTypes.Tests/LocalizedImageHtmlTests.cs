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

    private sealed class Images : BaseHmiTypes.Projects.HmiProjectBase
    {
        public BaseHmiTypes.Images.HmiImage Image { get; } = new() { Id = "logical", Name = "Active", ImageType = BaseHmiTypes.Images.HmiImageType.Png, Data = [1] };
        public override ValueTask<BaseHmiTypes.Images.HmiImage?> GetImageAsync(string id, CancellationToken cancellationToken = default) => new(id == Image.Id ? Image : null);
    }

    [TestMethod]
    public async Task NamedProjectImagesSelectLocalizedPayloadsThroughIdResolution()
    {
        var project = new Images();
        project.Image.LocalizedImages[1031] = new() { ImageType = BaseHmiTypes.Images.HmiImageType.Png, Data = [2] };
        var screen = new HmiScreen(); var layer = new HmiLayer(); screen.Layers.Add(layer);
        layer.Items.Add(new HmiButton { Name = "Graphic", Image = new HmiImageSource { ImageId = "logical" } });
        foreach (var (culture, payload) in new[] { (1031, "Ag=="), (2057, "AQ==") })
        {
            var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen, project, new HmiHtmlConvertOptions { CultureLcid = culture });
            StringAssert.Contains(html, "data:image/png;base64," + payload);
        }
        Assert.AreEqual(1, project.Image.Data[0]);
    }
}
