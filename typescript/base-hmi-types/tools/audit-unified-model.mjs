import {readFile,writeFile} from 'node:fs/promises';
import {DOMParser,XMLSerializer} from '@xmldom/xmldom';
import {HmiUnifiedXmlToScreenConverter,HmiUnifiedXmlCatalog,HmiScreenToUnifiedXmlConverter} from '../dist/index.js';
globalThis.DOMParser=DOMParser;globalThis.XMLSerializer=XMLSerializer;
const [input,output]=process.argv.slice(2);
if(!input||!output)throw new Error('Usage: node tools/audit-unified-model.mjs <XML input> <XML output>');
const schema=await HmiUnifiedXmlCatalog.read(new Uint8Array(await readFile(HmiUnifiedXmlCatalog.url)));
const {screen,diagnostics}=await new HmiUnifiedXmlToScreenConverter(schema).convert(await readFile(input,'utf8'));
screen.sourceData=undefined;screen.sourceProperties={};
for(const item of screen.layers.flatMap(l=>l.items)){item.sourceData=undefined;item.sourceProperties={};}
const result=new HmiScreenToUnifiedXmlConverter(schema).convert(screen,'Panel');await writeFile(output,result.xml);
console.log(JSON.stringify({items:screen.layers.flatMap(l=>l.items).length,warnings:screen.unifiedExportWarnings.length,readDiagnostics:diagnostics.length,writeDiagnostics:result.diagnostics.length,failures:result.diagnostics.filter(d=>!screen.unifiedExportWarnings.includes(d.message))}));
