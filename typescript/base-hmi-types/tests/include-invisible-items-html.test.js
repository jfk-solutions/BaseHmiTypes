import assert from 'node:assert/strict';
import test from 'node:test';
import {HmiScreen,HmiLayer,HmiGroup,HmiText,HmiMultilingualText,HmiHorizontalAlignment,HmiVerticalAlignment,HmiHtmlConvertOptions,HmiScreenToHtmlConverter,staticProperty,getStaticValue} from '../dist/index.js';
const withoutScripts=html=>html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'');
function fixture(visible){
 const screen=new HmiScreen(),layer=new HmiLayer(),hiddenLayer=new HmiLayer(),group=new HmiGroup();
 screen.name='Commissioning';screen.width=staticProperty(640);screen.height=staticProperty(480);
 hiddenLayer.visible=staticProperty(visible);group.name='Group';group.visible=staticProperty(visible);
 const text=(name,caption)=>Object.assign(new HmiText(),{name,visible:staticProperty(visible),text:staticProperty(HmiMultilingualText.fromText(caption)),x:staticProperty(12),y:staticProperty(24),width:staticProperty(220),height:staticProperty(36),foregroundColor:staticProperty({alpha:255,red:12,green:34,blue:56}),backgroundColor:staticProperty({alpha:255,red:210,green:220,blue:230})});
 const header=text('Header','Dummy Header'),footer=text('Footer','Dummy Footer'),child=text('Child','Nested text');
 layer.items.push(header,group);hiddenLayer.items.push(footer);group.items.push(child);screen.layers.push(layer,hiddenLayer);
 return {screen,hidden:[header,footer,child,group,hiddenLayer]};
}
test('engineering visibility renders full items and hidden containers without changing model visibility or defaults',async()=>{
 const {screen,hidden}=fixture(false),properties=hidden.map(item=>item.visible),renderer=new HmiScreenToHtmlConverter();
 const original=withoutScripts(await renderer.convertAsync(screen));assert.doesNotMatch(original,/Dummy Header|Dummy Footer|Nested text/);
 const options=new HmiHtmlConvertOptions();assert.equal(options.includeInvisibleItems,false);options.includeInvisibleItems=true;
 const included=withoutScripts(await renderer.convertAsync(screen,undefined,options));
 for(const caption of ['Dummy Header','Dummy Footer','Nested text'])assert.ok(included.includes(caption));
 assert.equal((included.match(/opacity: 0.5;/g)??[]).length,5);
 assert.equal(included.replaceAll('opacity: 0.5;',''),withoutScripts(await renderer.convertAsync(fixture(true).screen)));
 hidden.forEach((item,index)=>{assert.equal(item.visible,properties[index]);assert.equal(getStaticValue(item.visible),false);});
 assert.equal(withoutScripts(await renderer.convertAsync(screen)),original);
});

test('native Unified text defaults center both axes and engineering opacity composes with configured opacity',async()=>{
 const {screen,hidden}=fixture(false),header=hidden[0];
 header.sourceFormat='TIA WinCC Unified';header.opacity=staticProperty(0.4);
 const options=new HmiHtmlConvertOptions();options.includeInvisibleItems=true;
 const renderer=new HmiScreenToHtmlConverter();
 const markup=()=>renderer.convertAsync(screen,undefined,options).then(withoutScripts);
 let html=await markup();
 assert.match(html,/<div id="Header"[^>]*opacity: 0.2;[^>]*text-align: center;justify-content: center;display: flex;align-items: center;/);
 header.horizontalAlignment=staticProperty(HmiHorizontalAlignment.Right);header.verticalAlignment=staticProperty(HmiVerticalAlignment.Bottom);
 html=await markup();assert.match(html,/<div id="Header"[^>]*text-align: right;justify-content: flex-end;display: flex;align-items: flex-end;/);
 assert.equal(getStaticValue(header.opacity),0.4);assert.equal(getStaticValue(header.visible),false);
 header.visible=staticProperty(true);assert.match(await markup(),/<div id="Header"[^>]*opacity: 0.4;/);
});
