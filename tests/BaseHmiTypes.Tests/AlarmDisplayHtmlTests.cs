using Microsoft.VisualStudio.TestTools.UnitTesting;
using BaseHmiTypes.Converters.Html;
using BaseHmiTypes.Screens;
using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Controls;
namespace BaseHmiTypes.Tests;
[TestClass] public class AlarmDisplayHtmlTests
{
 [TestMethod] public async Task StaticMarkupContainsComponentsAndConfiguredTemplates()
 {
  var screen=new HmiScreen();var layer=new HmiLayer();screen.Layers.Add(layer);layer.Items.Add(new HmiAlarmControl{ShowHeader=false});layer.Items.Add(new HmiAlarmLineControl());
  var html=await new HmiScreenToHtmlConverter().ConvertAsync(screen);
  StringAssert.Contains(html,"<hmi-alarm-control");StringAssert.Contains(html,"<hmi-alarm-line-control");StringAssert.Contains(html,"<template data-hmi-alarm-row>");Assert.IsFalse(html.Contains("<thead>"));
 }
}
