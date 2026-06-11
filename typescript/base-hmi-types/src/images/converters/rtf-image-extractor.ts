export interface ExtractedRtfImage {
  bytes: Uint8Array;
  extension: string;
}

const PictureTypes: Record<string, string> = {
  pngblip: '.png',
  jpegblip: '.jpg',
  emfblip: '.emf',
  wmetafile: '.wmf',
  macpict: '.pct',
  dibitmap: '.bmp',
  wbitmap: '.bmp',
};

export function extractFirstRtfImage(bytes: Uint8Array): ExtractedRtfImage | null {
  if (!isRtf(bytes))
    return null;

  const text = asciiText(bytes);
  let pictIndex = text.indexOf('\\pict');
  while (pictIndex >= 0) {
    const groupStart = findGroupStart(text, pictIndex);
    const groupEnd = groupStart >= 0 ? findGroupEnd(text, groupStart) : -1;
    if (groupStart >= 0 && groupEnd > pictIndex) {
      const image = extractPictureGroup(text, pictIndex + '\\pict'.length, groupEnd);
      if (image)
        return image;
    }
    pictIndex = text.indexOf('\\pict', pictIndex + 5);
  }
  return null;
}

function isRtf(bytes: Uint8Array): boolean {
  return bytes.length >= 6
    && bytes[0] === 0x7b
    && bytes[1] === 0x5c
    && bytes[2] === 0x72
    && bytes[3] === 0x74
    && bytes[4] === 0x66;
}

function asciiText(bytes: Uint8Array): string {
  let text = '';
  for (let index = 0; index < bytes.length; index++)
    text += String.fromCharCode(bytes[index]);
  return text;
}

function findGroupStart(text: string, offset: number): number {
  for (let index = offset; index >= 0; index--) {
    if (text[index] === '{' && !isEscapedRtfChar(text, index))
      return index;
  }
  return -1;
}

function findGroupEnd(text: string, groupStart: number): number {
  let depth = 0;
  for (let index = groupStart; index < text.length; index++) {
    const char = text[index];
    if (isEscapedRtfChar(text, index))
      continue;
    if (char === '{')
      depth += 1;
    else if (char === '}') {
      depth -= 1;
      if (depth === 0)
        return index;
    }
  }
  return -1;
}

function isEscapedRtfChar(text: string, offset: number): boolean {
  let slashCount = 0;
  for (let index = offset - 1; index >= 0 && text[index] === '\\'; index--)
    slashCount += 1;
  return slashCount % 2 === 1;
}

function extractPictureGroup(text: string, offset: number, groupEnd: number): ExtractedRtfImage | null {
  let index = offset;
  let extension: string | null = null;

  while (index < groupEnd) {
    index = skipWhitespace(text, index, groupEnd);
    if (text[index] !== '\\')
      break;

    const token = readControlWord(text, index, groupEnd);
    if (!token)
      break;

    extension = PictureTypes[token.word] ?? extension;
    index = token.end;
  }

  if (!extension)
    return null;

  const imageBytes = hexBytes(text, index, groupEnd);
  return imageBytes.length > 0 ? { bytes: imageBytes, extension } : null;
}

function skipWhitespace(text: string, offset: number, end: number): number {
  let index = offset;
  while (index < end && /\s/.test(text[index]))
    index += 1;
  return index;
}

function readControlWord(text: string, offset: number, end: number): { word: string; end: number } | null {
  let index = offset + 1;
  const wordStart = index;
  while (index < end && /[a-zA-Z]/.test(text[index]))
    index += 1;
  if (index === wordStart)
    return null;

  const word = text.slice(wordStart, index).toLowerCase();
  if (index < end && text[index] === '-')
    index += 1;
  while (index < end && /[0-9]/.test(text[index]))
    index += 1;
  if (index < end && /\s/.test(text[index]))
    index += 1;
  return { word, end: index };
}

function hexBytes(text: string, offset: number, end: number): Uint8Array {
  const values: number[] = [];
  let highNibble: number | null = null;
  for (let index = offset; index < end; index++) {
    const value = hexValue(text.charCodeAt(index));
    if (value < 0)
      continue;
    if (highNibble == null)
      highNibble = value;
    else {
      values.push((highNibble << 4) | value);
      highNibble = null;
    }
  }
  return new Uint8Array(values);
}

function hexValue(charCode: number): number {
  if (charCode >= 48 && charCode <= 57)
    return charCode - 48;
  if (charCode >= 65 && charCode <= 70)
    return charCode - 55;
  if (charCode >= 97 && charCode <= 102)
    return charCode - 87;
  return -1;
}
