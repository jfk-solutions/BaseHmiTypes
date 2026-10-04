using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Text.RegularExpressions;
namespace BaseHmiTypes.Tests;
[TestClass] public class ClockBackgroundHtmlTests
{
 [TestMethod] [DataRow(false,0)] [DataRow(false,1)] [DataRow(false,2)]
 [DataRow(true,0)] [DataRow(true,1)] [DataRow(true,2)]
 public async Task ExplicitBackgroundModesSeparateFrameFromDial(bool analog,int mode)
 {
  var screen=new HmiScreen();var layer=new HmiLayer();screen.Layers.Add(layer);
  layer.Items.Add(new HmiClock { Analog=analog, BackgroundStyle=mode,BackgroundColor=HmiColor.FromArgb(255,192,192,192) });
  var html=Regex.Match(await new HmiScreenToHtmlConverter().ConvertAsync(screen),"<time\\b[\\s\\S]*?</time>").Value;
  StringAssert.Contains(html,$"data-clock-background-style=\"{mode}\"");
  Assert.AreEqual(mode!=0,html.Contains("background: transparent;"));
  Assert.AreEqual(analog&&mode==1,html.Contains("data-clock-dial="));
  if(analog&&mode==1)StringAssert.Contains(html,"fill=\"#C0C0C0\" stroke=\"#808080\"");
 }
}
