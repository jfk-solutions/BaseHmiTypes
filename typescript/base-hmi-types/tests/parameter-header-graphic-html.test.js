import assert from 'node:assert/strict';
import test from 'node:test';
import { HmiDetailedParameterControl,HmiOverviewParameterControl,HmiParameterColumn,HmiMultilingualText,HmiImageSourceKind,HmiImage,HmiScreen,HmiLayer,HmiScreenToHtmlConverter,staticProperty,getStaticValue } from '../dist/index.js';
import { HmiProjectBase } from '../dist/projects/HmiProjectBase.js';
const svg='<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10" fill="red"/></svg>';
const uri='data:image/svg+xml;base64,'+Buffer.from(svg).toString('base64');
class Project extends HmiProjectBase {
  calls=0;
  constructor(available){super();this.available=available;}
  async getImage(id){this.calls++;await Promise.resolve();assert.equal(id,'HeaderImage');return this.available?Object.assign(new HmiImage(),{id,mimeType:'image/svg+xml',data:new TextEncoder().encode(svg)}):undefined;}
}
for(const overview of [false,true])for(const mode of [undefined,0,1,2,3,-1,99])test(`Header modes resolve graphics and retain caption ${overview} ${mode}`,async()=>{
  for(const available of [false,true])for(const referenced of [false,true]){
    const control=overview?new HmiOverviewParameterControl():new HmiDetailedParameterControl();control.columnHeaderType=staticProperty(2);
    const column=Object.assign(new HmiParameterColumn(),{name:'Column',headerText:HmiMultilingualText.fromText('Caption <&>'),headerGraphicKey:'Graphic<&"'});
    if(mode!==undefined)column.headerContentMode=staticProperty(mode);
    if(referenced)column.headerGraphic=({kind:HmiImageSourceKind.Uri,imageId:'HeaderImage'});else if(available)column.headerGraphic=({kind:HmiImageSourceKind.Uri,uri});
    const hidden=Object.assign(new HmiParameterColumn(),{name:'Hidden',visible:staticProperty(false),headerContentMode:staticProperty(3),headerGraphicKey:''});control.columnDefinitions.push(column,hidden);
    const screen=new HmiScreen(),layer=new HmiLayer();screen.layers.push(layer);layer.items.push(control);const project=new Project(available);
    const html=await new HmiScreenToHtmlConverter().convertAsync(screen,project),heading=html.match(/<th scope="col"[\s\S]*?<\/th>/u)[0],graphicMode=[0,1,3].includes(mode);
    assert.equal(heading.includes('data-parameter-header-graphic="true"'),available&&graphicMode);
    assert.equal(heading.includes('Caption &lt;&amp;&gt;'),mode!==3&&(mode!==0||!available));
    if(available&&graphicMode)assert.ok(heading.includes(`src="${uri}"`));
    assert.equal(heading.includes('data-parameter-header-graphic-unloaded='),mode===3&&!available);
    assert.equal(project.calls,referenced&&graphicMode?1:0);
    const metadata=html.match(/<div hidden data-parameter-column-header-definition[^>]*>/gu);assert.equal(metadata.length,2);assert.ok(metadata[1].includes('data-header-graphic-key=""'));assert.ok(metadata[0].includes('data-header-graphic-key="Graphic&lt;&amp;&quot;"'));
    assert.equal(control.columnDefinitions[1],hidden);assert.equal(getStaticValue(column.headerContentMode),mode);
  }
});
for(const headerType of [0,1,2])test(`Header type overrides graphic choice ${headerType}`,async()=>{
  const control=new HmiDetailedParameterControl();control.columnHeaderType=staticProperty(headerType);control.columnDefinitions.push(Object.assign(new HmiParameterColumn(),{headerText:HmiMultilingualText.fromText('Caption'),headerContentMode:staticProperty(3),headerGraphic:({kind:HmiImageSourceKind.Uri,imageId:'HeaderImage'})}));
  const screen=new HmiScreen(),layer=new HmiLayer();screen.layers.push(layer);layer.items.push(control);const project=new Project(true),html=await new HmiScreenToHtmlConverter().convertAsync(screen,project);
  assert.ok(html.includes('data-parameter-column-header-definition'));assert.equal(project.calls,headerType===2?1:0);assert.equal(html.includes('<th scope="col"'),headerType!==0);if(headerType===1)assert.ok(html.includes('>1<'));
});

for(const overview of [false,true])for(const stretch of [undefined,0,1,2,3,4,-1,99])test(`Header graphic layout preserves spacing/stretch ${overview} ${stretch}`,async()=>{
  for(const mode of [0,1,2,3])for(const spacing of [undefined,0,7]){
    const control=overview?new HmiOverviewParameterControl():new HmiDetailedParameterControl();control.columnHeaderType=staticProperty(2);
    const column=Object.assign(new HmiParameterColumn(),{headerText:HmiMultilingualText.fromText('Caption'),headerGraphic:{kind:HmiImageSourceKind.Uri,uri},headerContentMode:staticProperty(mode)});
    if(stretch!==undefined)column.headerGraphicStretchMode=staticProperty(stretch);if(spacing!==undefined)column.headerContentSpacing=staticProperty(spacing);
    control.columnDefinitions.push(column,Object.assign(new HmiParameterColumn(),{visible:staticProperty(false),headerContentSpacing:staticProperty(7),headerGraphicStretchMode:staticProperty(4)}));
    const screen=new HmiScreen(),layer=new HmiLayer();screen.layers.push(layer);layer.items.push(control);
    const html=await new HmiScreenToHtmlConverter().convertAsync(screen),heading=html.match(/<th scope="col"[\s\S]*?<\/th>/u)[0];
    assert.equal(heading.includes('margin-inline-end:'),mode===1&&spacing!==undefined);if(mode===1&&spacing!==undefined)assert.ok(heading.includes(`margin-inline-end: ${spacing}px;`));
    if(mode!==2&&stretch>=0&&stretch<=3)assert.ok(heading.includes(`object-fit: ${['none','fill','contain','cover'][stretch]};`));
    assert.equal(heading.includes('background-repeat: repeat;'),mode!==2&&stretch===4);if(mode!==2&&stretch===4)assert.ok(!heading.includes('<img'));
    assert.equal(heading.includes('Caption'),mode===1||mode===2);
    const definitions=html.match(/<div hidden data-parameter-column-header-definition[^>]*>/gu);assert.equal(definitions.length,2);assert.ok(definitions[1].includes('data-header-content-spacing="7"'));assert.ok(definitions[1].includes('data-header-graphic-stretch-mode="4"'));
    assert.equal(getStaticValue(column.headerGraphicStretchMode),stretch);assert.equal(getStaticValue(column.headerContentSpacing),spacing);
  }
});
