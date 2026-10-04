import assert from "node:assert/strict";
import test from "node:test";
import {HmiButton,HmiButtonType,HmiHorizontalAlignment,HmiImageSourceKind,HmiLayer,HmiScreen,HmiScreenToHtmlConverter,HmiMultilingualText,staticProperty,tagProperty} from "../dist/index.js";
const create=()=>Object.assign(new HmiButton(),{name:"Offset",width:staticProperty(160),height:staticProperty(100),overlayContent:staticProperty(true),text:staticProperty(HmiMultilingualText.fromText("Start")),image:staticProperty({uri:"picture.svg",kind:HmiImageSourceKind.Uri}),mode:staticProperty(HmiButtonType.GraphicAndText)});
async function convert(b){const s=new HmiScreen(),l=new HmiLayer();l.items.push(b);s.layers.push(l);return (await new HmiScreenToHtmlConverter().convertAsync(s)).match(/<button id="Offset"[^>]*>.*?<\/button>/u)?.[0]??"";}
for(const pressed of [false,true])for(const same of [false,true])for(const axis of [-1,0,1,2,3])for(const mode of [HmiButtonType.GraphicOrText,HmiButtonType.GraphicAndText,HmiButtonType.Text,HmiButtonType.Graphic])for(const tagged of [false,true]){
 test(`HTML pressed content offset (${pressed}, ${same}, ${axis}, ${mode}, ${tagged})`,async()=>{
  const b=create();b.pressed=staticProperty(pressed);b.downStateSameAsUp=staticProperty(same);b.mode=staticProperty(mode);b.pressedContentOffset=tagged?tagProperty("Button.Offset",2):staticProperty(2);
  if(axis>=0)b.imageHorizontalAlignment=staticProperty([HmiHorizontalAlignment.Left,HmiHorizontalAlignment.Center,HmiHorizontalAlignment.Right,HmiHorizontalAlignment.Stretch][axis]);
  const html=await convert(b),active=pressed&&!same;
  assert.equal(html.includes("data-hmi-button-pressed-caption"),active&&mode!==HmiButtonType.Graphic);
  assert.equal(/<img[^>]*transform: translate\(2px, 2px\);/u.test(html),active&&axis>=0&&axis<3&&mode!==HmiButtonType.Text);
  assert.equal(html.includes("data-hmi-button-caption hidden"),mode===HmiButtonType.GraphicOrText);
 });
}
for(const offset of [-1,0,NaN,Infinity,-Infinity,1.5])test(`HTML rejects invalid offset or retains fractional pixels (${offset})`,async()=>{
 const b=create();b.pressed=staticProperty(true);b.pressedContentOffset=staticProperty(offset);const html=await convert(b);assert.equal(html.includes("data-hmi-button-pressed-caption"),offset===1.5);if(offset===1.5)assert.ok(html.includes("translate(1.5px, 1.5px)"));
});
test("HTML omitted pressed offset retains legacy snapshot",async()=>{const b=create();b.pressed=staticProperty(true);assert.equal((await convert(b)).includes("data-hmi-button-pressed-caption"),false);});
