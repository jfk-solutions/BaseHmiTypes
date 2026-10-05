import assert from "node:assert/strict";
import test from "node:test";
import {HmiTrendControl,HmiFunctionTrendControl,HmiTrendControlBase,HmiAlarmControl,HmiFont,HmiHtmlConvertOptions,HmiScreen,HmiLayer,HmiScreenToHtmlConverter,staticProperty,hmiColorFromArgb} from "../dist/index.js";
for(const type of [HmiTrendControl,HmiFunctionTrendControl,HmiAlarmControl]) test(`${type.name} toolbar font and false flags`,async()=>{
 const item=new type(),font=new HmiFont();font.name=staticProperty("Toolbar Serif");font.size=staticProperty(17);for(const key of ["bold","italic","underline","strikethrough"])font[key]=staticProperty(true);item.toolbarFont=font;item.showToolbar=staticProperty(true);if(item instanceof HmiTrendControlBase)item.toolbarForegroundColor=staticProperty(hmiColorFromArgb(0,17,34,51));
 const screen=new HmiScreen(),layer=new HmiLayer();screen.layers.push(layer);layer.items.push(item);const converter=new HmiScreenToHtmlConverter(),html=await converter.convertAsync(screen),prefix=item instanceof HmiTrendControlBase?"--hmi-trend-toolbar-":"";
 for(const value of ["font-family: Toolbar Serif;","font-size: 17px;","font-weight: bold;","font-style: italic;","text-decoration: underline line-through;"])assert.ok(html.includes(prefix+value),value);
 if(item instanceof HmiTrendControlBase)assert.ok(html.includes("--hmi-trend-toolbar-foreground: rgba(17,34,51,0);"));
 for(const key of ["bold","italic","underline","strikethrough"])font[key]=staticProperty(false);const normal=await converter.convertAsync(screen);for(const value of ["font-weight: normal;","font-style: normal;","text-decoration: none;"])assert.ok(normal.includes(prefix+value));
 const localizedFont=new HmiFont();localizedFont.name=staticProperty("Localized Toolbar");localizedFont.size=staticProperty(19);font.localizedFonts.set(1031,localizedFont);const options=new HmiHtmlConvertOptions();options.cultureLcid=1031;const localized=await converter.convertAsync(screen,undefined,options);assert.ok(localized.includes(prefix+"font-family: Localized Toolbar;"));assert.ok(localized.includes(prefix+"font-size: 19px;"));
 item.showToolbar=staticProperty(false);assert.equal(item.toolbarFont,font);if(item instanceof HmiAlarmControl)assert.ok(!(await converter.convertAsync(screen)).includes('class="hmi-alarm-toolbar"'));
});
