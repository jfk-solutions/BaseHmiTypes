import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const source=new URL('../../../catalogs/unified/catalog.xml',import.meta.url),manifest=JSON.parse(await readFile(new URL('../../../catalogs/unified/manifest.json',import.meta.url),'utf8'));
const xml=await readFile(source,'utf8');
if(createHash('sha256').update(xml).digest('hex')!==manifest.sha256||!xml.includes(`id="${manifest.id}"`))throw new Error('Shared Unified catalog integrity check failed. Update its reviewed format manifest.');
await writeFile(new URL('../src/converters/unified-xml/HmiUnifiedXmlContract.g.ts',import.meta.url),'// Generated from the shared format definition, never from a screen export.\nexport const unifiedXmlCatalogId = '+JSON.stringify(manifest.id)+';\nexport const unifiedXmlCatalogXml = '+JSON.stringify(xml)+';\n');
