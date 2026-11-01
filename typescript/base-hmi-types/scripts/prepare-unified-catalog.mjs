import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {DOMParser} from '@xmldom/xmldom';
const source=new URL('../../../catalogs/unified/catalog.xml',import.meta.url),manifest=JSON.parse(await readFile(new URL('../../../catalogs/unified/manifest.json',import.meta.url),'utf8'));
const xml=await readFile(source,'utf8');
if(createHash('sha256').update(xml).digest('hex')!==manifest.sha256||!xml.includes(`id="${manifest.id}"`))throw new Error('Shared Unified catalog integrity check failed. Update its reviewed format manifest.');
const document = new DOMParser().parseFromString(xml, 'application/xml'), ns = 'urn:s7mcp:wincc-unified:2:contract';
const children = (node,name) => Array.from(node.childNodes).filter(e=>e.nodeType===1&&e.namespaceURI===ns&&e.localName===name);
const types = Array.from(document.getElementsByTagNameNS(ns,'type')).map(t=>({name:t.getAttribute('name'),tag:t.getAttribute('tag'),
  properties:children(t,'property').map(p=>{const v=children(p,'value')[0];return {name:p.getAttribute('name'),kind:v.getAttribute('kind'),...(v.hasAttribute('type')?{type:v.getAttribute('type')}:{}),
    enumValues:Object.fromEntries(children(v,'enum').map(e=>[e.getAttribute('name'),e.getAttribute('value')]))};}),
  members:children(t,'member').map(m=>({name:m.getAttribute('name'),collection:m.getAttribute('collection')==='true',...(m.hasAttribute('declared-type')?{type:m.getAttribute('declared-type')}:{})}))}));
await writeFile(new URL('../src/converters/unified-xml/HmiUnifiedXmlContract.g.ts',import.meta.url),'// Generated from the shared format definition, never from a screen export.\nimport type {HmiUnifiedEngineeringType} from "../../screens/base/HmiUnifiedEngineeringObject.js";\nexport const unifiedXmlCatalogId = '+JSON.stringify(manifest.id)+';\nexport const unifiedXmlCatalogXml = '+JSON.stringify(xml)+';\nexport const unifiedXmlEngineeringTypes: readonly HmiUnifiedEngineeringType[] = '+JSON.stringify(types)+';\n');
