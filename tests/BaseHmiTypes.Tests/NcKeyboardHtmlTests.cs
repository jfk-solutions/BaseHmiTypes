using System.Text.RegularExpressions;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Controls;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;
[TestClass]
public class NcKeyboardHtmlTests
{
    [TestMethod] [DataRow(false)] [DataRow(true)]
    public async Task PaletteKeepsIndependentNormalPressedColorsWithoutInventingKeys(bool configured)
    {
        var control = new HmiNcKeyboardControl { Name = "Keyboard <A> & B", Resizable = configured };
        Assert.AreNotSame(control.NormalKeys, control.SpecialKeys); Assert.AreNotSame(control.SpecialKeys, control.EnterKey);
        if (configured)
        {
            control.KeyboardStyle = -7; control.KeyboardBackgroundColor = HmiColor.FromArgb(0,1,2,3);
            foreach (var (appearance, red) in new[] { (control.NormalKeys, 1), (control.SpecialKeys, 21), (control.EnterKey, 41) })
            {
                appearance.NormalBackgroundColor = HmiColor.FromArgb(255,(byte)red,2,3); appearance.NormalForegroundColor = HmiColor.FromArgb(255,(byte)(red+1),4,5);
                appearance.PressedBackgroundColor = HmiColor.FromArgb(255,(byte)(red+2),6,7); appearance.PressedForegroundColor = HmiColor.FromArgb(255,(byte)(red+3),8,9);
            }
        }
        var screen = new HmiScreen(); var layer = new HmiLayer(); layer.Items.Add(control); screen.Layers.Add(layer);
        var html = await new HmiScreenToHtmlConverter().ConvertAsync(screen);
        StringAssert.Contains(html,"NC keyboard layout not decoded"); StringAssert.Contains(html,"data-preview=\"palette\""); StringAssert.Contains(html,"Keyboard &lt;A&gt; &amp; B");
        Assert.AreEqual(configured,html.Contains("data-keyboard-style=")); Assert.AreEqual(configured,html.Contains("overflow: hidden;resize: both;"));
        if(configured) { StringAssert.Contains(html,"data-keyboard-style=\"-7\""); Assert.AreEqual((byte)0,control.KeyboardBackgroundColor!.StaticValue.Alpha); }
        foreach (var (kind, red) in new[] { ("normal",1), ("special",21), ("enter",41) })
        {
            var row = Regex.Match(html,$"<tr data-key-class=\"{kind}\">(.*?)</tr>").Groups[1].Value; Assert.IsTrue(row.Length>0);
            var spans = Regex.Matches(row,"<span[^>]*>(.*?)</span>"); Assert.AreEqual(2,spans.Count);
            foreach(var span in spans.Cast<Match>()) Assert.AreEqual(configured,span.Value.Contains("data-background-color="));
            if(configured) {
                StringAssert.Contains(spans[0].Value,$"background-color: #{red:X2}0203;"); StringAssert.Contains(spans[0].Value,$"color: #{red+1:X2}0405;");
                StringAssert.Contains(spans[1].Value,$"background-color: #{red+2:X2}0607;"); StringAssert.Contains(spans[1].Value,$"color: #{red+3:X2}0809;");
            } else foreach(var span in spans.Cast<Match>()) StringAssert.Contains(span.Value,"Not configured");
        }
    }
}
