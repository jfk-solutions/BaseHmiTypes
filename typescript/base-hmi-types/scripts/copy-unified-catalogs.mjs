import {readFile,writeFile,mkdir,readdir,unlink} from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
for(const name of ['unified-v19','unified-v21']) {
  const old=new URL('../dist/catalogs/'+name+'/',import.meta.url);
  for(const file of await readdir(old).catch(error=>{if(error.code==='ENOENT')return [];throw error;}))
    if(/^[a-f0-9]{64}\.xml\.gz$/.test(file)) await unlink(new URL(file,old));
}
const destination=new URL('../dist/catalogs/unified/',import.meta.url);await mkdir(destination,{recursive:true});
await writeFile(new URL('catalog.xml.gz',destination),gzipSync(await readFile(new URL('../../../catalogs/unified/catalog.xml',import.meta.url))));
