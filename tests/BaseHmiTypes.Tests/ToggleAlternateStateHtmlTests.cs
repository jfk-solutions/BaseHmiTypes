using System.Text.RegularExpressions;
using BaseHmiTypes.Common;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Widgets;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;
[TestClass]
public class ToggleAlternateStateHtmlTests
{
    [TestMethod] [DataRow(false,false)] [DataRow(false,true)] [DataRow(true,false)] [DataRow(true,true)]
    public async Task BooleanStateOverridesNumberedSelectionWithoutCreatingStates(bool alternate,bool withStates)
    {
        var item=new HmiToggleSwitch { Name="GenericSwitch",State=1,IsAlternateState=HmiProperty.Tag("Switch.State",alternate),Text=HmiMultilingualText.FromText("Off <A>"),AlternateText=HmiMultilingualText.FromText("On & B") };
        if(withStates) { item.States.Add(new(){Value=0,ForegroundColor=HmiColor.FromArgb(255,17,34,51)});item.States.Add(new(){Value=1,ForegroundColor=HmiColor.FromArgb(255,68,85,102)}); }
        var screen=new HmiScreen();var layer=new HmiLayer();screen.Layers.Add(layer);layer.Items.Add(item);var renderer=new HmiScreenToHtmlConverter();
        string Root(string html)=>Regex.Match(html,"<hmi-toggle-switch[^>]*id=\"GenericSwitch\"[^>]*>").Value;
        var root=Root(await renderer.ConvertAsync(screen));Assert.AreEqual(alternate,Regex.IsMatch(root,@"\schecked(?:\s|>)"));StringAssert.Contains(root,$"data-is-alternate-state=\"{alternate.ToString().ToLowerInvariant()}\"");
        if(withStates)StringAssert.Contains(root,alternate?"color: #445566;":"color: #112233;");
        StringAssert.Contains(root,"text=\"Off &lt;A&gt;\"");StringAssert.Contains(root,"alternate-text=\"On &amp; B\"");
        Assert.AreEqual(withStates?2:0,item.States.Count);Assert.AreEqual(1d,item.State.StaticValue);
        item.IsAlternateState=null;root=Root(await renderer.ConvertAsync(screen));Assert.AreEqual(withStates,Regex.IsMatch(root,@"\schecked(?:\s|>)"));Assert.IsFalse(root.Contains("data-is-alternate-state="));
    }
}
