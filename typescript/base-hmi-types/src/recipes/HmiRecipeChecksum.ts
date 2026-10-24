/** MD5 of exact bytes (RFC 1321). This does not define a native file envelope or encoding. */
export function verifyHmiRecipeChecksum(bytes:Uint8Array,expected:string):boolean {
  return typeof expected==='string' && /^[0-9a-f]{32}$/i.test(expected) && hmiRecipeChecksum(bytes)===expected.toLowerCase();
}
export function hmiRecipeChecksum(bytes:Uint8Array):string {
  return [...md5(bytes)].map(b=>b.toString(16).padStart(2,'0')).join('');
}

/**
 * Truncated Base64 MD5 line token. linePrefix includes the final separator;
 * previousChecksumLine contains the previous token plus CRLF in the file's
 * encoding, or is empty for the first data row. Does not validate file framing.
 */
export function hmiRecipeLineChecksum(linePrefix:Uint8Array,previousChecksumLine:Uint8Array,checksumCharacters=6):string {
  if(!(linePrefix instanceof Uint8Array) || !(previousChecksumLine instanceof Uint8Array) ||
    linePrefix.length+previousChecksumLine.length>16*1024*1024)throw new Error('Invalid recipe checksum input');
  if(!Number.isInteger(checksumCharacters) || checksumCharacters<1 || checksumCharacters>24)throw new RangeError('Invalid recipe checksum length');
  const input=new Uint8Array(previousChecksumLine.length+linePrefix.length);
  input.set(previousChecksumLine);input.set(linePrefix,previousChecksumLine.length);
  const digest=md5(input),alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let encoded='';
  for(let i=0;i<digest.length;i+=3) {
    const a=digest[i]!,b=digest[i+1],c=digest[i+2];
    encoded+=alphabet[a>>>2]!+alphabet[((a&3)<<4)|((b??0)>>>4)]!;
    encoded+=b===undefined?'=':alphabet[((b&15)<<2)|((c??0)>>>6)]!;
    encoded+=c===undefined?'=':alphabet[c&63]!;
  }
  return encoded.slice(0,checksumCharacters);
}

function md5(bytes:Uint8Array):Uint8Array {
  if(!(bytes instanceof Uint8Array) || bytes.length>16*1024*1024)throw new Error('Invalid recipe checksum input');
  const size=Math.ceil((bytes.length+9)/64)*64,data=new Uint8Array(size);data.set(bytes);data[bytes.length]=128;
  const view=new DataView(data.buffer);view.setUint32(size-8,(bytes.length*8)>>>0,true);view.setUint32(size-4,Math.floor(bytes.length/0x20000000),true);
  let a0=0x67452301,b0=0xefcdab89,c0=0x98badcfe,d0=0x10325476;
  const shifts=[7,12,17,22,5,9,14,20,4,11,16,23,6,10,15,21];
  for(let offset=0;offset<size;offset+=64) {
    let a=a0,b=b0,c=c0,d=d0;
    for(let i=0;i<64;i++) {
      let f:number,g:number;
      if(i<16){f=(b&c)|(~b&d);g=i;}else if(i<32){f=(d&b)|(~d&c);g=(5*i+1)%16;}else if(i<48){f=b^c^d;g=(3*i+5)%16;}else{f=c^(b|~d);g=(7*i)%16;}
      const sum=(a+f+Math.floor(Math.abs(Math.sin(i+1))*0x100000000)+view.getUint32(offset+g*4,true))|0,shift=shifts[(i>>>4)*4+i%4]!;
      const next=(b+((sum<<shift)|(sum>>>(32-shift))))|0;a=d;d=c;c=b;b=next;
    }
    a0=(a0+a)|0;b0=(b0+b)|0;c0=(c0+c)|0;d0=(d0+d)|0;
  }
  const result=new Uint8Array(16),digest=new DataView(result.buffer);[a0,b0,c0,d0].forEach((n,i)=>digest.setUint32(i*4,n>>>0,true));
  return result;
}
