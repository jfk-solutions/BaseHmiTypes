import assert from 'node:assert/strict';import test from 'node:test';
import {HmiScreen,HmiLayer,HmiGraphicView,HmiThickness,HmiHorizontalAlignment as Horizontal,HmiVerticalAlignment as Vertical,HmiScreenToHtmlConverter,staticProperty as p} from '../dist/index.js';
const svg="<svg xmlns='http://www.w3.org/2000/svg' width='40' height='20' viewBox='0 0 40 20' title='x > y'><rect width='40' height='20' fill='red'/></svg>";
async function render(values){const screen=new HmiScreen(),layer=new HmiLayer();screen.layers.push(layer);layer.items.push(Object.assign(new HmiGraphicView(),{name:'Graphic'},values));return new HmiScreenToHtmlConverter().convertAsync(screen);}
const uri=text=>'data:image/svg+xml;base64,'+Buffer.from(text).toString('base64');
function decoded(html){const value=html.match(/src="data:image\/svg\+xml;base64,([^"]+)"/)?.[1];assert.ok(value);return Buffer.from(value,'base64').toString('utf8');}
for(const keep of [false,true])for(const encoding of [0,1,2,3])test(`SVG policy supports BOM/encoding without changing source: ${keep}/${encoding}`,async()=>{
 const declaration=`<?xml version='1.0' encoding='${encoding<2?'UTF-8':encoding===2?'UTF-16':'UTF-16BE'}'?>`,text=declaration+'\n<!--root--><?test data?>'+svg;
 let bytes;if(encoding<2)bytes=Buffer.concat([encoding===1?Buffer.from([239,187,191]):Buffer.alloc(0),Buffer.from(text)]);
 else {bytes=Buffer.concat([Buffer.from([255,254]),Buffer.from(text,'utf16le')]);if(encoding===3)bytes=Buffer.from(bytes).swap16();}
 const original='data:image/svg+xml;base64,'+bytes.toString('base64'),source={uri:original};
 const html=await render({name:'Svg',image:p(source),imageKeepAspectRatio:p(keep),width:p(100),height:p(100)}),actual=decoded(html);
 assert.ok(html.includes(`object-fit: ${keep?'contain':'fill'}; object-position: 50% 50%;`));assert.ok(actual.includes(`preserveAspectRatio="${keep?'xMidYMid meet':'none'}"`));assert.ok(actual.includes("title='x > y'"));assert.ok(actual.includes('<!--root--><?test data?>'));assert.ok(!actual.includes('<?xml'));assert.equal(source.uri,original);
});
for(const quote of ["'",'"'])test(`Root policy replaced without nested/lookalike attribute changes: ${quote}`,async()=>{
 const text=`<svg xmlns='http://www.w3.org/2000/svg' data-note='preserveAspectRatio=fake' preserveAspectRatio=${quote}xMaxYMin slice${quote}><svg preserveAspectRatio='xMinYMin meet'/></svg>`,actual=decoded(await render({source:p(uri(text)),imageKeepAspectRatio:p(false)}));
 assert.ok(actual.includes(`preserveAspectRatio=${quote}none${quote}`));assert.ok(actual.includes("data-note='preserveAspectRatio=fake'"));assert.ok(actual.includes("<svg preserveAspectRatio='xMinYMin meet'/>"));
});
for(const keep of [false,true])test(`Percent-encoded SVG uses same policy: ${keep}`,async()=>assert.ok(decoded(await render({source:p('data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg)),imageKeepAspectRatio:p(keep)})).includes(keep?'xMidYMid meet':'none')));
for(const source of ['data:image/svg+xml;base64,!!!','data:image/svg+xml;base64','<html><svg/></html>',"<!DOCTYPE html><svg/>","<!DOCTYPE svg [<!ENTITY x 'text'>]><svg/>","<!DOCTYPEsvg><svg/>","<!DOCTYPE svg SYSTEM 'unfinished><svg/>","<!DOCTYPE svg PUBLIC 'missing-system'><svg/>","<!DOCTYPE svg><!DOCTYPE svg><svg/>","<!DOCTYPE svg SYSTEM unquoted><svg/>","<!DOCTYPE svg SYSTEM 'x'<svg/>","<svg preserveAspectRatio='none' preserveAspectRatio='none'/>"])test(`Unsupported embedded SVG stays placeholder: ${source}`,async()=>assert.ok((await render({source:p(source.startsWith('data:')?source:uri(source)),imageKeepAspectRatio:p(false)})).includes('Graphic image')));
for(const header of ['<!DOCTYPE svg>',"<!--before--><!DOCTYPE svg SYSTEM 'https://example.invalid/a>b'><!----><?after ok?>",'<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" \'https://example.invalid/svg.dtd\'>'])for(const keep of [false,true])for(const encoding of [0,1,2,3])test(`SVG DOCTYPE preserved without resolving DTD: ${header}/${keep}/${encoding}`,async()=>{
 const text=header+svg;let bytes;
 if(encoding<2)bytes=Buffer.concat([encoding===1?Buffer.from([239,187,191]):Buffer.alloc(0),Buffer.from(text)]);
 else {bytes=Buffer.concat([Buffer.from([255,254]),Buffer.from(text,'utf16le')]);if(encoding===3)bytes=Buffer.from(bytes).swap16();}
 const original='data:image/svg+xml;base64,'+bytes.toString('base64'),source={uri:original};
 const actual=decoded(await render({image:p(source),imageKeepAspectRatio:p(keep)}));
 assert.ok(actual.startsWith(header));assert.ok(actual.includes(`preserveAspectRatio="${keep?'xMidYMid meet':'none'}"`));assert.equal(source.uri,original);
});
for(const [horizontal,h] of [Horizontal.Left,Horizontal.Center,Horizontal.Right,Horizontal.Stretch].map((x,i)=>[x,i]))for(const [vertical,v] of [Vertical.Top,Vertical.Center,Vertical.Bottom,Vertical.Stretch].map((x,i)=>[x,i]))test(`Existing image alignment controls object position: ${h}/${v}`,async()=>{
 const html=await render({source:p('picture.png'),imageScaled:p(true),imageKeepAspectRatio:p(true),imageHorizontalAlignment:p(horizontal),imageVerticalAlignment:p(vertical)});assert.ok(html.includes(`object-fit: contain; object-position: ${h===0?0:h===2?100:50}% ${v===0?0:v===2?100:50}%;`));
});
for(const keep of [false,true])test(`Unscaled uses intrinsic size regardless of aspect policy: ${keep}`,async()=>assert.ok((await render({source:p('picture.png'),imageScaled:p(false),imageKeepAspectRatio:p(keep)})).includes('object-fit: none; object-position: 50% 50%;')));
test('Missing layout properties preserve legacy markup',async()=>{const html=(await render({source:p('picture.png')})).match(/<img id="Graphic"[^>]*>/)?.[0]??'';assert.ok(!html.includes('object-fit:'));assert.ok(html.includes('src="picture.png"'));});
test('Generated overflow viewport takes precedence over image layout',async()=>{
 const html=(await render({source:p('picture.png'),width:p(40),height:p(20),imageKeepAspectRatio:p(true),imageOverflowPadding:Object.assign(new HmiThickness(),{left:p(2),top:p(3),right:p(4),bottom:p(5)})})).match(/<div id="Graphic"[^>]*><img[^>]*><\/div>/)?.[0]??'';assert.ok(html.includes('width: 46px; height: 28px;'));assert.ok(!html.includes('object-fit:'));
});
