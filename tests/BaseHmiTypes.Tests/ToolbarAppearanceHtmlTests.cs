using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Controls;
using BaseHmiTypes.Converters.Html;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;
[TestClass]
public class ToolbarAppearanceHtmlTests
{
    [TestMethod] [DataRow("trend")] [DataRow("function")] [DataRow("alarm")]
    public async Task ToolbarFontAndExplicitFalseFlagsRemainIndependent(string kind)
    {
        HmiPaintedScreenItemBase item=kind=="alarm"?new HmiAlarmControl():kind=="function"?new HmiFunctionTrendControl():new HmiTrendControl();
        var font=new HmiFont { Name="Toolbar Serif",Size=17,Bold=true,Italic=true,Underline=true,Strikethrough=true };
        if(item is HmiTrendControlBase trend) { trend.ToolbarFont=font;trend.ToolbarForegroundColor=HmiColor.FromArgb(0,17,34,51);trend.ShowToolbar=true;trend.StatusBarFont=new() { Name="Status Serif",Size=11 }; }
        else {var alarm=(HmiAlarmControl)item;alarm.ToolbarFont=font;alarm.ShowToolbar=true;alarm.StatusBarFont=new() { Name="Status Serif",Size=11 };alarm.ShowStatusBar=true;}
        var screen=new HmiScreen();var layer=new HmiLayer();layer.Items.Add(item);screen.Layers.Add(layer);var converter=new HmiScreenToHtmlConverter();
        var html=await converter.ConvertAsync(screen);var prefix=item is HmiTrendControlBase?"--hmi-trend-toolbar-":"";
        StringAssert.Contains(html,prefix+"font-family: Toolbar Serif;");StringAssert.Contains(html,prefix+"font-size: 17px;");StringAssert.Contains(html,prefix+"font-weight: bold;");StringAssert.Contains(html,prefix+"font-style: italic;");StringAssert.Contains(html,prefix+"text-decoration: underline line-through;");
        if(item is HmiTrendControlBase) StringAssert.Contains(html,"--hmi-trend-toolbar-foreground: rgba(17,34,51,0);");
        font.Bold=false;font.Italic=false;font.Underline=false;font.Strikethrough=false;
        var normal=await converter.ConvertAsync(screen);StringAssert.Contains(normal,prefix+"font-weight: normal;");StringAssert.Contains(normal,prefix+"font-style: normal;");StringAssert.Contains(normal,prefix+"text-decoration: none;");
        font.LocalizedFonts[1031]=new HmiFont { Name="Localized Toolbar",Size=19 };
        var localized=await converter.ConvertAsync(screen,options:new HmiHtmlConvertOptions { CultureLcid=1031 });
        StringAssert.Contains(localized,prefix+"font-family: Localized Toolbar;");StringAssert.Contains(localized,prefix+"font-size: 19px;");
        if(item is HmiTrendControlBase t) {t.ShowToolbar=false;Assert.AreSame(font,t.ToolbarFont);} else {var a=(HmiAlarmControl)item;a.ShowToolbar=false;Assert.AreSame(font,a.ToolbarFont);Assert.IsFalse((await converter.ConvertAsync(screen)).Contains("class=\"hmi-alarm-toolbar\""));}
    }
}
