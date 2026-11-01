import test from "node:test";
import assert from "node:assert/strict";
import {DOMParser,XMLSerializer} from "@xmldom/xmldom";
import {HmiScreen,HmiMultilingualText,HmiScreenToUnifiedXmlConverter,HmiUnifiedXmlToScreenConverter} from "../dist/index.js";
globalThis.DOMParser=DOMParser;globalThis.XMLSerializer=XMLSerializer;

const cases=[
  "<body><p/></body>",
  "<body><p>  A <b>bold</b>\n<i>italic</i>&amp; &lt; &gt; \t\r\n</p></body>",
  '<body><p style="margin: 0;"> \t\r\n</p></body>',
  "<body><p>first</p><p>second</p></body>",
  '<body style="color: red;"><p>text</p></body>',
  '<body> <span title="a&#xA;b">text</span>\t</body>',
  "<body/>",
  "<body><p><div>inside</div></p></body>",
  "<body><p><mark><ruby>字<rt>ji</rt></ruby></mark><button>caption</button></p></body>",
  '<body xml:space="preserve"><p> \t\r\n</p></body>',
  '<body><p><span title="a&#x9;b&#xA;c&#xD;d"> x </span></p></body>'
];
test("formatted fragments round trip without redundant wrappers or namespace declarations",async()=>{
  const n=HmiScreenToUnifiedXmlConverter.namespace;
  for(const formatted of cases){
    const text=new HmiMultilingualText();text.texts.set(1031,formatted);text.formattedTexts.set(1031,formatted);text.texts.set(1033,"");
    const screen=Object.assign(new HmiScreen(),{name:"Main",displayName:text}),writer=new HmiScreenToUnifiedXmlConverter();
    const xml=writer.convert(screen,"Panel").xml,root=new DOMParser().parseFromString(xml,"application/xml").documentElement;
    const item=[...root.getElementsByTagNameNS(n,"multilingual-text-item")].find(e=>e.getAttribute("lang")==="de-DE");
    assert.equal(item.getElementsByTagNameNS(n,"body").length,0);
    assert.equal(item.hasAttribute("text"),false);
    for(const node of [item,...item.getElementsByTagName("*")])assert.ok(![...node.attributes].some(a=>a.namespaceURI==="http://www.w3.org/2000/xmlns/"));
    if(formatted===cases[0])assert.equal(item.childNodes.length,0);
    if(formatted===cases[1])assert.equal(item.getElementsByTagNameNS(n,"p").length,0);
    if(formatted===cases[2])assert.equal(item.getElementsByTagNameNS(n,"p")[0].getAttribute("style"),"margin: 0;");
    if(formatted===cases[3])assert.equal([...item.childNodes].filter(node=>node.nodeType===1&&node.localName==="p").length,2);
    const restored=(await new HmiUnifiedXmlToScreenConverter().convert(xml)).screen;
    assert.equal(restored.displayName.formattedTexts.get(1031),formatted,formatted);
    assert.equal(restored.displayName.texts.get(1033),"");assert.equal(restored.displayName.formattedTexts.has(1033),false);
    assert.equal(restored.displayName.texts.size,2);assert.equal(restored.layers[0].items.length,0);
    assert.equal(writer.convert(restored,"Panel").xml,xml);
  }
});
test("conflicting plain text and HTML are rejected",async()=>{
  const source=`<unified-export xmlns="${HmiScreenToUnifiedXmlConverter.namespace}" version="2" scope="screen" screen="Main" complete="true"><screen name="Main"><display-name><multilingual-text-item lang="de-DE" text="plain"><b>formatted</b></multilingual-text-item></display-name></screen></unified-export>`;
  await assert.rejects(new HmiUnifiedXmlToScreenConverter().convert(source),/cannot both be supplied/);
});
