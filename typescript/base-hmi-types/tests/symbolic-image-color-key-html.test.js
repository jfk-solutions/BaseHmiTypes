import assert from 'node:assert/strict';import test from 'node:test';
import {HmiSymbolicIOField,HmiState,HmiImageSourceKind,HmiLayer,HmiScreen,HmiScreenToHtmlConverter,hmiColorFromArgb,staticProperty} from '../dist/index.js';
for(const baseKey of [null,false,true])for(const flashKey of [null,false,true])for(const blink of [false,true])for(const color of [false,true])for(const scaled of [false,true])test(`HTML symbolic image keys (${baseKey}, ${flashKey}, ${blink}, ${color}, ${scaled})`,async()=>{
 const image=uri=>({uri,kind:HmiImageSourceKind.Uri}),field=Object.assign(new HmiSymbolicIOField(),{name:'Key',width:staticProperty(160),height:staticProperty(100),value:staticProperty(1)});
 field.states.push(Object.assign(new HmiState(),{value:0,image:image('ignored.svg'),imageBackgroundTransparent:true,imageBackgroundColor:hmiColorFromArgb(255,99,99,99)}));
 const state=Object.assign(new HmiState(),{value:1,image:image('base.svg'),alternateImage:image('flash.svg'),imageBlink:blink,imageScaled:scaled});
 if(baseKey!==null)state.imageBackgroundTransparent=baseKey;if(flashKey!==null)state.alternateImageBackgroundTransparent=flashKey;
 if(color){state.imageBackgroundColor=hmiColorFromArgb(255,1,2,3);state.alternateImageBackgroundColor=hmiColorFromArgb(255,4,5,6);}field.states.push(state);
 const s=new HmiScreen(),l=new HmiLayer();l.items.push(field);s.layers.push(l);const html=await new HmiScreenToHtmlConverter().convertAsync(s),b=html.match(/<img[^>]*class="hmi-symbolic-image-base"[^>]*>/u)?.[0]??'',f=html.match(/<img[^>]*class="hmi-symbolic-image-alternate"[^>]*>/u)?.[0]??'';
 assert.ok(b.includes('src="base.svg"'));assert.equal(b.includes('data-hmi-image-color-key="1,2,3"'),baseKey===true&&color);assert.equal(f.length>0,blink);if(blink){assert.ok(f.includes('src="flash.svg"'));assert.equal(f.includes('data-hmi-image-color-key="4,5,6"'),flashKey===true&&color);}assert.ok(b.includes(scaled?'object-fit: contain':'width: auto'));
});
