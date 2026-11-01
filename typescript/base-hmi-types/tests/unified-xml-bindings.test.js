import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {DOMParser,XMLSerializer} from '@xmldom/xmldom';
import {HmiUnifiedXmlCatalog,HmiUnifiedXmlToScreenConverter,HmiScreenToUnifiedXmlConverter,HmiIOField,HmiSymbolicIOField,HmiScreen,HmiLayer,HmiClock,HmiWebControl,HmiMediaControl,HmiBar,staticProperty,HmiEventBinding,HmiTextScriptAction,HmiScriptLanguage,HmiScreenToHtmlConverter,getStaticValue} from '../dist/index.js';
globalThis.DOMParser=DOMParser;globalThis.XMLSerializer=XMLSerializer;
const catalog=await HmiUnifiedXmlCatalog.read(new Uint8Array(await readFile(HmiUnifiedXmlCatalog.url)));
const source=await readFile('../../tests/BaseHmiTypes.Tests/Fixtures/unified-v19-bindings.xml','utf8');
test('IO controls and exact tag/resource engineering settings survive edits without source XML',async()=>{
 const reader=new HmiUnifiedXmlToScreenConverter(catalog),{screen}=await reader.convert(source);
 const [field,symbolic,caption]=screen.layers[0].items;
 assert.ok(field instanceof HmiIOField);assert.ok(symbolic instanceof HmiSymbolicIOField);
 assert.equal(getStaticValue(field.processValue),'10.25');assert.equal(getStaticValue(field.ioFieldType),'InputOutput');
 assert.equal(getStaticValue(field.inputBehavior.acceptOnDeactivated),true);assert.equal(getStaticValue(field.inputBehavior.clearOnActivate),false);assert.equal(getStaticValue(field.inputBehavior.hiddenInput),true);
 assert.equal(getStaticValue(symbolic.resourceList),'@Default.Messages');assert.equal(getStaticValue(symbolic.selectedIndex),2);
 const binding=field.visible.unifiedTagDynamization;
 const color=field.backgroundColor.unifiedTagDynamization.valueConverter.mappingTable.entries[0];
 assert.deepEqual(color.value,{alpha:127,red:17,green:34,blue:51});assert.deepEqual(color.alternateValue,{alpha:1,red:170,green:187,blue:204});
 assert.equal(color.from,-5);assert.equal(color.to,3);
 assert.equal(binding.useIndirectAddressing,true);assert.equal(binding.valueConverter.mappingTable.entries[0].relevant,18446744073709551615n);
 assert.equal(binding.valueConverter.mappingTable.entries[0].condition,9223372036854775809n);
 assert.equal(binding.valueConverter.mappingTable.entries[0].value,false);assert.equal(binding.valueConverter.mappingTable.entries[0].flashing,true);
 assert.equal(caption.text.unifiedTagDynamization.resourceList,'@Default.Messages');
 screen.sourceData=undefined;for(const item of screen.layers[0].items){item.sourceData=undefined;item.sourceProperties={};}
 field.processValue.staticValue='42.75';binding.valueConverter.mappingTable.entries[0].value=true;caption.text.unifiedTagDynamization.resourceList='@Default.Edited';
 const result=new HmiScreenToUnifiedXmlConverter(catalog).convert(screen,'Panel');
 assert.match(result.xml,/apiVersion="19.0.0.0"/);assert.match(result.xml,/condition="9223372036854775809"/);
 const doc=new DOMParser().parseFromString(result.xml,'application/xml'),n=HmiScreenToUnifiedXmlConverter.namespace,u=HmiScreenToUnifiedXmlConverter.contractNamespace;
 assert.equal(doc.getElementsByTagNameNS(n,'screen')[0].hasAttributeNS(u,'type'),false);
 assert.equal(doc.getElementsByTagNameNS(n,'iofield')[0].hasAttributeNS(u,'type'),false);
 assert.equal(doc.getElementsByTagNameNS(n,'mapping-table-entry-bitmask')[0].getAttributeNS(u,'type'),'MappingTableEntryBitmask.Boolean');
 assert.equal(doc.getElementsByTagNameNS(n,'mapping-table-entry-range')[0].getAttributeNS(u,'type'),'MappingTableEntryRange.Color');
 doc.getElementsByTagNameNS(n,'mapping-table-entry-range')[0].removeAttributeNS(u,'type');
 await assert.rejects(reader.convert(new XMLSerializer().serializeToString(doc)),/ambiguous contract selector/);
 const restoredItems=(await reader.convert(result.xml)).screen.layers[0].items;const restored=restoredItems[0];
 assert.ok(restored instanceof HmiIOField);assert.equal(getStaticValue(restored.processValue),'42.75');
 assert.equal(restored.visible.unifiedTagDynamization.valueConverter.mappingTable.entries[0].value,true);
 assert.deepEqual(restored.backgroundColor.unifiedTagDynamization.valueConverter.mappingTable.entries[0],color);
 assert.equal(restoredItems[2].text.unifiedTagDynamization.resourceList,'@Default.Edited');
 assert.equal(getStaticValue(restored.inputBehavior.hiddenInput),true);
 assert.equal(restored.inputBehavior.hiddenInput.unifiedTagDynamization.tagName,"Mask");
 assert.match(await new HmiScreenToHtmlConverter().convertAsync(screen),/value="42.75"/);
 assert.ok(!result.diagnostics.some(d=>/Ambiguous|No selected catalog/.test(d.message)),JSON.stringify(result.diagnostics));
});


test('selected V21 contracts preserve script settings and text whitespace without source data',async()=>{
 const v21=await HmiUnifiedXmlCatalog.read(new Uint8Array(await readFile(HmiUnifiedXmlCatalog.url)));
 const xml=`<unified-export xmlns="urn:s7mcp:wincc-unified:2" xmlns:u="urn:s7mcp:wincc-unified:2:contract" version="2" apiVersion="21.0.0.0" scope="screen" screen="Main" complete="false"><screen name="Main"><button name="Run"><dynamizations><script-dynamization property-name="Visible" async="True"><script-code>return true;&#xD;\n</script-code><trigger type="AutomaticTags" custom-duration=""><tag name=""/></trigger></script-dynamization></dynamizations></button></screen></unified-export>`;
 const reader=new HmiUnifiedXmlToScreenConverter(v21),{screen}=await reader.convert(xml),original=screen.layers[0].items[0].visible;
 screen.sourceData=undefined;screen.layers[0].items[0].sourceData=undefined;
 const result=new HmiScreenToUnifiedXmlConverter(v21).convert(screen,'Panel');
 const restored=(await reader.convert(result.xml)).screen.layers[0].items[0].visible;
 assert.equal(restored.script,original.script);assert.equal(restored.async,true);assert.deepEqual(restored.triggers,original.triggers);
});


test('selected authoring contracts write rectangles, faceplates and screen windows from models',async()=>{
 const schema=await HmiUnifiedXmlCatalog.read(new Uint8Array(await readFile(HmiUnifiedXmlCatalog.url)));
 const source=await readFile('../../tests/BaseHmiTypes.Tests/Fixtures/unified-authoring-panel.xml','utf8');
 const reader=new HmiUnifiedXmlToScreenConverter(schema),screens=await reader.convertScreens(source);
 let checked=0;
 for(const {screen}of screens){
   screen.sourceData=undefined;for(const item of screen.layers.flatMap(l=>l.items))item.sourceData=undefined;
   const selected=screen.layers.flatMap(l=>l.items).filter(i=>['HmiRectangle','HmiFaceplateContainer','HmiScreenWindow'].includes(i.constructor.name));
   if(!selected.length)continue;
   selected[0].x.staticValue=37;
   const result=new HmiScreenToUnifiedXmlConverter(schema).convert(screen,'Panel'),restored=(await reader.convert(result.xml)).screen;
   const items=restored.layers.flatMap(l=>l.items);
   for(const item of selected){const match=items.find(i=>i.name===item.name);assert.ok(match);assert.equal(match.constructor.name,item.constructor.name);assert.equal(getStaticValue(match.x),getStaticValue(item.x));}
   assert.ok(!result.diagnostics.some(d=>d.message.startsWith('No selected catalog contract')));checked+=selected.length;
 }
 assert.ok(checked>=3);
});


test('property events remain editable without source XML and scalar settings stay attributes',async()=>{
 const original=await HmiUnifiedXmlCatalog.read(new Uint8Array(await readFile(HmiUnifiedXmlCatalog.url)));
 const catalog=new DOMParser().parseFromString(original,'application/xml'),u='urn:s7mcp:wincc-unified:2:contract';
catalog.documentElement.setAttribute('id','a'.repeat(64));
 const schema=new XMLSerializer().serializeToString(catalog),screen=Object.assign(new HmiScreen(),{name:'Main'});
 screen.events.push(Object.assign(new HmiEventBinding(),{eventName:'QualityCodeChange',propertyName:'BackColor',action:Object.assign(new HmiTextScriptAction(),{language:HmiScriptLanguage.JavaScript,sourceCode:"Tags('Alarm').Write(true);",async:true,globalDefinitionAreaScriptCode:''})}));
 const legacy=new HmiScreenToUnifiedXmlConverter().convert(screen,'Panel');
 const bundled=await HmiUnifiedXmlCatalog.read(new Uint8Array(await readFile(HmiUnifiedXmlCatalog.url)));
 assert.equal((await new HmiUnifiedXmlToScreenConverter(bundled).convert(legacy.xml)).screen.events[0].propertyName,'BackColor');
 const writer=new HmiScreenToUnifiedXmlConverter(schema),reader=new HmiUnifiedXmlToScreenConverter(schema);
 const restored=(await reader.convert(writer.convert(screen,'Panel').xml)).screen;
 assert.equal(restored.events[0].propertyName,'BackColor');assert.equal(restored.events[0].eventName,'QualityCodeChange');
 restored.sourceData=undefined;restored.sourceProperties={};restored.events[0].propertyName='Visible';
 const xml=writer.convert(restored,'Panel').xml;assert.equal((await reader.convert(xml)).screen.events[0].propertyName,'Visible');
 assert.match(xml,/property-name="Visible"/);assert.doesNotMatch(xml,/u:id=|u:type=/);
});


test('additional control scalar settings remain editable with SDK-verified property contracts',async()=>{
 const original=await HmiUnifiedXmlCatalog.read(new Uint8Array(await readFile(HmiUnifiedXmlCatalog.url)));
 const schema=original;
 const screen=Object.assign(new HmiScreen(),{name:'Main'}),layer=new HmiLayer();screen.layers.push(layer);
 layer.items.push(Object.assign(new HmiClock(),{name:'Clock',showHours:staticProperty(true),showMinutes:staticProperty(false),showSeconds:staticProperty(true)}),Object.assign(new HmiWebControl(),{name:'Web',homeUrl:staticProperty('https://example.invalid/'),url:staticProperty('')}),Object.assign(new HmiMediaControl(),{name:'Media',autoPlay:staticProperty(false),source:staticProperty('media.mp4')}),Object.assign(new HmiBar(),{name:'Level',originValue:staticProperty(-12.5)}));
 const writer=new HmiScreenToUnifiedXmlConverter(schema),reader=new HmiUnifiedXmlToScreenConverter(schema);
 const restored=(await reader.convert(writer.convert(screen,'Panel').xml)).screen,items=restored.layers[0].items;
 assert.equal(getStaticValue(items[0].showMinutes),false);assert.equal(getStaticValue(items[1].url),'');assert.equal(getStaticValue(items[2].autoPlay),false);assert.equal(getStaticValue(items[2].source),'media.mp4');assert.equal(getStaticValue(items[3].originValue),-12.5);
 items[0].showMinutes=staticProperty(true);assert.equal(getStaticValue((await reader.convert(writer.convert(restored,'Panel').xml)).screen.layers[0].items[0].showMinutes),true);
});


test('scalar font and padding parts become owner attributes with unchanged model values',async()=>{
 const schema=await HmiUnifiedXmlCatalog.read(new Uint8Array(await readFile(HmiUnifiedXmlCatalog.url))),reader=new HmiUnifiedXmlToScreenConverter(schema);
 const {screen}=await reader.convert(await readFile('../../tests/BaseHmiTypes.Tests/Fixtures/unified-v21-screen.xml','utf8'));
 const button=screen.layers.flatMap(l=>l.items).find(i=>i.constructor.name==='HmiButton');
 button.font.name=staticProperty('Arial');button.font.size=staticProperty(17);button.padding.left=staticProperty(4);
 const result=new HmiScreenToUnifiedXmlConverter(schema).convert(screen,'Panel'),doc=new DOMParser().parseFromString(result.xml,'application/xml'),n=HmiScreenToUnifiedXmlConverter.namespace;
 const node=[...doc.getElementsByTagNameNS(n,'button')].find(e=>e.getAttribute('name')===button.name);
 assert.equal(node.getAttribute('font-size'),'17');assert.equal(node.getAttribute('padding-left'),'4');assert.equal(node.getElementsByTagNameNS(n,'font').length,0);assert.equal(node.getElementsByTagNameNS(n,'padding').length,0);
 const restored=(await reader.convert(result.xml)).screen.layers.flatMap(l=>l.items).find(i=>i.name===button.name);
 assert.equal(getStaticValue(restored.font.size),17);assert.equal(getStaticValue(restored.padding.left),4);
});


test('owned engineering settings remain editable without preview fields or source snapshots', async () => {
 const reader=new HmiUnifiedXmlToScreenConverter();
 const {screen}=await reader.convert(`<unified-export xmlns="urn:s7mcp:wincc-unified:2" version="2"><screen name="Main"><alarm-control name="Alarms"><alarm-view row-height="37" allow-sort="False"><columns><alarm-line-column-part name="State" visible="False" width="123"><content spacing="7"/></alarm-line-column-part></columns></alarm-view></alarm-control></screen></unified-export>`);
 const control=screen.layers[0].items[0], view=control.unifiedEngineering.values.AlarmView;
 assert.equal(view.values.RowHeight,37);assert.equal(view.values.AllowSort,false);
 const column=view.values.Columns[0];assert.equal(column.values.Width,123);assert.equal(column.values.Content.values.Spacing,7);
 screen.sourceData=undefined;screen.sourceProperties={};control.sourceData=undefined;control.sourceProperties={};
 view.values.RowHeight=42;column.values.Width=180;column.values.Content.values.Spacing=11;
 const xml=new HmiScreenToUnifiedXmlConverter().convert(screen,'Panel').xml;
 const restored=(await reader.convert(xml)).screen.layers[0].items[0].unifiedEngineering.values.AlarmView;
 assert.equal(restored.values.RowHeight,42);assert.equal(restored.values.Columns[0].values.Width,180);assert.equal(restored.values.Columns[0].values.Visible,false);assert.equal(restored.values.Columns[0].values.Content.values.Spacing,11);
});


test('omission diagnostics and null references survive editable model export', async () => {
 const schema=await HmiUnifiedXmlCatalog.read(new Uint8Array(await readFile(HmiUnifiedXmlCatalog.url)));
 const reader=new HmiUnifiedXmlToScreenConverter(schema);
 const {screen}=await reader.convert(`<unified-export xmlns="urn:s7mcp:wincc-unified:2" xmlns:u="urn:s7mcp:wincc-unified:2:contract" version="2"><u:Warnings><u:Warning>Unavailable getter was omitted.</u:Warning></u:Warnings><screen name="Main"><faceplate-container name="Empty"><contained-type><u:Value kind="null"/></contained-type></faceplate-container></screen></unified-export>`);
 screen.sourceData=undefined;screen.sourceProperties={};
 const result=new HmiScreenToUnifiedXmlConverter(schema).convert(screen,'Panel');
 assert.ok(result.diagnostics.some(d=>d.message==='Unavailable getter was omitted.'));
 const restored=(await reader.convertScreens(result.xml))[0].screen;
 assert.deepEqual(restored.unifiedExportWarnings,['Unavailable getter was omitted.']);
 assert.equal(restored.layers[0].items[0].unifiedEngineering.values.ContainedType.kind,'null');
});
