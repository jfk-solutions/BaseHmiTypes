// infos at https://github.com/libyal/dtformats/blob/main/documentation/Windows%20(Enhanced)%20Metafile%20Format%20(WMF%20and%20EMF).asciidoc

type MetafileObject = PenObject | BrushObject | FontObject;

interface PenObject {
  kind: 'pen';
  color: string;
  width: number;
  none: boolean;
}

interface BrushObject {
  kind: 'brush';
  color: string;
  none: boolean;
}

interface FontObject {
  kind: 'font';
  family: string;
  height: number;
  weight: number;
  italic: boolean;
}

interface DrawState {
  pen: PenObject;
  brush: BrushObject;
  font: FontObject;
  textColor: string;
  currentX: number;
  currentY: number;
  windowOrgX: number;
  windowOrgY: number;
  windowExtX: number;
  windowExtY: number;
  viewportOrgX: number;
  viewportOrgY: number;
  viewportExtX: number;
  viewportExtY: number;
  worldTransform: Transform;
  fillRule: 'evenodd' | 'nonzero';
  activeClipId?: string;
  currentPath?: string[];
  pathStartX?: number;
  pathStartY?: number;
}

interface ViewBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface BoundsBuilder {
  hasValue: boolean;
  left: number;
  top: number;
  right: number;
  bottom: number;
}

interface EmfRecord {
  type: number;
  offset: number;
  size: number;
}

interface EmfPlusState {
  transform: Transform;
  images: Map<number, string>;
  paths: Map<number, string>;
}

interface WmfRecord {
  type: number;
  offset: number;
  sizeBytes: number;
}

interface Transform {
  m11: number;
  m12: number;
  m21: number;
  m22: number;
  dx: number;
  dy: number;
}

export class MetafileToSvgRenderer {
  render(bytes: Uint8Array, extension?: string | null): string | null {
    const normalized = extension?.toLowerCase();
    if (normalized === '.emf' || this.isEmf(bytes))
      return this.renderEmf(bytes);
    if (normalized === '.wmf' || this.isWmf(bytes))
      return this.renderWmf(bytes);
    return null;
  }

  private isEmf(bytes: Uint8Array): boolean {
    return bytes.length >= 44 && u32(bytes, 0) === EMR.HEADER && u32(bytes, 40) === 0x464d4520;
  }

  private isWmf(bytes: Uint8Array): boolean {
    if (bytes.length < 18)
      return false;
    return u32(bytes, 0) === PlaceableWmfKey || u16(bytes, 0) === 1 || u16(bytes, 0) === 2;
  }

  private renderEmf(bytes: Uint8Array): string | null {
    if (!this.isEmf(bytes))
      return null;

    const viewBox = emfHeaderViewBox(bytes) ?? normalizeViewBox({
      x: i32(bytes, 8),
      y: i32(bytes, 12),
      width: i32(bytes, 16) - i32(bytes, 8) + 1,
      height: i32(bytes, 20) - i32(bytes, 12) + 1,
    });
    const state = createInitialState();
    const stateStack: DrawState[] = [];
    const objects = new Map<number, MetafileObject>();
    const emfPlusState: EmfPlusState = {
      transform: identityTransform(),
      images: new Map(),
      paths: new Map(),
    };
    const elements: string[] = [];
    const defs: string[] = [];
    let clipSequence = 0;
    let hasEmfPlusDrawing = false;

    for (const record of emfRecords(bytes)) {
      const dataOffset = record.offset + 8;
      const dataEnd = record.offset + record.size;
      if (dataEnd > bytes.length)
        break;

      switch (record.type) {
        case EMR.GDICOMMENT:
          hasEmfPlusDrawing = processEmfPlusComment(this, bytes, dataOffset, state, emfPlusState, elements) || hasEmfPlusDrawing;
          break;
        case EMR.SETWINDOWORGEX:
          state.windowOrgX = i32(bytes, dataOffset);
          state.windowOrgY = i32(bytes, dataOffset + 4);
          break;
        case EMR.SETWINDOWEXTEX:
          state.windowExtX = i32(bytes, dataOffset) || 1;
          state.windowExtY = i32(bytes, dataOffset + 4) || 1;
          break;
        case EMR.SETVIEWPORTORGEX:
          state.viewportOrgX = i32(bytes, dataOffset);
          state.viewportOrgY = i32(bytes, dataOffset + 4);
          break;
        case EMR.SETVIEWPORTEXTEX:
          state.viewportExtX = i32(bytes, dataOffset) || 1;
          state.viewportExtY = i32(bytes, dataOffset + 4) || 1;
          break;
        case EMR.SETPOLYFILLMODE:
          state.fillRule = polyFillRule(u32(bytes, dataOffset));
          break;
        case EMR.SETTEXTCOLOR:
          state.textColor = colorRef(bytes, dataOffset);
          break;
        case EMR.SAVEDC:
          stateStack.push(cloneState(state));
          break;
        case EMR.RESTOREDC:
          restoreState(state, stateStack.pop());
          break;
        case EMR.SETWORLDTRANSFORM:
          state.worldTransform = readTransform(bytes, dataOffset);
          break;
        case EMR.MODIFYWORLDTRANSFORM:
          state.worldTransform = modifyWorldTransform(state.worldTransform, readTransform(bytes, dataOffset), u32(bytes, dataOffset + 24));
          break;
        case EMR.CREATEPEN:
          objects.set(u32(bytes, dataOffset), {
            kind: 'pen',
            width: Math.max(1, i32(bytes, dataOffset + 12)),
            color: colorRef(bytes, dataOffset + 20),
            none: u32(bytes, dataOffset + 4) === 5,
          });
          break;
        case EMR.CREATEBRUSHINDIRECT:
          objects.set(u32(bytes, dataOffset), {
            kind: 'brush',
            color: colorRef(bytes, dataOffset + 8),
            none: u32(bytes, dataOffset + 4) === 1,
          });
          break;
        case EMR.EXTCREATEFONTINDIRECTW:
          objects.set(u32(bytes, dataOffset), readEmfFont(bytes, dataOffset + 4, record.size - 12));
          break;
        case EMR.EXTCREATEPEN:
          objects.set(u32(bytes, dataOffset), {
            kind: 'pen',
            width: scaledPenWidth(state, i32(bytes, dataOffset + 24)),
            color: colorRef(bytes, dataOffset + 32),
            none: (u32(bytes, dataOffset + 20) & 0x0000000f) === 5,
          });
          break;
        case EMR.SELECTOBJECT:
          selectObject(state, emfStockObject(u32(bytes, dataOffset)) ?? objects.get(u32(bytes, dataOffset)));
          break;
        case EMR.DELETEOBJECT:
          objects.delete(u32(bytes, dataOffset));
          break;
        case EMR.MOVETOEX:
          [state.currentX, state.currentY] = transformPoint(state, i32(bytes, dataOffset), i32(bytes, dataOffset + 4));
          if (state.currentPath) {
            state.currentPath.push(`M ${state.currentX} ${state.currentY}`);
            state.pathStartX = state.currentX;
            state.pathStartY = state.currentY;
          }
          break;
        case EMR.LINETO: {
          const [x, y] = transformPoint(state, i32(bytes, dataOffset), i32(bytes, dataOffset + 4));
          if (state.currentPath)
            state.currentPath.push(`L ${x} ${y}`);
          else
            elements.push(lineElement(state.currentX, state.currentY, x, y, state));
          state.currentX = x;
          state.currentY = y;
          break;
        }
        case EMR.BEGINPATH:
          state.currentPath = [];
          state.pathStartX = undefined;
          state.pathStartY = undefined;
          break;
        case EMR.CLOSEFIGURE:
          state.currentPath?.push('Z');
          if (state.pathStartX != null && state.pathStartY != null) {
            state.currentX = state.pathStartX;
            state.currentY = state.pathStartY;
          }
          break;
        case EMR.ENDPATH:
          break;
        case EMR.SELECTCLIPPATH:
          if (state.currentPath?.length) {
            const id = `clip${++clipSequence}`;
            defs.push(`<clipPath id="${id}"><path d="${state.currentPath.join(' ')}" /></clipPath>`);
            state.activeClipId = id;
          }
          state.currentPath = undefined;
          break;
        case EMR.POLYLINETO:
          appendLinePointsToPath(state, readEmfPoints32(bytes, dataOffset));
          break;
        case EMR.POLYLINETO16:
          appendLinePointsToPath(state, readEmfPoints16(bytes, dataOffset));
          break;
        case EMR.POLYBEZIER16:
          appendEmfPolyBezierPath(state, readEmfPoints16(bytes, dataOffset));
          break;
        case EMR.POLYBEZIERTO16:
          appendEmfPolyBezierToPath(state, readEmfPoints16(bytes, dataOffset));
          break;
        case EMR.POLYDRAW16:
          appendEmfPolyDraw16ToPath(state, bytes, dataOffset);
          break;
        case EMR.RECTANGLE:
          elements.push(rectElement(...transformRect(state, i32(bytes, dataOffset), i32(bytes, dataOffset + 4), i32(bytes, dataOffset + 8), i32(bytes, dataOffset + 12)), state));
          break;
        case EMR.ELLIPSE:
          elements.push(ellipseElement(...transformRect(state, i32(bytes, dataOffset), i32(bytes, dataOffset + 4), i32(bytes, dataOffset + 8), i32(bytes, dataOffset + 12)), state));
          break;
        case EMR.POLYGON16: {
          const points = readEmfPoints16(bytes, dataOffset).map(([x, y]) => hasEmfPlusDrawing ? transformGdiPointWithEmfPlusTransform(state, emfPlusState.transform, x, y) : transformPoint(state, x, y));
          if (!hasEmfPlusDrawing || !isTallFallbackDuplicate(points)) {
            const element = polyElement(points, true, state);
            if (hasEmfPlusDrawing)
              elements.unshift(element);
            else
              elements.push(element);
          }
          break;
        }
        case EMR.POLYLINE16: {
          const element = polyElement(readEmfPoints16(bytes, dataOffset).map(([x, y]) => hasEmfPlusDrawing ? transformGdiPointWithEmfPlusTransform(state, emfPlusState.transform, x, y) : transformPoint(state, x, y)), false, state);
          if (hasEmfPlusDrawing)
            elements.unshift(element);
          else
            elements.push(element);
          break;
        }
        case EMR.POLYPOLYGON16:
          elements.push(...readEmfPolyPoly16(bytes, dataOffset).map(points => polyElement(points.map(([x, y]) => hasEmfPlusDrawing ? transformGdiPointWithEmfPlusTransform(state, emfPlusState.transform, x, y) : transformPoint(state, x, y)), true, state)));
          break;
        case EMR.POLYPOLYLINE16:
          elements.push(...readEmfPolyPoly16(bytes, dataOffset).map(points => polyElement(points.map(([x, y]) => hasEmfPlusDrawing ? transformGdiPointWithEmfPlusTransform(state, emfPlusState.transform, x, y) : transformPoint(state, x, y)), false, state)));
          break;
        case EMR.FILLPATH:
          if (state.currentPath?.length)
            elements.push(pathElement(state.currentPath, state, 'fill'));
          state.currentPath = undefined;
          break;
        case EMR.STROKEPATH:
          if (state.currentPath?.length)
            elements.push(pathElement(state.currentPath, state, 'stroke'));
          state.currentPath = undefined;
          break;
        case EMR.STROKEANDFILLPATH:
          if (state.currentPath?.length)
            elements.push(pathElement(state.currentPath, state, 'paint'));
          state.currentPath = undefined;
          break;
        case EMR.EXTTEXTOUTW: {
          const text = emfTextElement(bytes, record, state);
          if (text)
            elements.push(text);
          break;
        }
        case EMR.STRETCHDIBITS: {
          if (hasEmfPlusDrawing)
            break;
          const image = emfStretchDibitsElement(bytes, dataOffset, viewBox, state);
          if (image)
            elements.push(image);
          break;
        }
      }
    }

    return svgDocument(viewBox, elements, defs);
  }

  private renderWmf(bytes: Uint8Array): string | null {
    if (!this.isWmf(bytes))
      return null;

    const embeddedEmf = extractWmfcEmf(bytes);
    if (embeddedEmf) {
      const svg = this.renderEmf(embeddedEmf);
      if (svg)
        return svg;
    }

    const placeable = u32(bytes, 0) === PlaceableWmfKey;
    const headerOffset = wmfHeaderOffset(bytes);
    const start = headerOffset + 18;
    const unitsPerInch = placeable ? Math.max(1, u16(bytes, 14)) : 1440;
    const rawViewBox = placeable
      ? {
          x: i16(bytes, 6),
          y: i16(bytes, 8),
          width: i16(bytes, 10) - i16(bytes, 6),
          height: i16(bytes, 12) - i16(bytes, 8),
        }
      : { x: 0, y: 0, width: 1000, height: 1000 };
    const mirrorVertically = placeable && shouldMirrorPlaceableWmfVertically(bytes, start, rawViewBox);
    let viewBox = normalizeViewBox(rawViewBox);
    const state = createInitialState();
    const objects: Array<MetafileObject | null> = [];
    const elements: string[] = [];
    let windowOrg = { x: viewBox.x, y: viewBox.y };
    let windowExt = { x: viewBox.width, y: viewBox.height };
    let hasExplicitWindow = false;
    const bounds = createBoundsBuilder();

    for (const record of wmfRecords(bytes, start)) {
      const p = record.offset + 6;
      switch (record.type) {
        case META.SETWINDOWORG:
          windowOrg = { y: i16(bytes, p), x: i16(bytes, p + 2) };
          viewBox = normalizeViewBox({ x: windowOrg.x, y: windowOrg.y, width: windowExt.x, height: windowExt.y });
          hasExplicitWindow = true;
          break;
        case META.SETWINDOWEXT:
          windowExt = { y: i16(bytes, p), x: i16(bytes, p + 2) };
          viewBox = normalizeViewBox({ x: windowOrg.x, y: windowOrg.y, width: windowExt.x, height: windowExt.y });
          hasExplicitWindow = true;
          break;
        case META.SETPOLYFILLMODE:
          state.fillRule = polyFillRule(u16(bytes, p));
          break;
        case META.CREATEPENINDIRECT:
          objects.push({
            kind: 'pen',
            width: Math.max(1, Math.abs(i16(bytes, p + 2))),
            color: colorRef(bytes, p + 6),
            none: u16(bytes, p) === 5,
          });
          break;
        case META.CREATEBRUSHINDIRECT:
          objects.push({
            kind: 'brush',
            color: colorRef(bytes, p + 2),
            none: u16(bytes, p) === 1,
          });
          break;
        case META.SELECTOBJECT:
          selectObject(state, objects[u16(bytes, p)] ?? undefined);
          break;
        case META.DELETEOBJECT:
          objects[u16(bytes, p)] = null;
          break;
        case META.MOVETO:
          state.currentY = i16(bytes, p);
          state.currentX = i16(bytes, p + 2);
          break;
        case META.LINETO: {
          const y = i16(bytes, p);
          const x = i16(bytes, p + 2);
          addBoundsPoint(bounds, state.currentX, state.currentY);
          addBoundsPoint(bounds, x, y);
          elements.push(lineElement(state.currentX, state.currentY, x, y, state));
          state.currentX = x;
          state.currentY = y;
          break;
        }
        case META.RECTANGLE: {
          const left = i16(bytes, p + 6);
          const top = i16(bytes, p + 4);
          const right = i16(bytes, p + 2);
          const bottom = i16(bytes, p);
          addBoundsPoint(bounds, left, top);
          addBoundsPoint(bounds, right, bottom);
          elements.push(rectElement(left, top, right, bottom, state));
          break;
        }
        case META.ELLIPSE: {
          const left = i16(bytes, p + 6);
          const top = i16(bytes, p + 4);
          const right = i16(bytes, p + 2);
          const bottom = i16(bytes, p);
          addBoundsPoint(bounds, left, top);
          addBoundsPoint(bounds, right, bottom);
          elements.push(ellipseElement(left, top, right, bottom, state));
          break;
        }
        case META.POLYGON: {
          const points = readWmfPoints(bytes, p);
          addBoundsPoints(bounds, points);
          elements.push(polyElement(points, true, state));
          break;
        }
        case META.POLYPOLYGON:
          for (const points of readWmfPolyPolygon(bytes, p)) {
            addBoundsPoints(bounds, points);
            elements.push(polyElement(points, true, state));
          }
          break;
        case META.POLYLINE: {
          const points = readWmfPoints(bytes, p);
          addBoundsPoints(bounds, points);
          elements.push(polyElement(points, false, state));
          break;
        }
        case META.STRETCHDIB: {
          const image = wmfStretchDibElement(bytes, record, state);
          if (image)
            elements.push(image);
          break;
        }
      }
    }

    if (!placeable && !hasExplicitWindow && bounds.hasValue)
      viewBox = boundsToViewBox(bounds);
    return svgDocument(viewBox, mirrorVertically ? mirrorElementsVertically(elements, viewBox) : elements);
  }
}

const PlaceableWmfKey = 0x9ac6cdd7;

const EMR = {
  HEADER: 0x0001,
  EOF: 0x000e,
  GDICOMMENT: 0x0046,
  SETWINDOWEXTEX: 0x0009,
  SETWINDOWORGEX: 0x000a,
  SETVIEWPORTEXTEX: 0x000b,
  SETVIEWPORTORGEX: 0x000c,
  SETPOLYFILLMODE: 0x0013,
  SETTEXTCOLOR: 0x0018,
  SAVEDC: 0x0021,
  RESTOREDC: 0x0022,
  SETWORLDTRANSFORM: 0x0023,
  MODIFYWORLDTRANSFORM: 0x0024,
  BEGINPATH: 0x003b,
  ENDPATH: 0x003c,
  CLOSEFIGURE: 0x003d,
  FILLPATH: 0x003e,
  STROKEANDFILLPATH: 0x003f,
  STROKEPATH: 0x0040,
  SELECTCLIPPATH: 0x0043,
  MOVETOEX: 0x001b,
  LINETO: 0x0036,
  POLYLINETO: 0x0006,
  POLYBEZIER16: 0x0055,
  POLYBEZIERTO16: 0x0058,
  POLYLINETO16: 0x0059,
  POLYDRAW16: 0x005c,
  SELECTOBJECT: 0x0025,
  CREATEPEN: 0x0026,
  CREATEBRUSHINDIRECT: 0x0027,
  DELETEOBJECT: 0x0028,
  RECTANGLE: 0x002b,
  ELLIPSE: 0x002a,
  POLYGON16: 0x0056,
  POLYLINE16: 0x0057,
  POLYPOLYLINE16: 0x005a,
  POLYPOLYGON16: 0x005b,
  STRETCHDIBITS: 0x0051,
  EXTCREATEFONTINDIRECTW: 0x0052,
  EXTTEXTOUTW: 0x0054,
  EXTCREATEPEN: 0x005f,
};

const EmfPlus = {
  Signature: 0x2b464d45,
  Object: 0x4008,
  FillRects: 0x400a,
  FillPath: 0x4014,
  DrawPath: 0x4015,
  DrawImage: 0x401a,
  DrawImagePoints: 0x401b,
  ResetWorldTransform: 0x402b,
  SetWorldTransform: 0x402a,
};

const EmfPlusObjectTypePath = 3;
const EmfPlusObjectTypeImage = 5;
const EmfPlusImageDataTypeBitmap = 1;
const EmfPlusImageDataTypeMetafile = 2;
const EmfPlusMetafileDataTypeWmf = 1;
const EmfPlusMetafileDataTypeWmfPlaceable = 2;
const EmfPlusCompressedFlag = 0x4000;
const EmfPlusPathPointTypeStart = 0;
const EmfPlusPathPointTypeLine = 1;
const EmfPlusPathPointTypeBezier = 3;
const EmfPlusPathPointTypeCloseSubpath = 0x80;
const EmfPlusSolidColorBrushFlag = 0x8000;
const PngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

const META = {
  ESCAPE: 0x0626,
  SETWINDOWORG: 0x020b,
  SETWINDOWEXT: 0x020c,
  SETPOLYFILLMODE: 0x0106,
  DELETEOBJECT: 0x01f0,
  CREATEBRUSHINDIRECT: 0x02fc,
  CREATEPENINDIRECT: 0x02fa,
  SELECTOBJECT: 0x012d,
  MOVETO: 0x0214,
  LINETO: 0x0213,
  POLYGON: 0x0324,
  POLYLINE: 0x0325,
  POLYPOLYGON: 0x0538,
  RECTANGLE: 0x041b,
  ELLIPSE: 0x0418,
  STRETCHDIB: 0x0f43,
};

const WmfEscapeFunctionPrivate = 0x000f;

function* emfRecords(bytes: Uint8Array): Generator<EmfRecord> {
  let offset = 0;
  while (offset + 8 <= bytes.length) {
    const type = u32(bytes, offset);
    const size = u32(bytes, offset + 4);
    if (size < 8 || offset + size > bytes.length)
      return;
    yield { type, offset, size };
    if (type === EMR.EOF)
      return;
    offset += size;
  }
}

function* wmfRecords(bytes: Uint8Array, start: number): Generator<WmfRecord> {
  let offset = start;
  while (offset + 6 <= bytes.length) {
    const sizeWords = u32(bytes, offset);
    const type = u16(bytes, offset + 4);
    const sizeBytes = sizeWords * 2;
    if (sizeWords < 3 || offset + sizeBytes > bytes.length)
      return;
    yield { type, offset, sizeBytes };
    if (type === 0)
      return;
    offset += sizeBytes;
  }
}

function extractWmfcEmf(bytes: Uint8Array): Uint8Array | null {
  const start = wmfHeaderOffset(bytes) + 18;
  const chunks: Uint8Array[] = [];
  let totalLength = 0;

  for (const record of wmfRecords(bytes, start)) {
    if (record.type !== META.ESCAPE || record.sizeBytes < 44)
      continue;

    const offset = record.offset + 6;
    if (u16(bytes, offset) !== WmfEscapeFunctionPrivate || ascii4(bytes, offset + 4) !== 'WMFC')
      continue;

    const payloadStart = record.offset + 44;
    const payloadEnd = record.offset + record.sizeBytes;
    if (payloadStart >= payloadEnd || payloadEnd > bytes.length)
      continue;

    const chunk = bytes.slice(payloadStart, payloadEnd);
    chunks.push(chunk);
    totalLength += chunk.byteLength;
  }

  if (totalLength < 44)
    return null;

  const emf = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    emf.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return u32(emf, 0) === EMR.HEADER && u32(emf, 40) === 0x464d4520 && u32(emf, 48) <= emf.byteLength
    ? emf
    : null;
}

function wmfHeaderOffset(bytes: Uint8Array): number {
  if (u32(bytes, 0) !== PlaceableWmfKey)
    return 0;
  if (isWmfHeaderAt(bytes, 22))
    return 22;
  return isWmfHeaderAt(bytes, 24) ? 24 : 22;
}

function isWmfHeaderAt(bytes: Uint8Array, offset: number): boolean {
  return offset + 18 <= bytes.length
    && (u16(bytes, offset) === 1 || u16(bytes, offset) === 2)
    && u16(bytes, offset + 2) === 9;
}

function shouldMirrorPlaceableWmfVertically(bytes: Uint8Array, start: number, viewBox: ViewBox): boolean {
  let windowOrg: { x: number; y: number } | undefined;
  let windowExt: { x: number; y: number } | undefined;

  for (const record of wmfRecords(bytes, start)) {
    const p = record.offset + 6;
    if (record.type === META.SETWINDOWORG)
      windowOrg = { y: i16(bytes, p), x: i16(bytes, p + 2) };
    else if (record.type === META.SETWINDOWEXT)
      windowExt = { y: i16(bytes, p), x: i16(bytes, p + 2) };

    if (windowOrg && windowExt)
      break;
  }

  if (!windowOrg || !windowExt)
    return false;

  const bottom = viewBox.y + viewBox.height;
  return nearlyEqual(windowOrg.x, viewBox.x)
    && nearlyEqual(windowOrg.y, bottom)
    && nearlyEqual(windowExt.x, viewBox.width)
    && nearlyEqual(windowExt.y, -viewBox.height)
    && bottom > viewBox.y;
}

function mirrorElementsVertically(elements: string[], viewBox: ViewBox): string[] {
  if (elements.length === 0)
    return elements;
  return [`<g transform="translate(0 ${viewBox.y * 2 + viewBox.height}) scale(1 -1)">${elements.join('')}</g>`];
}

function nearlyEqual(left: number, right: number): boolean {
  return Math.abs(left - right) <= 1;
}

function createInitialState(): DrawState {
  return {
    pen: { kind: 'pen', color: '#000000', width: 1, none: false },
    brush: { kind: 'brush', color: 'none', none: true },
    font: { kind: 'font', family: 'Arial', height: 12, weight: 400, italic: false },
    textColor: '#000000',
    currentX: 0,
    currentY: 0,
    windowOrgX: 0,
    windowOrgY: 0,
    windowExtX: 1,
    windowExtY: 1,
    viewportOrgX: 0,
    viewportOrgY: 0,
    viewportExtX: 1,
    viewportExtY: 1,
    worldTransform: identityTransform(),
    fillRule: 'evenodd',
  };
}

function cloneState(state: DrawState): DrawState {
  return {
    ...state,
    pen: { ...state.pen },
    brush: { ...state.brush },
    font: { ...state.font },
    worldTransform: { ...state.worldTransform },
    currentPath: state.currentPath ? [...state.currentPath] : undefined,
  };
}

function restoreState(target: DrawState, source: DrawState | undefined): void {
  if (!source)
    return;
  Object.assign(target, cloneState(source));
}

function selectObject(state: DrawState, object: MetafileObject | undefined): void {
  if (!object)
    return;
  if (object.kind === 'pen')
    state.pen = object;
  else if (object.kind === 'brush')
    state.brush = object;
  else
    state.font = object;
}

function emfStockObject(handle: number): MetafileObject | undefined {
  if ((handle & 0x80000000) === 0)
    return undefined;

  switch (handle & 0x7fffffff) {
    case 0:
      return { kind: 'brush', color: '#ffffff', none: false };
    case 1:
      return { kind: 'brush', color: '#c0c0c0', none: false };
    case 2:
      return { kind: 'brush', color: '#808080', none: false };
    case 3:
      return { kind: 'brush', color: '#404040', none: false };
    case 4:
      return { kind: 'brush', color: '#000000', none: false };
    case 5:
      return { kind: 'brush', color: 'none', none: true };
    case 6:
      return { kind: 'pen', color: '#ffffff', width: 1, none: false };
    case 7:
      return { kind: 'pen', color: '#000000', width: 1, none: false };
    case 8:
      return { kind: 'pen', color: '#000000', width: 1, none: true };
    default:
      return undefined;
  }
}

function readEmfFont(bytes: Uint8Array, offset: number, size: number): FontObject {
  const faceOffset = offset + 28;
  const faceEnd = Math.min(faceOffset + 64, offset + size);
  const chars: string[] = [];
  for (let current = faceOffset; current + 1 < faceEnd; current += 2) {
    const code = u16(bytes, current);
    if (code === 0)
      break;
    chars.push(String.fromCharCode(code));
  }

  return {
    kind: 'font',
    family: chars.join('') || 'Arial',
    height: i32(bytes, offset),
    weight: i32(bytes, offset + 16),
    italic: bytes[offset + 20] !== 0,
  };
}

function emfTextElement(bytes: Uint8Array, record: EmfRecord, state: DrawState): string | null {
  const offset = record.offset + 8;
  if (record.size < 84)
    return null;

  const boundsLeft = i32(bytes, offset);
  const boundsTop = i32(bytes, offset + 4);
  const boundsBottom = i32(bytes, offset + 12);
  const textOffset = offset + 28;
  const charCount = u32(bytes, textOffset + 8);
  const stringOffset = u32(bytes, textOffset + 12);
  if (charCount === 0 || stringOffset === 0)
    return null;

  const stringStart = record.offset + stringOffset;
  const stringEnd = stringStart + charCount * 2;
  if (stringEnd > record.offset + record.size || stringEnd > bytes.length)
    return null;

  let text = '';
  for (let current = stringStart; current + 1 < stringEnd; current += 2)
    text += String.fromCharCode(u16(bytes, current));

  const fontSize = Math.max(1, Math.abs(state.font.height) || Math.abs(boundsBottom - boundsTop));
  const weight = state.font.weight >= 600 ? ' font-weight="700"' : '';
  const italic = state.font.italic ? ' font-style="italic"' : '';
  const y = boundsTop + fontSize;
  return `<text x="${boundsLeft}" y="${y}" font-family="${xmlEscape(state.font.family)}" font-size="${fontSize}"${weight}${italic} fill="${state.textColor}"${clipAttr(state)}>${xmlEscape(text)}</text>`;
}

function readEmfPoints16(bytes: Uint8Array, offset: number): Array<[number, number]> {
  const count = u32(bytes, offset + 16);
  const pointsOffset = offset + 20;
  const points: Array<[number, number]> = [];
  for (let index = 0; index < count && pointsOffset + index * 4 + 4 <= bytes.length; index++)
    points.push([i16(bytes, pointsOffset + index * 4), i16(bytes, pointsOffset + index * 4 + 2)]);
  return points;
}

function readEmfPoints32(bytes: Uint8Array, offset: number): Array<[number, number]> {
  const count = u32(bytes, offset + 16);
  const pointsOffset = offset + 20;
  const points: Array<[number, number]> = [];
  for (let index = 0; index < count && pointsOffset + index * 8 + 8 <= bytes.length; index++)
    points.push([i32(bytes, pointsOffset + index * 8), i32(bytes, pointsOffset + index * 8 + 4)]);
  return points;
}

function readEmfPolyPoly16(bytes: Uint8Array, offset: number): Array<Array<[number, number]>> {
  const polygonCount = u32(bytes, offset + 16);
  const totalPoints = u32(bytes, offset + 20);
  const countsOffset = offset + 24;
  const pointsOffset = countsOffset + polygonCount * 4;
  const polygons: Array<Array<[number, number]>> = [];
  let pointIndex = 0;
  for (let polygonIndex = 0; polygonIndex < polygonCount; polygonIndex++) {
    const count = u32(bytes, countsOffset + polygonIndex * 4);
    const points: Array<[number, number]> = [];
    for (let index = 0; index < count && pointIndex < totalPoints; index++, pointIndex++)
      points.push([i16(bytes, pointsOffset + pointIndex * 4), i16(bytes, pointsOffset + pointIndex * 4 + 2)]);
    polygons.push(points);
  }
  return polygons;
}

function readTransform(bytes: Uint8Array, offset: number): Transform {
  return {
    m11: f32(bytes, offset),
    m12: f32(bytes, offset + 4),
    m21: f32(bytes, offset + 8),
    m22: f32(bytes, offset + 12),
    dx: f32(bytes, offset + 16),
    dy: f32(bytes, offset + 20),
  };
}

function identityTransform(): Transform {
  return { m11: 1, m12: 0, m21: 0, m22: 1, dx: 0, dy: 0 };
}

const ModifyWorldTransformIdentity = 1;
const ModifyWorldTransformLeftMultiply = 2;
const ModifyWorldTransformRightMultiply = 3;
const ModifyWorldTransformSet = 4;

function modifyWorldTransform(current: Transform, next: Transform, mode: number): Transform {
  switch (mode) {
    case ModifyWorldTransformIdentity:
      return identityTransform();
    case ModifyWorldTransformLeftMultiply:
      return multiplyTransforms(next, current);
    case ModifyWorldTransformRightMultiply:
      return multiplyTransforms(current, next);
    case ModifyWorldTransformSet:
      return next;
    default:
      return next;
  }
}

function multiplyTransforms(first: Transform, second: Transform): Transform {
  return {
    m11: first.m11 * second.m11 + first.m12 * second.m21,
    m12: first.m11 * second.m12 + first.m12 * second.m22,
    m21: first.m21 * second.m11 + first.m22 * second.m21,
    m22: first.m21 * second.m12 + first.m22 * second.m22,
    dx: first.dx * second.m11 + first.dy * second.m21 + second.dx,
    dy: first.dx * second.m12 + first.dy * second.m22 + second.dy,
  };
}

function transformPoint(state: DrawState, x: number, y: number): [number, number] {
  const worldX = x * state.worldTransform.m11 + y * state.worldTransform.m21 + state.worldTransform.dx;
  const worldY = x * state.worldTransform.m12 + y * state.worldTransform.m22 + state.worldTransform.dy;
  return [
    state.viewportOrgX + (worldX - state.windowOrgX) * state.viewportExtX / state.windowExtX,
    state.viewportOrgY + (worldY - state.windowOrgY) * state.viewportExtY / state.windowExtY,
  ];
}

function transformRect(state: DrawState, left: number, top: number, right: number, bottom: number): [number, number, number, number] {
  const [x1, y1] = transformPoint(state, left, top);
  const [x2, y2] = transformPoint(state, right, bottom);
  return [x1, y1, x2, y2];
}

function scaledPenWidth(state: DrawState, width: number): number {
  const rawWidth = Math.abs(width);
  if (rawWidth === 0)
    return 1;

  const [x0, y0] = transformPoint(state, 0, 0);
  const [x1, y1] = transformPoint(state, rawWidth, 0);
  const [x2, y2] = transformPoint(state, 0, rawWidth);
  return Math.max(1, Math.max(Math.hypot(x1 - x0, y1 - y0), Math.hypot(x2 - x0, y2 - y0)));
}

function appendEmfPolyBezierToPath(state: DrawState, points: Array<[number, number]>): void {
  if (!state.currentPath)
    return;
  for (let index = 0; index + 2 < points.length; index += 3) {
    const [x1, y1] = transformPoint(state, points[index][0], points[index][1]);
    const [x2, y2] = transformPoint(state, points[index + 1][0], points[index + 1][1]);
    const [x3, y3] = transformPoint(state, points[index + 2][0], points[index + 2][1]);
    state.currentPath.push(`C ${x1} ${y1} ${x2} ${y2} ${x3} ${y3}`);
    state.currentX = x3;
    state.currentY = y3;
  }
}

function appendEmfPolyBezierPath(state: DrawState, points: Array<[number, number]>): void {
  if (!state.currentPath || points.length < 4)
    return;
  const [startX, startY] = transformPoint(state, points[0][0], points[0][1]);
  state.currentPath.push(`M ${startX} ${startY}`);
  state.currentX = startX;
  state.currentY = startY;
  state.pathStartX = startX;
  state.pathStartY = startY;
  appendEmfPolyBezierToPath(state, points.slice(1));
}

function appendLinePointsToPath(state: DrawState, points: Array<[number, number]>): void {
  if (!state.currentPath)
    return;
  for (const [rawX, rawY] of points) {
    const [x, y] = transformPoint(state, rawX, rawY);
    state.currentPath.push(`L ${x} ${y}`);
    state.currentX = x;
    state.currentY = y;
  }
}

function appendEmfPolyDraw16ToPath(state: DrawState, bytes: Uint8Array, offset: number): void {
  if (!state.currentPath)
    return;

  const count = u32(bytes, offset + 16);
  const pointsOffset = offset + 20;
  const typesOffset = pointsOffset + count * 4;
  const bezierPoints: Array<[number, number]> = [];

  for (let index = 0; index < count && pointsOffset + index * 4 + 4 <= bytes.length && typesOffset + index < bytes.length; index++) {
    const rawX = i16(bytes, pointsOffset + index * 4);
    const rawY = i16(bytes, pointsOffset + index * 4 + 2);
    const [x, y] = transformPoint(state, rawX, rawY);
    const type = bytes[typesOffset + index];
    const command = type & 0x06;
    const close = (type & 0x01) === 0x01;

    if (command !== PolyDrawTypeBezierTo && bezierPoints.length) {
      appendEmfPolyBezierToPath(state, bezierPoints);
      bezierPoints.length = 0;
    }

    if (command === PolyDrawTypeMoveTo) {
      state.currentPath.push(`M ${x} ${y}`);
      state.currentX = x;
      state.currentY = y;
      state.pathStartX = x;
      state.pathStartY = y;
    } else if (command === PolyDrawTypeLineTo) {
      state.currentPath.push(`L ${x} ${y}`);
      state.currentX = x;
      state.currentY = y;
    } else if (command === PolyDrawTypeBezierTo) {
      bezierPoints.push([rawX, rawY]);
      if (bezierPoints.length === 3) {
        appendEmfPolyBezierToPath(state, bezierPoints);
        bezierPoints.length = 0;
      }
    }

    if (close) {
      if (bezierPoints.length) {
        appendEmfPolyBezierToPath(state, bezierPoints);
        bezierPoints.length = 0;
      }
      state.currentPath.push('Z');
      if (state.pathStartX != null && state.pathStartY != null) {
        state.currentX = state.pathStartX;
        state.currentY = state.pathStartY;
      }
    }
  }

  if (bezierPoints.length)
    appendEmfPolyBezierToPath(state, bezierPoints);
}

function readWmfPoints(bytes: Uint8Array, offset: number): Array<[number, number]> {
  const count = u16(bytes, offset);
  const points: Array<[number, number]> = [];
  for (let index = 0; index < count && offset + 2 + index * 4 + 4 <= bytes.length; index++)
    points.push([i16(bytes, offset + 2 + index * 4), i16(bytes, offset + 2 + index * 4 + 2)]);
  return points;
}

function readWmfPolyPolygon(bytes: Uint8Array, offset: number): Array<Array<[number, number]>> {
  const polygonCount = u16(bytes, offset);
  const countsOffset = offset + 2;
  const pointsOffset = countsOffset + polygonCount * 2;
  const polygons: Array<Array<[number, number]>> = [];
  let pointOffset = pointsOffset;
  for (let polygonIndex = 0; polygonIndex < polygonCount && countsOffset + polygonIndex * 2 + 2 <= bytes.length; polygonIndex++) {
    const pointCount = u16(bytes, countsOffset + polygonIndex * 2);
    const points: Array<[number, number]> = [];
    for (let pointIndex = 0; pointIndex < pointCount && pointOffset + 4 <= bytes.length; pointIndex++) {
      points.push([i16(bytes, pointOffset), i16(bytes, pointOffset + 2)]);
      pointOffset += 4;
    }
    polygons.push(points);
  }
  return polygons;
}

function processEmfPlusComment(renderer: MetafileToSvgRenderer, bytes: Uint8Array, offset: number, drawState: DrawState, state: EmfPlusState, elements: string[]): boolean {
  const dataSize = u32(bytes, offset);
  if (dataSize < 4 || u32(bytes, offset + 4) !== EmfPlus.Signature)
    return false;

  let rendered = false;
  let recordOffset = offset + 8;
  const end = Math.min(bytes.length, recordOffset + dataSize - 4);
  while (recordOffset + 12 <= end) {
    const type = u16(bytes, recordOffset);
    const flags = u16(bytes, recordOffset + 2);
    const size = u32(bytes, recordOffset + 4);
    const dataSize = u32(bytes, recordOffset + 8);
    const dataOffset = recordOffset + 12;
    const recordEnd = recordOffset + size;
    if (size < 12 || recordEnd > end || dataOffset + dataSize > recordEnd)
      break;

    switch (type) {
      case EmfPlus.SetWorldTransform:
        if (dataSize >= 24)
          state.transform = readTransform(bytes, dataOffset);
        break;
      case EmfPlus.ResetWorldTransform:
        state.transform = identityTransform();
        break;
      case EmfPlus.Object:
        readEmfPlusObject(renderer, bytes, dataOffset, dataSize, flags, state);
        break;
      case EmfPlus.FillRects: {
        const rects = emfPlusFillRectsElements(bytes, dataOffset, dataSize, flags, drawState, state);
        if (rects.length) {
          elements.push(...rects);
          rendered = true;
        }
        break;
      }
      case EmfPlus.FillPath: {
        const path = emfPlusPathElement(bytes, dataOffset, flags, drawState, state, 'fill');
        if (path) {
          elements.push(path);
          rendered = true;
        }
        break;
      }
      case EmfPlus.DrawPath: {
        const path = emfPlusPathElement(bytes, dataOffset, flags, drawState, state, 'stroke');
        if (path) {
          elements.push(path);
          rendered = true;
        }
        break;
      }
      case EmfPlus.DrawImage: {
        const image = emfPlusDrawImageElement(bytes, dataOffset, dataSize, flags, drawState, state);
        if (image) {
          elements.push(image);
          rendered = true;
        }
        break;
      }
      case EmfPlus.DrawImagePoints: {
        const image = emfPlusDrawImagePointsElement(bytes, dataOffset, dataSize, flags, drawState, state);
        if (image) {
          elements.push(image);
          rendered = true;
        }
        break;
      }
    }

    recordOffset = recordEnd;
  }
  return rendered;
}

function readEmfPlusObject(renderer: MetafileToSvgRenderer, bytes: Uint8Array, offset: number, size: number, flags: number, state: EmfPlusState): void {
  const objectId = flags & 0xff;
  const objectType = (flags >>> 8) & 0x7f;
  if (objectType === EmfPlusObjectTypePath) {
    const path = readEmfPlusPath(bytes, offset, size, state.transform);
    if (path)
      state.paths.set(objectId, path);
    return;
  }

  if (objectType !== EmfPlusObjectTypeImage || size < 16)
    return;

  const imageDataType = u32(bytes, offset + 4);
  if (imageDataType === EmfPlusImageDataTypeBitmap) {
    const pngOffset = findPngOffset(bytes, offset + 8, offset + size);
    if (pngOffset >= 0)
      state.images.set(objectId, `data:image/png;base64,${base64Encode(bytes.slice(pngOffset, offset + size))}`);
    return;
  }

  if (imageDataType !== EmfPlusImageDataTypeMetafile)
    return;

  const metafileSize = u32(bytes, offset + 12);
  const metafileOffset = offset + 16;
  if (metafileSize === 0 || metafileOffset + metafileSize > bytes.length)
    return;

  const metafileType = u32(bytes, offset + 8);
  const extension = metafileType === EmfPlusMetafileDataTypeWmf || metafileType === EmfPlusMetafileDataTypeWmfPlaceable ? '.wmf' : '.emf';
  const svg = renderer.render(bytes.slice(metafileOffset, metafileOffset + metafileSize), extension);
  if (svg)
    state.images.set(objectId, `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`);
}

function readEmfPlusPath(bytes: Uint8Array, offset: number, size: number, transform: Transform): string | null {
  if (size < 12)
    return null;

  const pointCount = u32(bytes, offset + 4);
  const pathFlags = u32(bytes, offset + 8);
  const compressed = (pathFlags & EmfPlusCompressedFlag) !== 0;
  const pointSize = compressed ? 4 : 8;
  const pointsOffset = offset + 12;
  const typesOffset = pointsOffset + pointCount * pointSize;
  if (pointCount === 0 || typesOffset + pointCount > offset + size)
    return null;

  const commands: string[] = [];
  const points: Array<[number, number]> = [];
  for (let index = 0; index < pointCount; index++) {
    const pointOffset = pointsOffset + index * pointSize;
    const x = compressed ? i16(bytes, pointOffset) : f32(bytes, pointOffset);
    const y = compressed ? i16(bytes, pointOffset + 2) : f32(bytes, pointOffset + 4);
    points.push(transformPointWithTransform(transform, x, y));
  }

  for (let index = 0; index < pointCount; index++) {
    const type = bytes[typesOffset + index];
    const command = type & 0x07;
    const close = (type & EmfPlusPathPointTypeCloseSubpath) !== 0;
    const [x, y] = points[index];

    if (command === EmfPlusPathPointTypeStart)
      commands.push(`M ${x} ${y}`);
    else if (command === EmfPlusPathPointTypeLine)
      commands.push(`L ${x} ${y}`);
    else if (command === EmfPlusPathPointTypeBezier && index + 2 < pointCount) {
      const [x1, y1] = points[index];
      const [x2, y2] = points[index + 1];
      const [x3, y3] = points[index + 2];
      commands.push(`C ${x1} ${y1} ${x2} ${y2} ${x3} ${y3}`);
      index += 2;
    }

    if (close)
      commands.push('Z');
  }

  return commands.length ? commands.join(' ') : null;
}

function emfPlusFillRectsElements(bytes: Uint8Array, offset: number, size: number, flags: number, drawState: DrawState, state: EmfPlusState): string[] {
  const color = (flags & EmfPlusSolidColorBrushFlag) !== 0 ? argbColorAttrs(u32(bytes, offset)) : null;
  const rectOffset = color ? offset + 4 : offset;
  if (!color || rectOffset + 4 > offset + size)
    return [];

  const compressed = (flags & EmfPlusCompressedFlag) !== 0;
  const rectCount = u32(bytes, rectOffset);
  const itemOffset = rectOffset + 4;
  const itemSize = compressed ? 8 : 16;
  if (itemOffset + rectCount * itemSize > offset + size)
    return [];

  const elements: string[] = [];
  for (let index = 0; index < rectCount; index++) {
    const current = itemOffset + index * itemSize;
    const x = compressed ? i16(bytes, current) : f32(bytes, current);
    const y = compressed ? i16(bytes, current + 2) : f32(bytes, current + 4);
    const width = compressed ? i16(bytes, current + 4) : f32(bytes, current + 8);
    const height = compressed ? i16(bytes, current + 6) : f32(bytes, current + 12);
    const [x1, y1] = transformPointWithTransform(state.transform, x, y);
    const [x2, y2] = transformPointWithTransform(state.transform, x + width, y + height);
    elements.push(`<rect x="${Math.min(x1, x2)}" y="${Math.min(y1, y2)}" width="${Math.abs(x2 - x1)}" height="${Math.abs(y2 - y1)}" ${color}${clipAttr(drawState)} />`);
  }
  return elements;
}

function emfPlusPathElement(bytes: Uint8Array, offset: number, flags: number, drawState: DrawState, state: EmfPlusState, mode: 'fill' | 'stroke'): string | null {
  const solidColor = (flags & EmfPlusSolidColorBrushFlag) !== 0;
  const pathId = mode === 'stroke' ? u32(bytes, offset) : flags & 0xff;
  const path = state.paths.get(pathId);
  if (!path)
    return null;

  if (mode === 'fill') {
    const fill = solidColor ? argbColorAttrs(u32(bytes, offset)) : fillAttrs(drawState);
    return `<path d="${path}" stroke="none" ${fill} ${fillRuleAttr(drawState)}${clipAttr(drawState)} />`;
  }

  return `<path d="${path}" ${strokeAttrs(drawState)} fill="none"${clipAttr(drawState)} />`;
}

function emfPlusDrawImageElement(bytes: Uint8Array, offset: number, size: number, flags: number, drawState: DrawState, state: EmfPlusState): string | null {
  if (size < 40)
    return null;

  const image = state.images.get(flags & 0xff);
  if (!image)
    return null;

  const compressedRect = (flags & EmfPlusCompressedFlag) !== 0;
  const rectOffset = offset + 24;
  if (compressedRect && rectOffset + 8 <= offset + size) {
    const x = i16(bytes, rectOffset);
    const y = i16(bytes, rectOffset + 2);
    const width = i16(bytes, rectOffset + 4);
    const height = i16(bytes, rectOffset + 6);
    return imageRectElement(image, x, y, width, height, drawState);
  }

  if (rectOffset + 16 > offset + size)
    return null;

  return imageRectElement(
    image,
    f32(bytes, rectOffset),
    f32(bytes, rectOffset + 4),
    f32(bytes, rectOffset + 8),
    f32(bytes, rectOffset + 12),
    drawState,
  );
}

function emfPlusDrawImagePointsElement(bytes: Uint8Array, offset: number, size: number, flags: number, drawState: DrawState, state: EmfPlusState): string | null {
  if (size < 28)
    return null;

  const image = state.images.get(flags & 0xff);
  if (!image)
    return null;

  const pointCount = u32(bytes, offset + 24);
  if (pointCount < 3 || offset + 28 + pointCount * 8 > bytes.length)
    return null;

  const points: Array<[number, number]> = [];
  const compressedPoints = (flags & EmfPlusCompressedFlag) !== 0;
  const pointSize = compressedPoints ? 4 : 8;
  if (offset + 28 + pointCount * pointSize > bytes.length)
    return null;

  for (let index = 0; index < pointCount; index++) {
    const pointOffset = offset + 28 + index * pointSize;
    const x = compressedPoints ? i16(bytes, pointOffset) : f32(bytes, pointOffset);
    const y = compressedPoints ? i16(bytes, pointOffset + 2) : f32(bytes, pointOffset + 4);
    points.push(transformPointWithTransform(state.transform, x, y));
  }

  const [x0, y0] = points[0];
  const [x1, y1] = points[1];
  const [x2, y2] = points[2];
  const width = Math.hypot(x1 - x0, y1 - y0);
  const height = Math.hypot(x2 - x0, y2 - y0);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0)
    return null;

  const isAxisAligned = Math.abs(y1 - y0) < 0.001 && Math.abs(x2 - x0) < 0.001;
  if (isAxisAligned)
    return `<image x="${Math.min(x0, x1)}" y="${Math.min(y0, y2)}" width="${width}" height="${height}" href="${image}"${clipAttr(drawState)} />`;

  const matrix = [x1 - x0, y1 - y0, x2 - x0, y2 - y0, x0, y0].join(' ');
  return `<image x="0" y="0" width="1" height="1" href="${image}" transform="matrix(${matrix})"${clipAttr(drawState)} />`;
}

function imageRectElement(image: string, x: number, y: number, width: number, height: number, state: DrawState): string | null {
  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(width) || !Number.isFinite(height) || width === 0 || height === 0)
    return null;

  return `<image x="${width < 0 ? x + width : x}" y="${height < 0 ? y + height : y}" width="${Math.abs(width)}" height="${Math.abs(height)}" href="${image}"${clipAttr(state)} />`;
}

function transformPointWithTransform(transform: Transform, x: number, y: number): [number, number] {
  return [
    x * transform.m11 + y * transform.m21 + transform.dx,
    x * transform.m12 + y * transform.m22 + transform.dy,
  ];
}

function transformGdiPointWithEmfPlusTransform(state: DrawState, transform: Transform, x: number, y: number): [number, number] {
  const [gdiX, gdiY] = transformPoint(state, x, y);
  return transformPointWithTransform(transform, gdiX, gdiY);
}

function findPngOffset(bytes: Uint8Array, start: number, end: number): number {
  for (let offset = start; offset + PngSignature.length <= end; offset++) {
    let matches = true;
    for (let index = 0; index < PngSignature.length; index++) {
      if (bytes[offset + index] !== PngSignature[index]) {
        matches = false;
        break;
      }
    }
    if (matches)
      return offset;
  }
  return -1;
}

function emfStretchDibitsElement(bytes: Uint8Array, offset: number, viewBox: ViewBox, state: DrawState): string | null {
  const boundsLeft = i32(bytes, offset);
  const boundsTop = i32(bytes, offset + 4);
  const boundsRight = i32(bytes, offset + 8);
  const boundsBottom = i32(bytes, offset + 12);
  const xDest = i32(bytes, offset + 16);
  const yDest = i32(bytes, offset + 20);
  const offBmiSrc = u32(bytes, offset + 40);
  const cbBmiSrc = u32(bytes, offset + 44);
  const offBitsSrc = u32(bytes, offset + 48);
  const cbBitsSrc = u32(bytes, offset + 52);
  const cxDest = i32(bytes, offset + 64);
  const cyDest = i32(bytes, offset + 68);
  if (cbBmiSrc === 0 || cbBitsSrc === 0)
    return null;
  const bmiStart = offset - 8 + offBmiSrc;
  const bitsStart = offset - 8 + offBitsSrc;
  if (bmiStart + cbBmiSrc > bytes.length || bitsStart + cbBitsSrc > bytes.length)
    return null;
  const dib = concatBytes(bytes.slice(bmiStart, bmiStart + cbBmiSrc), bytes.slice(bitsStart, bitsStart + cbBitsSrc));
  const bmp = dibToBmp(dib);
  const [fallbackX1, fallbackY1, fallbackX2, fallbackY2] = transformRect(state, xDest, yDest, xDest + (cxDest || viewBox.width), yDest + (cyDest || viewBox.height));
  const left = boundsLeft || boundsRight ? Math.min(boundsLeft, boundsRight) : Math.min(fallbackX1, fallbackX2);
  const top = boundsTop || boundsBottom ? Math.min(boundsTop, boundsBottom) : Math.min(fallbackY1, fallbackY2);
  const width = boundsLeft || boundsRight ? Math.abs(boundsRight - boundsLeft) + 1 : Math.abs(fallbackX2 - fallbackX1);
  const height = boundsTop || boundsBottom ? Math.abs(boundsBottom - boundsTop) + 1 : Math.abs(fallbackY2 - fallbackY1);
  return `<image x="${left}" y="${top}" width="${width || Math.abs(cxDest || viewBox.width)}" height="${height || Math.abs(cyDest || viewBox.height)}" href="data:image/bmp;base64,${base64Encode(bmp)}"${clipAttr(state)} />`;
}

function wmfStretchDibElement(bytes: Uint8Array, record: WmfRecord, state: DrawState): string | null {
  const p = record.offset + 6;
  const dibStart = p + 22;
  const recordEnd = record.offset + record.sizeBytes;
  if (dibStart >= recordEnd || recordEnd > bytes.length)
    return null;

  const xDest = i16(bytes, p + 20);
  const yDest = i16(bytes, p + 18);
  const width = i16(bytes, p + 16);
  const height = i16(bytes, p + 14);
  const dib = bytes.slice(dibStart, recordEnd);
  const bmp = dibToBmp(dib);
  return `<image x="${xDest}" y="${yDest}" width="${Math.abs(width) || 1}" height="${Math.abs(height) || 1}" href="data:image/bmp;base64,${base64Encode(bmp)}"${clipAttr(state)} />`;
}

function dibToBmp(dib: Uint8Array): Uint8Array {
  const fileHeaderSize = 14;
  const pixelOffset = fileHeaderSize + dibHeaderAndPaletteSize(dib);
  const fileSize = fileHeaderSize + dib.byteLength;
  const result = new Uint8Array(fileSize);
  result[0] = 0x42;
  result[1] = 0x4d;
  setU32(result, 2, fileSize);
  setU32(result, 10, pixelOffset);
  result.set(dib, fileHeaderSize);
  return result;
}

function dibHeaderAndPaletteSize(dib: Uint8Array): number {
  if (dib.byteLength < 40)
    return dib.byteLength;
  const headerSize = u32(dib, 0);
  const bitCount = u16(dib, 14);
  const colorsUsed = u32(dib, 32);
  const paletteEntries = colorsUsed || (bitCount <= 8 ? 1 << bitCount : 0);
  return Math.min(dib.byteLength, headerSize + paletteEntries * 4);
}

function svgDocument(viewBox: ViewBox, elements: string[], defs: string[] = []): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}" width="${viewBox.width}" height="${viewBox.height}">${defs.length ? `<defs>${defs.join('')}</defs>` : ''}${elements.join('')}</svg>`;
}

function normalizeViewBox(value: ViewBox): ViewBox {
  const width = Math.abs(value.width) || 1;
  const height = Math.abs(value.height) || 1;
  return {
    x: value.width < 0 ? value.x + value.width : value.x,
    y: value.height < 0 ? value.y + value.height : value.y,
    width,
    height,
  };
}

function createBoundsBuilder(): BoundsBuilder {
  return {
    hasValue: false,
    left: Number.POSITIVE_INFINITY,
    top: Number.POSITIVE_INFINITY,
    right: Number.NEGATIVE_INFINITY,
    bottom: Number.NEGATIVE_INFINITY,
  };
}

function addBoundsPoint(bounds: BoundsBuilder, x: number, y: number): void {
  if (!Number.isFinite(x) || !Number.isFinite(y))
    return;

  bounds.left = Math.min(bounds.left, x);
  bounds.top = Math.min(bounds.top, y);
  bounds.right = Math.max(bounds.right, x);
  bounds.bottom = Math.max(bounds.bottom, y);
  bounds.hasValue = true;
}

function addBoundsPoints(bounds: BoundsBuilder, points: Array<[number, number]>): void {
  for (const [x, y] of points)
    addBoundsPoint(bounds, x, y);
}

function boundsToViewBox(bounds: BoundsBuilder): ViewBox {
  return {
    x: bounds.left,
    y: bounds.top,
    width: Math.max(1, bounds.right - bounds.left),
    height: Math.max(1, bounds.bottom - bounds.top),
  };
}

function emfHeaderViewBox(bytes: Uint8Array): ViewBox | null {
  if (bytes.length < 88)
    return null;

  const frameLeft = i32(bytes, 24);
  const frameTop = i32(bytes, 28);
  const frameRight = i32(bytes, 32);
  const frameBottom = i32(bytes, 36);
  const deviceWidth = i32(bytes, 72);
  const deviceHeight = i32(bytes, 76);
  const millimetersWidth = i32(bytes, 80);
  const millimetersHeight = i32(bytes, 84);
  if (deviceWidth <= 0 || deviceHeight <= 0 || millimetersWidth <= 0 || millimetersHeight <= 0 || frameRight === frameLeft || frameBottom === frameTop)
    return null;

  const xScale = deviceWidth / (millimetersWidth * 100);
  const yScale = deviceHeight / (millimetersHeight * 100);
  return normalizeViewBox({
    x: frameLeft * xScale,
    y: frameTop * yScale,
    width: (frameRight - frameLeft) * xScale,
    height: (frameBottom - frameTop) * yScale,
  });
}

function lineElement(x1: number, y1: number, x2: number, y2: number, state: DrawState): string {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ${strokeAttrs(state)} fill="none" />`;
}

function rectElement(left: number, top: number, right: number, bottom: number, state: DrawState): string {
  return `<rect x="${Math.min(left, right)}" y="${Math.min(top, bottom)}" width="${Math.abs(right - left)}" height="${Math.abs(bottom - top)}" ${paintAttrs(state)} />`;
}

function ellipseElement(left: number, top: number, right: number, bottom: number, state: DrawState): string {
  const width = Math.abs(right - left);
  const height = Math.abs(bottom - top);
  return `<ellipse cx="${Math.min(left, right) + width / 2}" cy="${Math.min(top, bottom) + height / 2}" rx="${width / 2}" ry="${height / 2}" ${paintAttrs(state)} />`;
}

function polyElement(points: Array<[number, number]>, closed: boolean, state: DrawState): string {
  if (points.length === 0)
    return '';
  const tag = closed ? 'polygon' : 'polyline';
  const fill = closed ? `${fillAttrs(state)} ${fillRuleAttr(state)}` : 'fill="none"';
  return `<${tag} points="${points.map(([x, y]) => `${x},${y}`).join(' ')}" ${strokeAttrs(state)} ${fill} />`;
}

function isTallFallbackDuplicate(points: Array<[number, number]>): boolean {
  if (points.length < 4)
    return false;

  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  const width = Math.max(...xs) - Math.min(...xs);
  const height = Math.max(...ys) - Math.min(...ys);
  return height > width * 2;
}

function pathElement(path: string[], state: DrawState, mode: 'fill' | 'stroke' | 'paint'): string {
  const stroke = mode === 'fill' ? 'stroke="none"' : strokeAttrs(state);
  const fill = mode === 'stroke' ? 'fill="none"' : fillAttrs(state);
  const fillRule = mode === 'stroke' ? '' : ` ${fillRuleAttr(state)}`;
  return `<path d="${path.join(' ')}" ${stroke} ${fill}${fillRule}${clipAttr(state)} />`;
}

function paintAttrs(state: DrawState): string {
  return `${strokeAttrs(state)} ${fillAttrs(state)}`;
}

function strokeAttrs(state: DrawState): string {
  return state.pen.none ? 'stroke="none"' : `stroke="${state.pen.color}" stroke-width="${state.pen.width}"`;
}

function fillAttrs(state: DrawState): string {
  return state.brush.none ? 'fill="none"' : `fill="${state.brush.color}"`;
}

function argbColorAttrs(value: number): string {
  const alpha = (value >>> 24) & 0xff;
  const red = (value >>> 16) & 0xff;
  const green = (value >>> 8) & 0xff;
  const blue = value & 0xff;
  const opacity = alpha < 255 ? ` fill-opacity="${alpha / 255}"` : '';
  return `fill="#${hex(red)}${hex(green)}${hex(blue)}"${opacity}`;
}

function fillRuleAttr(state: DrawState): string {
  return `fill-rule="${state.fillRule}"`;
}

function polyFillRule(mode: number): 'evenodd' | 'nonzero' {
  return mode === 2 ? 'nonzero' : 'evenodd';
}

function clipAttr(state: DrawState): string {
  return state.activeClipId ? ` clip-path="url(#${state.activeClipId})"` : '';
}

function colorRef(bytes: Uint8Array, offset: number): string {
  return `#${hex(bytes[offset])}${hex(bytes[offset + 1])}${hex(bytes[offset + 2])}`;
}

function hex(value: number | undefined): string {
  return (value ?? 0).toString(16).padStart(2, '0');
}

function concatBytes(...chunks: Uint8Array[]): Uint8Array {
  const result = new Uint8Array(chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0));
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return result;
}

function u16(bytes: Uint8Array, offset: number): number {
  return bytes[offset] | (bytes[offset + 1] << 8);
}

function i16(bytes: Uint8Array, offset: number): number {
  const value = u16(bytes, offset);
  return value & 0x8000 ? value - 0x10000 : value;
}

function u32(bytes: Uint8Array, offset: number): number {
  return (bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16) | (bytes[offset + 3] << 24)) >>> 0;
}

function i32(bytes: Uint8Array, offset: number): number {
  return bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16) | (bytes[offset + 3] << 24);
}

function f32(bytes: Uint8Array, offset: number): number {
  return new DataView(bytes.buffer, bytes.byteOffset + offset, 4).getFloat32(0, true);
}

function setU32(bytes: Uint8Array, offset: number, value: number): void {
  bytes[offset] = value & 0xff;
  bytes[offset + 1] = (value >>> 8) & 0xff;
  bytes[offset + 2] = (value >>> 16) & 0xff;
  bytes[offset + 3] = (value >>> 24) & 0xff;
}

function ascii4(bytes: Uint8Array, offset: number): string {
  return String.fromCharCode(bytes[offset], bytes[offset + 1], bytes[offset + 2], bytes[offset + 3]);
}

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function base64Encode(bytes: Uint8Array): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let output = '';
  for (let index = 0; index < bytes.length; index += 3) {
    const first = bytes[index] ?? 0;
    const second = bytes[index + 1] ?? 0;
    const third = bytes[index + 2] ?? 0;
    const triplet = (first << 16) | (second << 8) | third;
    output += alphabet[(triplet >> 18) & 63];
    output += alphabet[(triplet >> 12) & 63];
    output += index + 1 < bytes.length ? alphabet[(triplet >> 6) & 63] : '=';
    output += index + 2 < bytes.length ? alphabet[triplet & 63] : '=';
  }
  return output;
}

const PolyDrawTypeMoveTo = 0x06;
const PolyDrawTypeLineTo = 0x02;
const PolyDrawTypeBezierTo = 0x04;
