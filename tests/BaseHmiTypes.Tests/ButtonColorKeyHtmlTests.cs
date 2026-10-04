using BaseHmiTypes.Common;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Text.RegularExpressions;
namespace BaseHmiTypes.Tests;
[TestClass]
public class ButtonColorKeyHtmlTests
{
    public static IEnumerable<object[]> Cases()
    {
        foreach (var enabled in new[] { false, true }) foreach (var pressed in new[] { false, true })
        foreach (var state in new[] { 0, 1, 2 }) foreach (var replacement in new[] { false, true })
        foreach (var keyEnabled in new[] { false, true }) foreach (var mode in new[] { HmiButtonType.GraphicOrText, HmiButtonType.GraphicAndText, HmiButtonType.Text, HmiButtonType.Graphic })
        foreach (var tagged in new[] { false, true }) yield return [enabled, pressed, state, replacement, keyEnabled, mode, tagged];
    }
    [TestMethod, DynamicData(nameof(Cases))]
    public async Task SelectsKeyWithImageAndRespectsStateOverrides(bool enabled, bool pressed, int state, bool replacement, bool keyEnabled, HmiButtonType mode, bool tagged)
    {
        HmiProperty<bool> Flag() => tagged ? HmiProperty.Tag("Picture.KeyEnabled", keyEnabled) : HmiProperty.Static(keyEnabled);
        HmiProperty<HmiColor> Color(byte n) => tagged ? HmiProperty.Tag("Picture.Key", HmiColor.FromArgb(255, n, (byte)(n+1), (byte)(n+2))) : HmiProperty.Static(HmiColor.FromArgb(255,n,(byte)(n+1),(byte)(n+2)));
        var b = new HmiButton { Name = "Key", Width = 160, Height = 100, Enabled = enabled, Pressed = pressed, Mode = mode,
            Text = HmiMultilingualText.FromText("Start"), Image = new HmiImageSource {Uri="up.svg"}, AlternateImage = new HmiImageSource {Uri="down.svg"},
            ImageBackgroundTransparent = Flag(), ImageBackgroundColor = Color(1), AlternateImageBackgroundTransparent = Flag(), AlternateImageBackgroundColor = Color(4),
            DisabledImageBackgroundTransparent = Flag(), DisabledImageBackgroundColor = Color(7), ShowDisabledState = true, DisabledImageMode = HmiDisabledImageMode.Reference,
            DisabledImage = replacement ? new HmiImageSource {Uri="disabled.svg"} : null };
        if (state != 0) b.States.Add(new HmiState {Value=0, Image=new HmiImageSource {Uri="state.svg"}, ImageBackgroundTransparent=state==1, ImageBackgroundColor=HmiColor.FromArgb(255,10,11,12)});
        var s = new HmiScreen();var l=new HmiLayer();l.Items.Add(b);s.Layers.Add(l);
        var html=Regex.Match(await new HmiScreenToHtmlConverter().ConvertAsync(s),"<button id=\"Key\"[^>]*>.*?</button>").Value;
        var disabled=!enabled&&replacement;var source=disabled?"disabled.svg":state!=0?"state.svg":pressed?"down.svg":"up.svg";
        var hasKey=mode!=HmiButtonType.Text&&(disabled?keyEnabled:state!=0?state==1:keyEnabled);var n=disabled?7:state!=0?10:pressed?4:1;
        Assert.AreEqual(hasKey,html.Contains("data-hmi-image-color-key="));
        if(hasKey)StringAssert.Contains(html,$"data-hmi-image-color-key=\"{n},{n+1},{n+2}\"");
        if(mode!=HmiButtonType.Text)StringAssert.Contains(html,$"src=\"{source}\"");
    }
}
