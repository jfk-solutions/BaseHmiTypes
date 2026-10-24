// infos at https://github.com/libyal/dtformats/blob/main/documentation/Windows%20(Enhanced)%20Metafile%20Format%20(WMF%20and%20EMF).asciidoc

type MetafileObject = PenObject | BrushObject | FontObject;

interface PenObject {
  identity?: object;
  cosmeticDashes?: boolean;
  opaqueDashGaps?: boolean;
  dashArray?: number[];
  lineCap?: string;
  lineJoin?: string;
  kind: 'pen';
  color: string;
  width: number;
  none: boolean;
}

interface BrushObject {
  hatch?: number;
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

const CLIP_VIEWPORT_TOKEN = '__METAFILE_CLIP_VIEWPORT__';
const DEFAULT_CLIP_VIEWPORT_TOKEN = '__METAFILE_DEFAULT_CLIP_VIEWPORT__';

interface DrawState {
  styledPen?: object;
  cosmeticPhase: number;
  resolvedBrushFill?: string;
  backgroundMode: number;
  backgroundColor: string;
  brushOrgX: number;
  brushOrgY: number;
  mapMode: number;
  isotropicDirty: boolean;
  pathFigureClosed: boolean;
  clockwiseShapes: boolean;
  miterLimit: number;
  pen: PenObject;
  brush: BrushObject;
  font: FontObject;
  textColor: string;
  currentX: number;
  currentY: number;
  logicalCurrentX: number;
  logicalCurrentY: number;
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
  activeMaskId?: string;
  metaMaskId?: string;
  currentPath?: string[];
  selectedPath?: string[];
  pathStartX?: number;
  pathStartY?: number;
  pathEndX?: number;
  pathEndY?: number;
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
    // EMF playback starts with WHITE_BRUSH, not NULL_BRUSH.
    state.brush = { kind: 'brush', color: '#ffffff', none: false };
    const mappingDevice = emfMappingDevice(bytes);
    const stateStack: DrawState[] = [];
    const objects = new Map<number, MetafileObject>();
    const emfPlusState: EmfPlusState = {
      transform: identityTransform(),
      images: new Map(),
      paths: new Map(),
    };
    const elements: string[] = [];
    const defs: string[] = [];
    const hatchPatterns = new Map<string, string>();
    let clipSequence = 0;
    const clipExpansion = { x: 0, y: 0 };
    let hasEmfPlusDrawing = false;

    for (const record of emfRecords(bytes)) {
      if (EMF_MAPPING_RECORDS.has(record.type) && (record.type !== EMR.SETPIXELV || record.size >= 20)) prepareEmfMapping(state);
      [state.currentX, state.currentY] = transformPoint(state, state.logicalCurrentX, state.logicalCurrentY);
      const firstElement = elements.length;
      const dataOffset = record.offset + 8;
      const dataEnd = record.offset + record.size;
      if (dataEnd > bytes.length)
        break;
      if (EMF_BRUSH_RECORDS.has(record.type) && state.currentPath === undefined
        && (![EMR.FILLPATH, EMR.STROKEANDFILLPATH].includes(record.type) || !!state.selectedPath?.length))
        state.resolvedBrushFill = resolveBrushFill(state.brush, state, defs, hatchPatterns);

      switch (record.type) {
        case EMR.SETBRUSHORGEX:
          if (record.size >= 16) { state.brushOrgX = i32(bytes, dataOffset); state.brushOrgY = i32(bytes, dataOffset + 4); }
          break;
        case EMR.SETBKMODE:
          if (record.size >= 12) {
            const mode = u32(bytes, dataOffset);
            if (mode === 1 || mode === 2) state.backgroundMode = mode;
          }
          break;
        case EMR.SETBKCOLOR:
          if (record.size >= 12) state.backgroundColor = colorRef(bytes, dataOffset);
          break;
        case EMR.GDICOMMENT:
          hasEmfPlusDrawing = processEmfPlusComment(this, bytes, dataOffset, state, emfPlusState, elements) || hasEmfPlusDrawing;
          break;
        case EMR.SETMAPMODE:
          if (record.size >= 12) setEmfMapMode(state, i32(bytes, dataOffset), mappingDevice);
          break;
        case EMR.SETWINDOWORGEX:
          if (record.size >= 16) { state.windowOrgX = i32(bytes, dataOffset); state.windowOrgY = i32(bytes, dataOffset + 4); }
          break;
        case EMR.SETWINDOWEXTEX:
          if (record.size >= 16) setEmfExtents(state, i32(bytes, dataOffset), i32(bytes, dataOffset + 4), false);
          break;
        case EMR.SETVIEWPORTORGEX:
          if (record.size >= 16) { state.viewportOrgX = i32(bytes, dataOffset); state.viewportOrgY = i32(bytes, dataOffset + 4); }
          break;
        case EMR.SETVIEWPORTEXTEX:
          if (record.size >= 16) setEmfExtents(state, i32(bytes, dataOffset), i32(bytes, dataOffset + 4), true);
          break;
        case EMR.SCALEWINDOWEXTEX:
        case EMR.SCALEVIEWPORTEXTEX:
          if (record.size >= 24) scaleEmfExtents(state, i32(bytes, dataOffset), i32(bytes, dataOffset + 4), i32(bytes, dataOffset + 8), i32(bytes, dataOffset + 12), record.type === EMR.SCALEVIEWPORTEXTEX);
          break;
        case EMR.SETPOLYFILLMODE:
          state.fillRule = polyFillRule(u32(bytes, dataOffset));
          break;
        case EMR.SETMITERLIMIT:
          if (record.size >= 12) {
            const limit = f32(bytes, dataOffset);
            if (Number.isFinite(limit) && limit >= 1) state.miterLimit = limit;
          }
          break;
        case EMR.SETARCDIRECTION:
          if (record.size >= 12) {
            const direction = u32(bytes, dataOffset);
            if (direction === 1 || direction === 2) state.clockwiseShapes = direction === 2;
          }
          break;
        case EMR.SETTEXTCOLOR:
          state.textColor = colorRef(bytes, dataOffset);
          break;
        case EMR.SAVEDC:
          stateStack.push(cloneState(state));
          break;
        case EMR.RESTOREDC:
          if (record.size >= 12) restoreRelativeState(state, stateStack, i32(bytes, dataOffset));
          break;
        case EMR.SETWORLDTRANSFORM:
          if (record.size >= 32) {
            const value = readTransform(bytes, dataOffset);
            if (!isSingularTransform(value)) state.worldTransform = value;
          }
          break;
        case EMR.MODIFYWORLDTRANSFORM:
          if (record.size >= 36)
            state.worldTransform = modifyWorldTransform(state.worldTransform, readTransform(bytes, dataOffset), u32(bytes, dataOffset + 24));
          break;
        case EMR.CREATEPEN:
          if (record.size < 28) break;
          objects.set(u32(bytes, dataOffset), {
            kind: 'pen',
            // LogPen.Width.x supplies the width; Width.y is ignored.
            width: Math.max(1, Math.abs(i32(bytes, dataOffset + 8))),
            color: colorRef(bytes, dataOffset + 16),
            none: (u32(bytes, dataOffset + 4) & 0xF) === 5,
            dashArray: Math.abs(i32(bytes, dataOffset + 8)) <= 1 ? cosmeticPattern(u32(bytes, dataOffset + 4) & 0xf) : undefined,
            cosmeticDashes: Math.abs(i32(bytes, dataOffset + 8)) <= 1 && (u32(bytes, dataOffset + 4) & 0xf) >= 1 && (u32(bytes, dataOffset + 4) & 0xf) <= 4,
            opaqueDashGaps: true,
          });
          break;
        case EMR.CREATEBRUSHINDIRECT:
          if (record.size < 24) break;
          objects.set(u32(bytes, dataOffset), {
            kind: 'brush',
            color: colorRef(bytes, dataOffset + 8),
            none: u32(bytes, dataOffset + 4) === 1,
            hatch: u32(bytes, dataOffset + 4) === 2 && u32(bytes, dataOffset + 12) <= 5 ? u32(bytes, dataOffset + 12) : undefined,
          });
          break;
        case EMR.EXTCREATEFONTINDIRECTW:
          objects.set(u32(bytes, dataOffset), readEmfFont(bytes, dataOffset + 4, record.size - 12));
          break;
        case EMR.EXTCREATEPEN: {
          if (record.size < 52) break;
          const style = u32(bytes, dataOffset + 20);
          const geometric = (style & 0xf0000) === 0x10000;
          let width = scaledPenWidth(state, i32(bytes, dataOffset + 24));
          let dashArray = geometric ? readGeometricDashes(bytes, record, style, width, state) : undefined;
          if (!geometric && [1, 2, 3, 4, 7, 8].includes(style & 0xf)) {
            if (u32(bytes, dataOffset + 24) !== 1) break;
            dashArray = readCosmeticDashes(bytes, record, style);
            width = 1;
          }
          if (dashArray === null) break;
          objects.set(u32(bytes, dataOffset), {
            kind: 'pen',
            width,
            dashArray,
            cosmeticDashes: !geometric && dashArray !== undefined,
            color: colorRef(bytes, dataOffset + 32),
            none: (u32(bytes, dataOffset + 20) & 0x0000000f) === 5,
            lineCap: geometric ? ({0: 'round', 256: 'square', 512: 'butt'} as Record<number, string>)[style & 0xf00] : undefined,
            lineJoin: geometric ? ({0: 'round', 4096: 'bevel', 8192: 'miter'} as Record<number, string>)[style & 0xf000] : undefined,
          });
          break;
        }
        case EMR.SELECTOBJECT:
          selectObject(state, emfStockObject(u32(bytes, dataOffset)) ?? objects.get(u32(bytes, dataOffset)));
          break;
        case EMR.DELETEOBJECT:
          objects.delete(u32(bytes, dataOffset));
          break;
        case EMR.MOVETOEX:
          state.cosmeticPhase = 0;
          state.logicalCurrentX = i32(bytes, dataOffset);
          state.logicalCurrentY = i32(bytes, dataOffset + 4);
          [state.currentX, state.currentY] = transformPoint(state, i32(bytes, dataOffset), i32(bytes, dataOffset + 4));
          if (state.currentPath) {
            appendNativePoint(state.currentPath,'M',[state.currentX,state.currentY],state);
            state.pathStartX = state.currentX;
            state.pathFigureClosed = false;
            state.pathStartY = state.currentY;
            state.pathEndX = state.currentX;
            state.pathEndY = state.currentY;
          }
          break;
        case EMR.LINETO: {
          const [x, y] = transformPoint(state, i32(bytes, dataOffset), i32(bytes, dataOffset + 4));
          if (state.currentPath) {
            ensurePathPosition(state);
            appendNativePoint(state.currentPath,'L',[x,y],state);
            state.pathEndX = x;
            state.pathEndY = y;
          }
          else
            elements.push(lineElement(state.currentX, state.currentY, x, y, state));
          state.currentX = x;
          state.currentY = y;
          state.logicalCurrentX = i32(bytes, dataOffset);
          state.logicalCurrentY = i32(bytes, dataOffset + 4);
          break;
        }
        case EMR.SETPIXELV:
          if (record.size >= 20) {
            const point = transformPoint(state, i32(bytes, dataOffset), i32(bytes, dataOffset + 4));
            const x = Math.floor(point[0] + 0.5), y = Math.floor(point[1] + 0.5);
            if (Number.isFinite(x) && Number.isFinite(y) && x >= -2147483648 && x <= 2147483647 && y >= -2147483648 && y <= 2147483647)
              elements.push(`<rect x="${x}" y="${y}" width="1" height="1" fill="${colorRef(bytes, dataOffset + 8)}"${clipAttr(state)} />`);
          }
          break;
        case EMR.BEGINPATH:
          state.selectedPath = undefined;
          state.currentPath = [];
          state.pathFigureClosed = false;
          state.pathStartX = undefined;
          state.pathStartY = undefined;
          state.pathEndX = undefined;
          state.pathEndY = undefined;
          break;
        case EMR.CLOSEFIGURE:
          if (state.currentPath?.length && !state.pathFigureClosed) {
            // Pending moves are discarded; close preceding drawn geometry,
            // preserving the DC endpoint and forcing a subsequent new figure.
            while (state.currentPath.at(-1)?.startsWith('M ')) state.currentPath.pop();
            if (state.currentPath.length && state.currentPath.at(-1) !== 'Z') state.currentPath.push('Z');
            state.pathEndX = state.pathStartX;
            state.pathEndY = state.pathStartY;
            state.pathFigureClosed = true;
          }
          break;
        case EMR.ENDPATH:
          if (state.currentPath !== undefined) {
            state.selectedPath = state.currentPath;
            resetPathConstruction(state);
          }
          break;
        case EMR.ABORTPATH:
          state.selectedPath = undefined;
          resetPathConstruction(state);
          break;
        case EMR.SELECTCLIPPATH:
          if (record.size >= 12 && u32(bytes, dataOffset) >= 1 && u32(bytes, dataOffset) <= 5 && state.selectedPath?.length) {
            selectPathClip(state, u32(bytes, dataOffset), viewBox, defs, ++clipSequence);
            state.selectedPath = undefined;
          }
          break;
        case EMR.INTERSECTCLIPRECT:
        case EMR.EXCLUDECLIPRECT:
          if (record.size >= 24)
            combineRectClip(i32(bytes, dataOffset), i32(bytes, dataOffset + 4), i32(bytes, dataOffset + 8), i32(bytes, dataOffset + 12), record.type === EMR.INTERSECTCLIPRECT ? 1 : 4, state, viewBox, defs, ++clipSequence, true);
          break;
        case EMR.EXTSELECTCLIPRGN: {
          if (record.size < 16) break;
          const regionBytes = u32(bytes, dataOffset), mode = u32(bytes, dataOffset + 4);
          if (mode < 1 || mode > 5) break;
          if (regionBytes === 0) {
            if (mode === 5) { state.activeClipId = undefined; state.activeMaskId = undefined; }
            break;
          }
          const geometry = readEmfClipRegion(bytes, record, regionBytes);
          if (geometry !== undefined) combineClipGeometry(state, geometry, mode, viewBox, defs, ++clipSequence);
          break;
        }
        case EMR.FILLRGN:
        case EMR.PAINTRGN: {
          const selectedBrush = record.type === EMR.PAINTRGN;
          if (record.size < (selectedBrush ? 60 : 64)) break;
          const index = selectedBrush ? 0 : u32(bytes, dataOffset + 20), brush = selectedBrush ? state.brush : emfStockObject(index) ?? objects.get(index);
          if (!brush || brush.kind !== 'brush' || brush.none) break;
          const rectangles = readEmfRegionRectangles(bytes, record, u32(bytes, dataOffset + 16), selectedBrush ? 28 : 32);
          if (!rectangles?.length) break;
          prepareEmfMapping(state);
          const geometry = emfRegionGeometry(rectangles, state);
          if (geometry !== undefined) elements.push(`<path ${geometry} stroke="none" fill="${resolveBrushFill(brush, state, defs, hatchPatterns)}"${clipAttr(state)} />`);
          break;
        }
        case EMR.OFFSETCLIPRGN:
          if (record.size >= 16) {
            const x = i32(bytes, dataOffset), y = i32(bytes, dataOffset + 4), t = state.worldTransform;
            const dx = (x * t.m11 + y * t.m21) * state.viewportExtX / (state.windowExtX || 1);
            const dy = (x * t.m12 + y * t.m22) * state.viewportExtY / (state.windowExtY || 1);
            clipSequence = offsetSelectedClip(dx, dy, state, defs, clipSequence, clipExpansion);
          }
          break;
        case EMR.SETMETARGN:
          clipSequence = setMetaRegion(state, defs, clipSequence);
          break;
        case EMR.POLYLINETO:
        case EMR.POLYLINETO16:
        case EMR.POLYBEZIER:
        case EMR.POLYBEZIER16:
        case EMR.POLYBEZIERTO:
        case EMR.POLYBEZIERTO16:
          drawEmfPointCurve(bytes, record, state, elements);
          break;
        case EMR.POLYDRAW16:
        case EMR.POLYDRAW:
          drawEmfPolyDraw(state, bytes, record, elements);
          break;
        case EMR.RECTANGLE:
        case EMR.ELLIPSE:
          if (record.size < 24) break;
          if (state.currentPath !== undefined) appendEmfShapePath(bytes, dataOffset, record.type === EMR.ELLIPSE, state);
          else if (state.worldTransform.m12 !== 0 || state.worldTransform.m21 !== 0)
            elements.push(pathElement(emfShapePath(bytes, dataOffset, record.type === EMR.ELLIPSE, state).path, state, 'paint'));
          else {
            const rect = transformRect(state, i32(bytes, dataOffset), i32(bytes, dataOffset + 4), i32(bytes, dataOffset + 8), i32(bytes, dataOffset + 12));
            elements.push(record.type === EMR.ELLIPSE ? ellipseElement(...rect, state) : rectElement(...rect, state));
          }
          break;
        case EMR.ROUNDRECT:
          if (record.size >= 32) drawRoundRect(i32(bytes, dataOffset), i32(bytes, dataOffset + 4), i32(bytes, dataOffset + 8), i32(bytes, dataOffset + 12), i32(bytes, dataOffset + 16), i32(bytes, dataOffset + 20), state, elements, true);
          break;
        case EMR.ANGLEARC:
          if (record.size >= 28)
            drawAngleArc(i32(bytes, dataOffset), i32(bytes, dataOffset + 4), u32(bytes, dataOffset + 8), f32(bytes, dataOffset + 12), f32(bytes, dataOffset + 16), state, elements);
          break;
        case EMR.ARC:
        case EMR.CHORD:
        case EMR.PIE:
        case EMR.ARCTO:
          if (record.size >= 40) drawArc(record.type, i32(bytes, dataOffset), i32(bytes, dataOffset + 4), i32(bytes, dataOffset + 8), i32(bytes, dataOffset + 12), i32(bytes, dataOffset + 16), i32(bytes, dataOffset + 20), i32(bytes, dataOffset + 24), i32(bytes, dataOffset + 28), state, elements, true);
          break;
        case EMR.POLYGON16:
        case EMR.POLYLINE16:
        case EMR.POLYGON:
        case EMR.POLYLINE: {
          const shortPoints = record.type === EMR.POLYGON16 || record.type === EMR.POLYLINE16;
          const plusFallback = shortPoints && hasEmfPlusDrawing;
          const points = readEmfPointArray32(bytes, record, shortPoints).map(([x, y]) => plusFallback ? transformGdiPointWithEmfPlusTransform(state, emfPlusState.transform, x, y) : transformPoint(state, x, y));
          if (points.length < 2) break;
          const closed = record.type === EMR.POLYGON || record.type === EMR.POLYGON16;
          if (state.currentPath === undefined) {
            // Preserve established EMF+ fallback ordering and duplicate suppression.
            if (plusFallback && closed && isTallFallbackDuplicate(points)) break;
            const element = polyElement(points, closed, state);
            if (plusFallback) elements.unshift(element);
            else elements.push(element);
          } else {
            // Independent figures leave the DC current position unchanged.
            appendNativePoint(state.currentPath,'M',points[0],state);
            for (let index = 1; index < points.length; index++)
              appendNativePoint(state.currentPath,'L',points[index],state);
            if (closed) state.currentPath.push('Z');
            state.pathFigureClosed = closed;
            state.pathStartX = points[0][0];
            state.pathStartY = points[0][1];
            state.pathEndX = closed ? points[0][0] : points.at(-1)![0];
            state.pathEndY = closed ? points[0][1] : points.at(-1)![1];
          }
          break;
        }
        case EMR.POLYPOLYGON16:
        case EMR.POLYPOLYLINE16:
        case EMR.POLYPOLYGON:
        case EMR.POLYPOLYLINE: {
          const closed = record.type === EMR.POLYPOLYGON || record.type === EMR.POLYPOLYGON16;
          const shortPoints = record.type === EMR.POLYPOLYGON16 || record.type === EMR.POLYPOLYLINE16;
          const path: string[] = [];
          for (const figure of readEmfCompoundPoints(bytes, record, shortPoints)) {
            const points = figure.map(([x, y]) => hasEmfPlusDrawing ? transformGdiPointWithEmfPlusTransform(state, emfPlusState.transform, x, y) : transformPoint(state, x, y));
            appendNativePoint(path,'M',points[0],state);
            for (let index = 1; index < points.length; index++) appendNativePoint(path,'L',points[index],state);
            if (closed) path.push('Z');
            if (state.currentPath !== undefined) {
              state.pathStartX = points[0][0]; state.pathStartY = points[0][1];
              state.pathFigureClosed = closed;
              state.pathEndX = closed ? points[0][0] : points.at(-1)![0];
              state.pathEndY = closed ? points[0][1] : points.at(-1)![1];
            }
          }
          if (!path.length) break;
          if (state.currentPath !== undefined) appendMetafilePath(state.currentPath,path);
          else elements.push(pathElement(path, state, closed ? 'paint' : 'stroke'));
          break;
        }
        case EMR.FILLPATH:
          if (state.selectedPath?.length)
            elements.push(pathElement(state.selectedPath, state, 'fill'));
          state.selectedPath = undefined;
          break;
        case EMR.STROKEPATH:
          if (state.selectedPath?.length)
            elements.push(pathElement(state.selectedPath, state, 'stroke'));
          state.selectedPath = undefined;
          break;
        case EMR.STROKEANDFILLPATH:
          if (state.selectedPath?.length)
            elements.push(pathElement(state.selectedPath, state, 'paint'));
          state.selectedPath = undefined;
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
      if (!state.pen.cosmeticDashes && !state.pen.none && elements.slice(firstElement).some(element=>element.includes(strokeAttrs(state)))) {
        state.styledPen=penIdentity(state.pen); state.cosmeticPhase=0;
      }
      applyCosmeticGapBackground(elements, firstElement, state);
      // The metaregion is independent of the selected clip on each drawing.
      if (state.metaMaskId && elements.length > firstElement) {
        elements.splice(firstElement, 0, `<g mask="url(#${state.metaMaskId})">`);
        elements.push('</g>');
      }
    }

    resolveClipViewport(defs, viewBox, clipExpansion);
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
    let mirrorVertically = placeable && shouldMirrorPlaceableWmfVertically(bytes, start, rawViewBox);
    let viewBox = normalizeViewBox(rawViewBox);
    const state = createInitialState();
    const objects: Array<MetafileObject | null> = [];
    const elements: string[] = [];
    const defs: string[] = [];
    let clipSequence = 0;
    const clipExpansion = { x: 0, y: 0 };
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
          mirrorVertically = windowExt.y < 0;
          hasExplicitWindow = true;
          break;
        case META.SETPOLYFILLMODE:
          state.fillRule = polyFillRule(u16(bytes, p));
          break;
        case META.INTERSECTCLIPRECT:
        case META.EXCLUDECLIPRECT:
          if (record.sizeBytes >= 14)
            combineRectClip(i16(bytes, p + 6), i16(bytes, p + 4), i16(bytes, p + 2), i16(bytes, p), record.type === META.INTERSECTCLIPRECT ? 1 : 4, state, undefined, defs, ++clipSequence, false);
          break;
        case META.OFFSETCLIPRGN:
          if (record.sizeBytes >= 10)
            clipSequence = offsetSelectedClip(i16(bytes, p + 2), i16(bytes, p), state, defs, clipSequence, clipExpansion);
          break;
        case META.CREATEPENINDIRECT:
          addWmfObject(objects, {
            kind: 'pen',
            width: Math.max(1, Math.abs(i16(bytes, p + 2))),
            color: colorRef(bytes, p + 6),
            none: u16(bytes, p) === 5,
          });
          break;
        case META.CREATEBRUSHINDIRECT:
          addWmfObject(objects, {
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
        case META.ROUNDRECT: {
          if (record.sizeBytes < 18) break;
          const left = i16(bytes, p + 10), top = i16(bytes, p + 8), right = i16(bytes, p + 6), bottom = i16(bytes, p + 4);
          addBoundsPoint(bounds, left, top); addBoundsPoint(bounds, right, bottom);
          drawRoundRect(left, top, right, bottom, i16(bytes, p + 2), i16(bytes, p), state, elements, false);
          break;
        }
        case META.ARC:
        case META.CHORD:
        case META.PIE: {
          if (record.sizeBytes < 22) break;
          const left = i16(bytes, p + 14), top = i16(bytes, p + 12), right = i16(bytes, p + 10), bottom = i16(bytes, p + 8);
          addBoundsPoint(bounds, left, top); addBoundsPoint(bounds, right, bottom);
          drawArc(record.type === META.ARC ? EMR.ARC : record.type === META.CHORD ? EMR.CHORD : EMR.PIE, left, top, right, bottom, i16(bytes, p + 6), i16(bytes, p + 4), i16(bytes, p + 2), i16(bytes, p), state, elements, false);
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

    let mirroredElements = elements;
    if (mirrorVertically)
      mirroredElements = mirrorElementsVertically(mirroredElements, viewBox);
    resolveClipViewport(defs, viewBox, clipExpansion);
    return svgDocument(viewBox, mirroredElements, defs);
  }
}

const PlaceableWmfKey = 0x9ac6cdd7;

const EMR = {
  OFFSETCLIPRGN: 0x001a,
  SETMETARGN: 0x001c,
  EXTSELECTCLIPRGN: 0x004b,
  EXCLUDECLIPRECT: 0x001d,
  INTERSECTCLIPRECT: 0x001e,
  SETMITERLIMIT: 0x003a,
  SETARCDIRECTION: 0x0039,
  HEADER: 0x0001,
  EOF: 0x000e,
  GDICOMMENT: 0x0046,
  SETWINDOWEXTEX: 0x0009,
  SETWINDOWORGEX: 0x000a,
  SETVIEWPORTEXTEX: 0x000b,
  SETVIEWPORTORGEX: 0x000c,
  SETMAPMODE: 0x0011,
  SETBRUSHORGEX: 0x000d,
  SETBKMODE: 0x0012,
  SETBKCOLOR: 0x0019,
  SETPIXELV: 0x000f,
  FILLRGN: 0x0047,
  PAINTRGN: 0x004a,
  SCALEVIEWPORTEXTEX: 0x001f,
  SCALEWINDOWEXTEX: 0x0020,
  SETPOLYFILLMODE: 0x0013,
  SETTEXTCOLOR: 0x0018,
  SAVEDC: 0x0021,
  RESTOREDC: 0x0022,
  SETWORLDTRANSFORM: 0x0023,
  MODIFYWORLDTRANSFORM: 0x0024,
  BEGINPATH: 0x003b,
  ENDPATH: 0x003c,
  ABORTPATH: 0x0044,
  CLOSEFIGURE: 0x003d,
  FILLPATH: 0x003e,
  STROKEANDFILLPATH: 0x003f,
  STROKEPATH: 0x0040,
  SELECTCLIPPATH: 0x0043,
  MOVETOEX: 0x001b,
  LINETO: 0x0036,
  POLYLINETO: 0x0006,
  POLYBEZIER: 0x0002,
  POLYBEZIERTO: 0x0005,
  POLYBEZIER16: 0x0055,
  POLYBEZIERTO16: 0x0058,
  POLYLINETO16: 0x0059,
  POLYDRAW16: 0x005c,
  POLYDRAW: 0x0038,
  SELECTOBJECT: 0x0025,
  CREATEPEN: 0x0026,
  CREATEBRUSHINDIRECT: 0x0027,
  DELETEOBJECT: 0x0028,
  RECTANGLE: 0x002b,
  ANGLEARC: 0x0029,
  ROUNDRECT: 0x002c,
  ARC: 0x002d,
  CHORD: 0x002e,
  PIE: 0x002f,
  ARCTO: 0x0037,
  ELLIPSE: 0x002a,
  POLYGON16: 0x0056,
  POLYGON: 0x0003,
  POLYLINE: 0x0004,
  POLYLINE16: 0x0057,
  POLYPOLYLINE16: 0x005a,
  POLYPOLYGON16: 0x005b,
  POLYPOLYLINE: 0x0007,
  POLYPOLYGON: 0x0008,
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
  OFFSETCLIPRGN: 0x0220,
  EXCLUDECLIPRECT: 0x0415,
  INTERSECTCLIPRECT: 0x0416,
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
  ROUNDRECT: 0x061c,
  ARC: 0x0817,
  CHORD: 0x0830,
  PIE: 0x081a,
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

function addWmfObject(objects: Array<MetafileObject | null>, object: MetafileObject): void {
  const deletedIndex = objects.findIndex(existing => existing == null);
  if (deletedIndex >= 0)
    objects[deletedIndex] = object;
  else
    objects.push(object);
}

function createInitialState(): DrawState {
  return {
    cosmeticPhase: 0,
    backgroundMode: 2,
    backgroundColor: '#ffffff',
    brushOrgX: 0,
    brushOrgY: 0,
    mapMode: 1,
    isotropicDirty: false,
    pen: { kind: 'pen', color: '#000000', width: 1, none: false },
    brush: { kind: 'brush', color: 'none', none: true },
    font: { kind: 'font', family: 'Arial', height: 12, weight: 400, italic: false },
    textColor: '#000000',
    currentX: 0,
    currentY: 0,
    logicalCurrentX: 0,
    logicalCurrentY: 0,
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
    clockwiseShapes: false,
    pathFigureClosed: false,
    miterLimit: 10,
  };
}

function cloneState(state: DrawState): DrawState {
  return {
    ...state,
    activeClipId: state.activeClipId,
    activeMaskId: state.activeMaskId,
    metaMaskId: state.metaMaskId,
    pen: { ...state.pen },
    brush: { ...state.brush },
    font: { ...state.font },
    worldTransform: { ...state.worldTransform },
    currentPath: state.currentPath ? cloneMetafilePath(state.currentPath) : undefined,
    selectedPath: state.selectedPath ? cloneMetafilePath(state.selectedPath) : undefined,
  };
}

function restoreRelativeState(target: DrawState, saved: DrawState[], relative: number): void {
  // EMF permits negative relative levels only. Invalid requests leave the stack intact.
  const count = -relative;
  if (relative >= 0 || count > saved.length) return;
  const index = saved.length - count;
  restoreState(target, saved[index]);
  saved.length = index;
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
  if (record.size < 60)
    return null;
  // EmrText begins at byte 36; Bounds is ignored by this record type.
  const x = i32(bytes, record.offset + 36), y = i32(bytes, record.offset + 40);
  const charCount = u32(bytes, record.offset + 44), stringOffset = u32(bytes, record.offset + 48);
  const options = u32(bytes, record.offset + 52), fixedSize = (options & 0x100) !== 0 ? 60 : 76;
  // Font-specific glyph indices are not Unicode text.
  if ((options & 0x10) !== 0 || charCount === 0 || stringOffset < fixedSize || stringOffset % 2 !== 0 ||
    stringOffset > record.size || charCount > Math.floor((record.size - stringOffset) / 2))
    return null;

  const stringStart = record.offset + stringOffset;
  const stringEnd = stringStart + charCount * 2;
  if (stringEnd > record.offset + record.size || stringEnd > bytes.length)
    return null;

  let text = '';
  for (let current = stringStart; current + 1 < stringEnd; current += 2)
    text += String.fromCharCode(u16(bytes, current));
  text = text.replace(/\0+$/u, '');
  if (!text.length) return null;
  const point = transformPoint(state, x, y);
  const fontSize = Math.abs(state.font.height) || 12;
  const weight = state.font.weight >= 600 ? ' font-weight="bold"' : '';
  const italic = state.font.italic ? ' font-style="italic"' : '';
  return `<text x="${point[0]}" y="${point[1]}" fill="${state.textColor}" font-family="${xmlEscape(state.font.family)}" font-size="${fontSize}"${weight}${italic}${clipAttr(state)}>${xmlEscape(text)}</text>`;
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

function readEmfPointArray32(bytes: Uint8Array, record: EmfRecord, shortPoints = false): Array<[number, number]> {
  const points: Array<[number, number]> = [];
  if (record.size < 28) return points;
  const count = u32(bytes, record.offset + 24);
  const pointSize = shortPoints ? 4 : 8;
  if (count > Math.floor((record.size - 28) / pointSize)) return points;
  for (let index = 0; index < count; index++) {
    const offset = record.offset + 28 + index * pointSize;
    points.push(shortPoints ? [i16(bytes, offset), i16(bytes, offset + 2)] : [i32(bytes, offset), i32(bytes, offset + 4)]);
  }
  return points;
}

function readEmfCompoundPoints(bytes: Uint8Array, record: EmfRecord, shortPoints: boolean): Array<Array<[number, number]>> {
  const polygons: Array<Array<[number, number]>> = [];
  if (record.size < 32) return polygons;
  const figureCount = u32(bytes, record.offset + 24);
  const totalPoints = u32(bytes, record.offset + 28);
  if (figureCount > Math.floor((record.size - 32) / 4)) return polygons;
  const countsOffset = record.offset + 32;
  const pointsOffset = countsOffset + figureCount * 4;
  const pointSize = shortPoints ? 4 : 8;
  if (totalPoints > Math.floor((record.offset + record.size - pointsOffset) / pointSize)) return polygons;
  let consumed = 0;
  for (let figure = 0; figure < figureCount; figure++) {
    const count = u32(bytes, countsOffset + figure * 4);
    if (count < 2 || count > totalPoints - consumed) return polygons;
    consumed += count;
  }
  let pointIndex = 0;
  for (let polygonIndex = 0; polygonIndex < figureCount; polygonIndex++) {
    const count = u32(bytes, countsOffset + polygonIndex * 4);
    const points: Array<[number, number]> = [];
    for (let index = 0; index < count; index++, pointIndex++) {
      const offset = pointsOffset + pointIndex * pointSize;
      points.push(shortPoints ? [i16(bytes, offset), i16(bytes, offset + 2)] : [i32(bytes, offset), i32(bytes, offset + 4)]);
    }
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
  // IDENTITY ignores Xform; native GDI rejects singular SET/multipliers.
  if (mode !== ModifyWorldTransformIdentity && isSingularTransform(next)) return current;
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
      return current;
  }
}

function isSingularTransform(value: Transform): boolean {
  return value.m11 * value.m22 - value.m12 * value.m21 === 0;
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
  // GDI maps world to page space first, then page to device space.
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

function emfMappingDevice(bytes: Uint8Array): [number, number, number, number] {
  // No reference-device metrics: deterministic 96-DPI approximation, not host settings.
  if (bytes.length >= 88 && u32(bytes, 4) >= 88 && u32(bytes, 4) <= bytes.length) {
    const x = i32(bytes, 72), y = i32(bytes, 76), mmX = i32(bytes, 80), mmY = i32(bytes, 84);
    if (x > 0 && y > 0 && mmX > 0 && mmY > 0 && mmX <= Math.floor(0x7fffffff / 100) && mmY <= Math.floor(0x7fffffff / 100))
      return [x, y, mmX, mmY];
  }
  return [960, 960, 254, 254];
}

function setEmfMapMode(state: DrawState, mode: number, device: [number, number, number, number]): void {
  if (mode < 1 || mode > 8) return;
  if (mode === 8) { state.mapMode = mode; state.isotropicDirty = false; return; }
  if (mode === 7 && state.mapMode === 7) return;
  state.mapMode = mode;
  state.isotropicDirty = mode === 7;
  if (mode === 1) {
    state.windowExtX = state.windowExtY = state.viewportExtX = state.viewportExtY = 1;
    return;
  }
  const unitsPerMillimeter = mode === 3 ? 100 : mode === 4 ? 1000 / 254 : mode === 5 ? 10000 / 254 : mode === 6 ? 14400 / 254 : 10;
  state.windowExtX = Math.round(device[2] * unitsPerMillimeter);
  state.windowExtY = Math.round(device[3] * unitsPerMillimeter);
  state.viewportExtX = device[0]; state.viewportExtY = -device[1];
}

function setEmfExtents(state: DrawState, x: number, y: number, viewport: boolean): void {
  if (state.mapMode < 7 || x === 0 || y === 0) return;
  if (viewport ? state.viewportExtX === x && state.viewportExtY === y : state.windowExtX === x && state.windowExtY === y) return;
  if (viewport) { state.viewportExtX = x; state.viewportExtY = y; }
  else { state.windowExtX = x; state.windowExtY = y; }
  state.isotropicDirty = state.mapMode === 7;
}

const EMF_MAPPING_RECORDS = new Set<number>([
  EMR.SETPIXELV, EMR.LINETO, EMR.POLYLINETO, EMR.POLYLINETO16, EMR.POLYBEZIER, EMR.POLYBEZIER16,
  EMR.POLYBEZIERTO, EMR.POLYBEZIERTO16, EMR.POLYDRAW, EMR.POLYDRAW16,
  EMR.RECTANGLE, EMR.ELLIPSE, EMR.ROUNDRECT, EMR.ANGLEARC, EMR.ARC, EMR.CHORD, EMR.PIE, EMR.ARCTO,
  EMR.POLYGON, EMR.POLYGON16, EMR.POLYLINE, EMR.POLYLINE16,
  EMR.POLYPOLYGON, EMR.POLYPOLYGON16, EMR.POLYPOLYLINE, EMR.POLYPOLYLINE16,
  EMR.FILLPATH, EMR.STROKEPATH, EMR.STROKEANDFILLPATH, EMR.EXTTEXTOUTW, EMR.STRETCHDIBITS,
  EMR.INTERSECTCLIPRECT, EMR.EXCLUDECLIPRECT, EMR.OFFSETCLIPRGN,
]);

function prepareEmfMapping(state: DrawState): void {
  // MoveTo, path brackets, Save/Restore and later setters retain requested extents.
  if (state.mapMode !== 7 || !state.isotropicDirty) return;
  adjustIsotropicExtents(state);
  state.isotropicDirty = false;
}

function adjustIsotropicExtents(state: DrawState): void {
  const xScale = nativeAbsoluteExtent(state.viewportExtX) / nativeAbsoluteExtent(state.windowExtX), yScale = nativeAbsoluteExtent(state.viewportExtY) / nativeAbsoluteExtent(state.windowExtY);
  if (xScale > yScale)
    state.viewportExtX = roundedIsotropicExtent(state.viewportExtX, nativeAbsoluteExtent(state.windowExtX) * yScale);
  else if (yScale > xScale)
    state.viewportExtY = roundedIsotropicExtent(state.viewportExtY, nativeAbsoluteExtent(state.windowExtY) * xScale);
}

function nativeAbsoluteExtent(value: number): number { return value === -2147483648 ? value : Math.abs(value); }
function roundedIsotropicExtent(original: number, value: number): number {
  return Math.imul(Math.sign(original), (Math.sign(value) * Math.round(Math.abs(value))) | 0);
}

function scaleEmfExtents(state: DrawState, xn: number, xd: number, yn: number, yd: number, viewport: boolean): void {
  if (state.mapMode < 7) return;
  const x = scaleExtent(viewport ? state.viewportExtX : state.windowExtX, xn, xd);
  const y = scaleExtent(viewport ? state.viewportExtY : state.windowExtY, yn, yd);
  if (x === undefined || y === undefined) return;
  setEmfExtents(state, x, y, viewport);
  state.isotropicDirty = state.mapMode === 7;
}

function scaleExtent(extent: number, numerator: number, denominator: number): number | undefined {
  if (denominator === 0) return undefined;
  // Native GDI wraps the signed product before truncating division.
  const value = Math.trunc(Math.imul(extent, numerator) / denominator);
  return value === 0 || value < -2147483648 || value > 2147483647 ? undefined : value;
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

function readGeometricDashes(bytes: Uint8Array, record: EmfRecord, style: number, width: number, state: DrawState): number[] | null | undefined {
  const lineStyle = style & 0xf, count = u32(bytes, record.offset + 48);
  if (lineStyle > 7 || (lineStyle !== 7 && count !== 0)) return null;
  if (lineStyle >= 1 && lineStyle <= 4) {
    // Geometric standard patterns use pen widths, unlike cosmetic pens.
    const units = lineStyle === 1 ? [3, 1] : lineStyle === 2 ? [1, 1] : lineStyle === 3 ? [3, 1, 1, 1] : [3, 1, 1, 1, 1, 1];
    // GDI includes projecting caps in nominal dash lengths; SVG adds them.
    const projectingCaps = (style & 0xf00) === 0 || (style & 0xf00) === 0x100;
    return units.map((unit, index) => (unit + (projectingCaps ? (index % 2 === 0 ? -1 : 1) : 0)) * width);
  }
  if (lineStyle !== 7) return undefined;
  if (count === 0 || count > 16 || count > (record.size - 52) / 4) return null;
  const entries: number[] = [];
  let total = 0;
  const scale = Math.abs(state.viewportExtX / (state.windowExtX || 1));
  for (let index = 0; index < count; index++) {
    const entry = u32(bytes, record.offset + 52 + index * 4);
    total += entry;
    entries.push(entry * (scale || 1));
  }
  // Native signed-32-bit cycle limit; an all-zero cycle is invalid.
  if (total === 0 || total > 2147483647) return null;
  // Odd-count arrays reverse ink/gap roles in both SVG and native GDI.
  return entries;
}

function cosmeticPattern(style: number): number[] | undefined {
  return style === 1 ? [18, 6] : style === 2 ? [3, 3] : style === 3 ? [9, 6, 3, 6] : style === 4 ? [9, 3, 3, 3, 3, 3] : undefined;
}

function readCosmeticDashes(bytes: Uint8Array, record: EmfRecord, style: number): number[] | null | undefined {
  const lineStyle = style & 0xf, count = u32(bytes, record.offset + 48);
  if (lineStyle !== 7) return count === 0 ? lineStyle === 8 ? [1, 1] : cosmeticPattern(lineStyle) : null;
  if (count === 0 || count > 16 || count > (record.size - 52) / 4) return null;
  const dashes: number[] = []; let total = 0;
  for (let index = 0; index < count; index++) {
    const value = u32(bytes, record.offset + 52 + index * 4);
    if (value === 0) return null;
    total += value;
    dashes.push(value * 3); // Three device pixels per cosmetic style unit.
  }
  return total <= 0x3fff ? dashes : null;
}

function applyCosmeticGapBackground(elements: string[], firstElement: number, state: DrawState): void {
  // SetBkMode affects CreatePen gaps, never ExtCreatePen gaps.
  if (!state.pen.cosmeticDashes || !state.pen.opaqueDashGaps || state.backgroundMode !== 2) return;
  const stroke = strokeAttrs(state);
  for (let index = firstElement; index < elements.length; index++) {
    const element = elements[index];
    if (!element.includes(stroke)) continue;
    const outline = element.replace(/ fill="[^"]*"/u, ' fill="none"');
    const fill = element.replace(stroke, 'stroke="none"');
    const background = outline.replace(stroke, `stroke="${state.backgroundColor}" stroke-width="1" shape-rendering="crispEdges"`);
    elements[index] = `<g>${fill}${background}${outline}</g>`;
  }
}

function resetPathConstruction(state: DrawState): void {
  state.pathFigureClosed = false;
  state.currentPath = undefined;
  state.pathStartX = state.pathStartY = state.pathEndX = state.pathEndY = undefined;
}

function ensurePathPosition(state: DrawState): void {
  if (state.currentPath !== undefined && (state.pathFigureClosed || state.pathEndX !== state.currentX || state.pathEndY !== state.currentY)) {
    appendNativePoint(state.currentPath,'M',[state.currentX,state.currentY],state);
    state.pathStartX = state.currentX; state.pathStartY = state.currentY;
    state.pathFigureClosed = false;
  }
}

function drawEmfPointCurve(bytes: Uint8Array, record: EmfRecord, state: DrawState, elements: string[]): void {
  const line = record.type === EMR.POLYLINETO || record.type === EMR.POLYLINETO16;
  const to = line || record.type === EMR.POLYBEZIERTO || record.type === EMR.POLYBEZIERTO16;
  const shortPoints = record.type === EMR.POLYLINETO16 || record.type === EMR.POLYBEZIER16 || record.type === EMR.POLYBEZIERTO16;
  const logical = readEmfPointArray32(bytes, record, shortPoints);
  const points = logical.map(([x, y]) => transformPoint(state, x, y));
  if (line ? points.length < 1 : to ? points.length < 3 || points.length % 3 !== 0 : points.length < 4 || (points.length - 1) % 3 !== 0) return;
  const path = state.currentPath ?? [];
  if (to) {
    if (state.currentPath === undefined) appendNativePoint(path,'M',[state.currentX,state.currentY],state);
    else ensurePathPosition(state);
  } else {
    appendNativePoint(path,'M',points[0],state);
    if (state.currentPath !== undefined) { state.pathStartX = points[0][0]; state.pathStartY = points[0][1]; state.pathFigureClosed = false; }
  }
  for (let index = to ? 0 : 1; index < points.length; index += line ? 1 : 3) {
    if (line) appendNativePoint(path,'L',points[index],state);
    else appendNativeCubic(path,points[index],points[index+1],points[index+2]);
  }
  const end = points.at(-1)!;
  if (to) { state.currentX = end[0]; state.currentY = end[1]; [state.logicalCurrentX, state.logicalCurrentY] = logical.at(-1)!; }
  if (state.currentPath !== undefined) { state.pathEndX = end[0]; state.pathEndY = end[1]; }
  else elements.push(pathElement(path, state, 'stroke', to));
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
    state.pathEndX = x3;
    state.pathEndY = y3;
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

function drawEmfPolyDraw(state: DrawState, bytes: Uint8Array, record: EmfRecord, elements: string[]): void {
  if (record.size < 28) return;
  const count = u32(bytes, record.offset + 24), shortPoints = record.type === EMR.POLYDRAW16, pointSize = shortPoints ? 4 : 8;
  if (count === 0 || count > Math.floor((record.size - 28) / (pointSize + 1))) return;
  const typesOffset = record.offset + 28 + count * pointSize;
  for (let index = 0; index < count; index++) {
    const type = bytes[typesOffset + index];
    if (type === 6 || type === 2 || type === 3) continue;
    if (type !== 4 || index + 2 >= count || bytes[typesOffset + index + 1] !== 4 ||
        (bytes[typesOffset + index + 2] !== 4 && bytes[typesOffset + index + 2] !== 5)) return;
    index += 2;
  }
  const logical = readEmfPointArray32(bytes, record, shortPoints);
  const mapped = logical.map(([x, y]) => transformPoint(state, x, y));
  const path = state.currentPath ?? [];
  if (bytes[typesOffset] !== 6) {
    if (state.currentPath !== undefined) ensurePathPosition(state);
    else { appendNativePoint(path,'M',[state.currentX,state.currentY],state); state.pathStartX = state.currentX; state.pathStartY = state.currentY; state.pathFigureClosed = false; }
  }
  for (let index = 0; index < mapped.length; index++) {
    const type = bytes[typesOffset + index] & ~1;
    if (type !== 6 && state.pathFigureClosed) {
      appendNativePoint(path,'M',[state.currentX,state.currentY],state);
      state.pathStartX = state.currentX; state.pathStartY = state.currentY;
      state.pathFigureClosed = false;
    }
    if (type === 6) {
      state.pathFigureClosed = false;
      appendNativePoint(path,'M',mapped[index],state);
      state.pathStartX = mapped[index][0];
      state.pathStartY = mapped[index][1];
    } else if (type === 2) appendNativePoint(path,'L',mapped[index],state);
    else {
      appendNativeCubic(path,mapped[index],mapped[index+1],mapped[index+2]);
      index += 2;
    }
    state.currentX = state.pathEndX = mapped[index][0]; state.currentY = state.pathEndY = mapped[index][1];
    [state.logicalCurrentX, state.logicalCurrentY] = logical[index];
    if ((bytes[typesOffset + index] & 1) !== 0) {
      path.push('Z');
      // Native Windows GDI retains the supplied endpoint as the DC position.
      state.pathFigureClosed = true;
      state.pathEndX = state.pathStartX; state.pathEndY = state.pathStartY;
    }
  }
  if (state.currentPath === undefined) elements.push(pathElement(path, state, 'stroke', bytes[typesOffset] !== PolyDrawTypeMoveTo));
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

function readEmfClipRegion(bytes: Uint8Array, record: EmfRecord, regionBytes: number): string | undefined {
  const rectangles = readEmfRegionRectangles(bytes, record, regionBytes, 16);
  return rectangles === undefined ? undefined : emfRegionGeometry(rectangles);
}

function readEmfRegionRectangles(bytes: Uint8Array, record: EmfRecord, regionBytes: number, regionOffset: number): [number, number, number, number][] | undefined {
  if (regionBytes < 32 || regionBytes > record.size - regionOffset) return undefined;
  const at = record.offset + regionOffset;
  if (u32(bytes, at) !== 32 || u32(bytes, at + 4) !== 1) return undefined;
  const count = u32(bytes, at + 8);
  if (count > Math.floor((regionBytes - 32) / 16)) return undefined;
  const rectangleBytes = count * 16, declaredBytes = u32(bytes, at + 12);
  if (declaredBytes !== 0 && declaredBytes !== rectangleBytes) return undefined;
  const rectangles: [number, number, number, number][] = [];
  for (let index = 0; index < count; index++) {
    const p = at + 32 + index * 16;
    const left = i32(bytes, p), top = i32(bytes, p + 4), right = i32(bytes, p + 8), bottom = i32(bytes, p + 12);
    if (left > right || top > bottom) return undefined;
    if (left === right || top === bottom) continue;
    rectangles.push([left, top, right, bottom]);
  }
  return rectangles;
}

function emfRegionGeometry(rectangles: [number, number, number, number][], state?: DrawState): string | undefined {
  const path: string[] = [];
  for (const [left, top, right, bottom] of rectangles) {
    let points: [number, number][] = [[left, top], [right, top], [right, bottom], [left, bottom]];
    if (state) points = points.map(([x, y]) => transformPoint(state, x, y));
    if (points.some(([x, y]) => !Number.isFinite(x) || !Number.isFinite(y))) return undefined;
    const p = points.map(point => point.map(value => Number(value.toFixed(3))).join(' '));
    // Clip records contain device rectangles; FillRgn contains logical rectangles.
    path.push(`M ${p[0]} L ${p[1]} L ${p[2]} L ${p[3]} Z`);
  }
  return `d="${path.join(' ')}" fill-rule="nonzero" clip-rule="nonzero"`;
}

function selectPathClip(state: DrawState, mode: number, viewBox: ViewBox, defs: string[], sequence: number): void {
  const geometry = `d="${state.selectedPath!.join(' ')}" fill-rule="${state.fillRule}" clip-rule="${state.fillRule}"`;
  combineClipGeometry(state, geometry, mode, viewBox, defs, sequence);
}

function combineRectClip(x1: number, y1: number, x2: number, y2: number, mode: number, state: DrawState, viewBox: ViewBox | undefined, defs: string[], sequence: number, transformPoints: boolean): void {
  const left = Math.min(x1, x2), right = Math.max(x1, x2), top = Math.min(y1, y2), bottom = Math.max(y1, y2);
  const point = (x: number, y: number) => (transformPoints ? transformPoint(state, x, y) : [x, y]).map(v => Number(v.toFixed(3))).join(' ');
  const path = left === right || top === bottom ? '' : `M ${point(left, top)} L ${point(right, top)} L ${point(right, bottom)} L ${point(left, bottom)} Z`;
  combineClipGeometry(state, `d="${path}" fill-rule="nonzero" clip-rule="nonzero"`, mode, viewBox, defs, sequence);
}

function clipViewportAttrs(viewBox: ViewBox): string {
  const n = (value: number) => Number(value.toFixed(3));
  return `x="${n(viewBox.x)}" y="${n(viewBox.y)}" width="${n(viewBox.width)}" height="${n(viewBox.height)}"`;
}

function resolveClipViewport(defs: string[], viewBox: ViewBox, expansion: { x: number; y: number }): void {
  // Absolute sums cover nonchronological Save/Restore offset chains as well.
  const domain = { x: viewBox.x - expansion.x, y: viewBox.y - expansion.y, width: viewBox.width + 2 * expansion.x, height: viewBox.height + 2 * expansion.y };
  for (let index = 0; index < defs.length; index++)
    defs[index] = defs[index].split(CLIP_VIEWPORT_TOKEN).join(clipViewportAttrs(domain)).split(DEFAULT_CLIP_VIEWPORT_TOKEN).join(clipViewportAttrs(viewBox));
}

function setMetaRegion(state: DrawState, defs: string[], sequence: number): number {
  // A null selected clip imposes no extra constraint on the metaregion.
  if (!state.activeClipId && !state.activeMaskId) return sequence;
  const id = `mask${++sequence}`;
  let selected = `<rect ${CLIP_VIEWPORT_TOKEN} fill="#ffffff"${clipAttr(state)} />`;
  if (state.metaMaskId) selected = `<g mask="url(#${state.metaMaskId})">${selected}</g>`;
  defs.push(`<mask id="${id}" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse" ${CLIP_VIEWPORT_TOKEN}>${selected}</mask>`);
  state.metaMaskId = id;
  state.activeClipId = undefined;
  state.activeMaskId = undefined;
  return sequence;
}

function offsetSelectedClip(dx: number, dy: number, state: DrawState, defs: string[], sequence: number, expansion: { x: number; y: number }): number {
  if ((!state.activeClipId && !state.activeMaskId) || (dx === 0 && dy === 0) || !Number.isFinite(dx) || !Number.isFinite(dy)) return sequence;
  expansion.x += Math.abs(dx); expansion.y += Math.abs(dy);
  const id = `mask${++sequence}`, n = (value: number) => Number(value.toFixed(3));
  defs.push(`<mask id="${id}" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse" ${CLIP_VIEWPORT_TOKEN}><g transform="translate(${n(dx)} ${n(dy)})"><rect ${CLIP_VIEWPORT_TOKEN} fill="#ffffff"${clipAttr(state)} /></g></mask>`);
  state.activeClipId = undefined; state.activeMaskId = id;
  return sequence;
}

function combineClipGeometry(state: DrawState, geometry: string, mode: number, viewBox: ViewBox | undefined, defs: string[], sequence: number): void {
  if (mode === 5 || (mode === 1 && !state.activeClipId && !state.activeMaskId)) {
    const id = `clip${sequence}`;
    defs.push(`<clipPath id="${id}"><path ${geometry} /></clipPath>`);
    state.activeClipId = id;
    state.activeMaskId = undefined;
    return;
  }
  // Resource bounds expand for offsets; captured default regions do not.
  const old = clipAttr(state);
  const rect = CLIP_VIEWPORT_TOKEN;
  const previous = `<rect ${old ? rect : DEFAULT_CLIP_VIEWPORT_TOKEN} fill="#ffffff"${old} />`;
  const include = `<path ${geometry} fill="#ffffff" />`;
  const exclude = `<path ${geometry} fill="#000000" />`;
  const content = mode === 1 ? `<g${old}>${include}</g>`
    : mode === 2 ? previous + include
    : mode === 3 ? previous + include + `<path ${geometry} fill="#000000"${old} />`
    : previous + exclude;
  const id = `mask${sequence}`;
  defs.push(`<mask id="${id}" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse" ${rect}>${content}</mask>`);
  state.activeClipId = undefined;
  state.activeMaskId = id;
}

function lineElement(x1: number, y1: number, x2: number, y2: number, state: DrawState): string {
  if (state.pen.cosmeticDashes) {
    const pixels = cosmeticPixelLine(x1, y1, x2, y2, state);
    if (pixels !== undefined) return pixels;
  }
  if (!state.pen.none && state.styledPen !== penIdentity(state.pen)) { state.styledPen=penIdentity(state.pen); state.cosmeticPhase=0; }
  const n = (value: number) => Number(value.toFixed(3));
  const major = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
  const pathLength = state.pen.cosmeticDashes && major > 0 ? ` pathLength="${n(major)}"` : '';
  return `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}"${pathLength} ${strokeAttrs(state)} fill="none"${clipAttr(state)} />`;
}

function cosmeticPixelLine(x1: number, y1: number, x2: number, y2: number, state: DrawState): string | undefined {
  if (![x1, y1, x2, y2].every(Number.isFinite)) return undefined;
  let x = Math.floor(x1 + .5), y = Math.floor(y1 + .5);
  const endX = Math.floor(x2 + .5), endY = Math.floor(y2 + .5);
  const dx = Math.abs(endX - x), dy = Math.abs(endY - y), count = Math.max(dx, dy);
  // Bound pixel-path allocation for hostile coordinates. Longer lines keep
  // the SVG outline approximation, normalized to major-axis style units.
  if (count > 262144) return undefined;
  const foreground: string[] = [], background: string[] = [];
  const dashes = state.pen.dashArray!;
  if (state.styledPen !== penIdentity(state.pen)) { state.styledPen=penIdentity(state.pen); state.cosmeticPhase=0; }
  const cycle=dashes.reduce((a,b)=>a+b,0)*(dashes.length%2===0?1:2);
  let phase=state.cosmeticPhase%cycle, dash=0, ink=true;
  while(phase>=dashes[dash]){phase-=dashes[dash];dash=(dash+1)%dashes.length;ink=!ink;}
  let remaining = dashes[dash]-phase, error = dx - dy;
  const sx = x < endX ? 1 : -1, sy = y < endY ? 1 : -1;
  for (let step = 0; step < count; step++) {
    if (ink || state.pen.opaqueDashGaps && state.backgroundMode === 2)
      (ink ? foreground : background).push(`M ${x} ${y}h1v1h-1Z`);
    if (--remaining === 0) { dash = (dash + 1) % dashes.length; remaining = dashes[dash]; ink = !ink; }
    const twice = error * 2;
    // GDI ties favor upper/left device pixels, including reverse traversal.
    if (twice > -dy || twice === -dy && sx < 0) { error -= dy; x += sx; }
    if (twice < dx || twice === dx && sy < 0) { error += dx; y += sy; }
  }
  const paint = (path: string[], color: string) => path.length ? `<path d="${path.join(' ')}" stroke="none" fill="${color}"${clipAttr(state)} />` : '';
  state.cosmeticPhase=(state.cosmeticPhase+count)%cycle;
  return `<g>${paint(background, state.backgroundColor)}${paint(foreground, state.pen.color)}</g>`;
}

function penIdentity(pen: PenObject): object { return pen.identity ??= {}; }

// Keep native Bezier controls separate from generated SVG arc approximations.
const nativeCubics = new WeakMap<string[],Map<number,number[]>>();
const nativePoints = new WeakMap<string[],Map<number,CosmeticPoint>>();
function cloneMetafilePath(path: string[]): string[] {
  const copy:string[]=[];appendMetafilePath(copy,path);
  return copy;
}
function appendMetafilePath(target: string[],path: string[]): void {
  const cubics=nativeCubics.get(path),points=nativePoints.get(path),offset=target.length;
  if(cubics){let metadata=nativeCubics.get(target);if(!metadata){metadata=new Map();nativeCubics.set(target,metadata);}for(const [index,value] of cubics)metadata.set(offset+index,value);}
  if(points){let metadata=nativePoints.get(target);if(!metadata){metadata=new Map();nativePoints.set(target,metadata);}for(const [index,value] of points)metadata.set(offset+index,value);}
  for(const command of path)target.push(command);
}
function appendNativePoint(path: string[],command: string,point: CosmeticPoint,state: DrawState): void {
  const t=state.worldTransform;
  if(t.m11!==1||t.m12!==0||t.m21!==0||t.m22!==1||t.dx!==0||t.dy!==0){
    // Match GDI's separately quantized linear component and translation; never
    // recover fixed-point coordinates from rounded SVG display strings.
    const fixed=(value:number)=>Math.sign(value)*Math.floor(Math.abs(value)*16+.5)/16;
    const ox=state.viewportOrgX+(t.dx-state.windowOrgX)*state.viewportExtX/(state.windowExtX===0?1:state.windowExtX);
    const oy=state.viewportOrgY+(t.dy-state.windowOrgY)*state.viewportExtY/(state.windowExtY===0?1:state.windowExtY);
    let metadata=nativePoints.get(path);if(!metadata){metadata=new Map();nativePoints.set(path,metadata);}
    metadata.set(path.length,[fixed(point[0]-ox)+fixed(ox),fixed(point[1]-oy)+fixed(oy)]);
  }
  path.push(`${command} ${point[0]} ${point[1]}`);
}
function appendNativeCubic(path: string[], a: [number,number], b: [number,number], c: [number,number]): void {
  let metadata=nativeCubics.get(path);if(!metadata){metadata=new Map();nativeCubics.set(path,metadata);}
  metadata.set(path.length,[...a,...b,...c]);
  path.push(`C ${a[0]} ${a[1]} ${b[0]} ${b[1]} ${c[0]} ${c[1]}`);
}
type CosmeticPoint = [number,number];
function flattenCosmeticCubic(a: CosmeticPoint,b: CosmeticPoint,c: CosmeticPoint,d: CosmeticPoint,result: CosmeticPoint[],depth: number): boolean {
  // Preserve native 27.4 endpoints; whole-pixel flattening changes dash phase.
  const error=Math.max(Math.abs(6*(a[0]-2*b[0]+c[0])),Math.abs(6*(b[0]-2*c[0]+d[0])),Math.abs(6*(a[1]-2*b[1]+c[1])),Math.abs(6*(b[1]-2*c[1]+d[1])));
  if(!Number.isFinite(error)||result.length>=65536)return false;
  if(error<=4){result.push([Math.floor(d[0]*16+.5)/16,Math.floor(d[1]*16+.5)/16]);return true;}
  if(depth>=20)return false;
  const mid=(p: CosmeticPoint,q: CosmeticPoint):CosmeticPoint=>[(p[0]+q[0])/2,(p[1]+q[1])/2];
  const ab=mid(a,b),bc=mid(b,c),cd=mid(c,d),abc=mid(ab,bc),bcd=mid(bc,cd),middle=mid(abc,bcd);
  return flattenCosmeticCubic(a,ab,abc,middle,result,depth+1)&&flattenCosmeticCubic(middle,bcd,cd,d,result,depth+1);
}
function cosmeticGiqSegment(start: CosmeticPoint,end: CosmeticPoint,state: DrawState,foreground: string[],background: string[],finalSegment: boolean,previous: CosmeticPoint|undefined): CosmeticPoint|undefined {
  const horizontal=Math.abs(end[0]-start[0])>=Math.abs(end[1]-start[1]);
  const a1=start[horizontal?0:1],a2=end[horizontal?0:1],b1=start[horizontal?1:0],b2=end[horizontal?1:0];
  if(a1===a2)return previous;
  const sign=a2>a1?1:-1,first=sign>0?Math.ceil(a1):Math.floor(a1),stop=sign>0?Math.ceil(a2):Math.floor(a2);
  const vertex:CosmeticPoint=[Math.ceil(start[0]-.5),Math.ceil(start[1]-.5)];
  const vx=Math.abs(vertex[0]-start[0]),vy=Math.abs(vertex[1]-start[1]),inside=vx+vy<.5||vx+vy===.5&&(vx===0||vy===0);
  const same=(a:CosmeticPoint|undefined,b:CosmeticPoint)=>a?.[0]===b[0]&&a[1]===b[1];
  const dashes=state.pen.dashArray!,cycle=dashes.reduce((a,b)=>a+b,0)*(dashes.length%2===0?1:2);
  let phase=state.cosmeticPhase%cycle,dash=0,ink=true;
  while(phase>=dashes[dash]){phase-=dashes[dash];dash=(dash+1)%dashes.length;ink=!ink;}
  let remaining=dashes[dash]-phase;
  const pixel=(point:CosmeticPoint)=>{
    const ex=Math.abs(point[0]-end[0]),ey=Math.abs(point[1]-end[1]);
    if(finalSegment&&(ex+ey<.5||ex+ey===.5&&(ex===0||ey===0)&&end[0]>=point[0]&&end[1]>=point[1]))return;
    if(inside&&same(previous,point))return;
    previous=point;
    if(ink||state.pen.opaqueDashGaps&&state.backgroundMode===2)(ink?foreground:background).push(`M ${point[0]} ${point[1]}h1v1h-1Z`);
    if(--remaining===0){dash=(dash+1)%dashes.length;remaining=dashes[dash];ink=!ink;}
    state.cosmeticPhase=(state.cosmeticPhase+1)%cycle;
  };
  const at=(major:number):CosmeticPoint=>{const minor=Math.ceil(b1+(major-a1)*(b2-b1)/(a2-a1)-.5);return horizontal?[major,minor]:[minor,major];};
  if(inside&&!same(previous,vertex)&&(first===stop||!same(at(first),vertex)))pixel(vertex);
  const lastAt=stop-sign,stepCount=Math.abs(stop-first);
  for(let step=0;step<stepCount;step++){
    const major=first+step*sign,point=at(major);
    if(major===lastAt&&Math.abs(b2-b1)===Math.abs(a2-a1)){
      // Half-open rotated diamond bounds distinguish exiting/parallel edges.
      const u=end[0]-point[0]+end[1]-point[1],v=end[0]-point[0]-end[1]+point[1];
      const du=end[0]-start[0]+end[1]-start[1],dv=end[0]-start[0]-end[1]+start[1];
      const exits=Math.abs(u)===.5&&u*du>0||Math.abs(v)===.5&&v*dv>0;
      if(u>-.5&&u<=.5&&v>=-.5&&v<.5&&!exits)continue;
    }
    pixel(point);
  }
  // Tiny cusps can leave/re-enter a pixel without an intervening grid crossing.
  if(previous){const ex=Math.abs(previous[0]-end[0]),ey=Math.abs(previous[1]-end[1]);if(ex+ey>.5||ex+ey===.5&&ex!==0&&ey!==0)previous=undefined;}
  return previous;
}

function cosmeticPixelPath(path: string[], state: DrawState, mode: 'stroke'|'fill'|'paint', continueStyle: boolean): string | undefined {
  const commands: Array<{type: string; x: number; y: number}> = [];
  const metadata=nativeCubics.get(path);
  let x=0,y=0,startX=0,startY=0,budget=0;
  for(let commandIndex=0;commandIndex<path.length;commandIndex++){
    const command=path[commandIndex];
    const values=command.split(' ').filter(Boolean);
    if(values[0]==='C'){
      const cubic=metadata?.get(commandIndex);
      // Fractional transformed controls retain atomic vector fallback, as in C#.
      if(!cubic||!cubic.every(Number.isInteger))return undefined;
      const points:CosmeticPoint[]=[];
      if(!flattenCosmeticCubic([x,y],[cubic[0],cubic[1]],[cubic[2],cubic[3]],[cubic[4],cubic[5]],points,0))return undefined;
      for(const [px,py] of points){budget+=Math.max(Math.abs(px-x),Math.abs(py-y))+2;commands.push({type:'F',x:px,y:py});x=px;y=py;}
      continue;
    }
    if(values.length===1&&values[0]==='Z'){commands.push({type:'Z',x:startX,y:startY});budget+=Math.max(Math.abs(startX-x),Math.abs(startY-y));x=startX;y=startY;continue;}
    if(values.length!==3||!['M','L'].includes(values[0]))return undefined;
    let px=Number(values[1]),py=Number(values[2]);if(!Number.isFinite(px)||!Number.isFinite(py))return undefined;
    if(metadata?.size&&(!Number.isInteger(px)||!Number.isInteger(py)))return undefined;
    const nativePoint=nativePoints.get(path)?.get(commandIndex);
    if(nativePoint){[px,py]=nativePoint;}else{px=Math.floor(px+.5);py=Math.floor(py+.5);}
    if(!Number.isFinite(px)||!Number.isFinite(py))return undefined;
    if(values[0]==='M'){startX=px;startY=py;}else budget+=Math.max(Math.abs(px-x),Math.abs(py-y))+2;
    if(budget>262144)return undefined;
    commands.push({type:values[0],x:px,y:py});x=px;y=py;
  }
  if(budget>262144||!commands.length||commands[0].type!=='M')return undefined;
  penIdentity(state.pen);
  const working=cloneState(state),foreground:string[]=[],background:string[]=[];let firstMove=true,previous:CosmeticPoint|undefined;
  if(working.styledPen!==penIdentity(working.pen)){working.styledPen=penIdentity(working.pen);working.cosmeticPhase=0;}
  for(let index=0;index<commands.length;index++){
    const command=commands[index];
    if(command.type==='M'){if(!firstMove||!continueStyle)working.cosmeticPhase=0;firstMove=false;previous=undefined;}
    else previous=cosmeticGiqSegment([x,y],[command.x,command.y],working,foreground,background,index+1===commands.length||commands[index+1].type==='M',previous);
    x=command.x;y=command.y;
  }
  state.cosmeticPhase=working.cosmeticPhase;state.styledPen=working.styledPen;
  const fill=mode==='stroke'?'':`<path d="${path.join(' ')}" stroke="none" ${fillAttrs(state)} ${fillRuleAttr(state)}${clipAttr(state)} />`;
  const paint=(pixels:string[],color:string)=>pixels.length?`<path d="${pixels.join(' ')}" stroke="none" fill="${color}"${clipAttr(state)} />`:'';
  // Native single-call strokes paint all gaps before foreground intersections.
  return `<g>${fill}${paint(background,state.backgroundColor)}${paint(foreground,state.pen.color)}</g>`;
}

function drawAngleArc(cx: number, cy: number, radius: number, startDegrees: number, sweepDegrees: number, state: DrawState, elements: string[]): void {
  // Bound hostile FLOAT expansion while retaining ordinary repeated path turns.
  if (!Number.isFinite(startDegrees) || !Number.isFinite(sweepDegrees) || Math.abs(sweepDegrees) > 4096 * 90) return;
  const angle = -(startDegrees % 360) * Math.PI / 180, sweep = -sweepDegrees * Math.PI / 180;
  const map = (a: number) => transformPoint(state, cx + radius * Math.cos(a), cy + radius * Math.sin(a));
  const n = (value: number) => Number(value.toFixed(3));
  const point = (x: number, y: number) => transformPoint(state, x, y).map(n).join(' ');
  const start = map(angle), path = state.currentPath ?? [];
  if (state.currentPath === undefined) path.push(`M ${n(state.currentX)} ${n(state.currentY)}`);
  else ensurePathPosition(state);
  path.push(`L ${start.map(n).join(' ')}`);
  const segments = radius === 0 ? 0 : Math.ceil(Math.abs(sweepDegrees) / 90), step = segments === 0 ? 0 : sweep / segments;
  for (let index = 0; index < segments; index++) {
    const a = angle + index * step, b = a + step, k = 4 / 3 * Math.tan(step / 4);
    path.push(`C ${point(cx + radius * (Math.cos(a) - k * Math.sin(a)), cy + radius * (Math.sin(a) + k * Math.cos(a)))} ${point(cx + radius * (Math.cos(b) + k * Math.sin(b)), cy + radius * (Math.sin(b) - k * Math.cos(b)))} ${point(cx + radius * Math.cos(b), cy + radius * Math.sin(b))}`);
  }
  const end = map(angle + sweep);
  [state.currentX, state.currentY] = end;
  state.logicalCurrentX = cx + radius * Math.cos(angle + sweep);
  state.logicalCurrentY = cy + radius * Math.sin(angle + sweep);
  if (state.currentPath === undefined) elements.push(pathElement(path, state, 'stroke', true));
  else {
    state.pathFigureClosed = false;
    [state.pathEndX, state.pathEndY] = end;
  }
}

function drawArc(type: number, x1: number, y1: number, x2: number, y2: number, sx: number, sy: number, ex: number, ey: number, state: DrawState, elements: string[], transformPoints: boolean): void {
  const left = Math.min(x1, x2), right = Math.max(x1, x2), top = Math.min(y1, y2), bottom = Math.max(y1, y2);
  const rx = (right - left) / 2, ry = (bottom - top) / 2;
  if (rx === 0 || ry === 0) return;
  const cx = (left + right) / 2, cy = (top + bottom) / 2;
  const angle = Math.atan2((sy - cy) / ry, (sx - cx) / rx), endAngle = Math.atan2((ey - cy) / ry, (ex - cx) / rx);
  let sweep = endAngle - angle;
  if (Math.abs(sweep) < 1e-12) sweep = state.clockwiseShapes ? Math.PI * 2 : -Math.PI * 2;
  else if (state.clockwiseShapes) { while (sweep <= 0) sweep += Math.PI * 2; }
  else { while (sweep >= 0) sweep -= Math.PI * 2; }
  const map = (x: number, y: number): [number, number] => transformPoints ? transformPoint(state, x, y) : [x, y];
  const point = (x: number, y: number) => map(x, y).map(value => Number(value.toFixed(3))).join(' ');
  const start = map(cx + rx * Math.cos(angle), cy + ry * Math.sin(angle));
  const to = type === EMR.ARCTO, closed = type === EMR.CHORD || type === EMR.PIE, path = state.currentPath ?? [];
  if (to) {
    if (state.currentPath === undefined) path.push(`M ${state.currentX} ${state.currentY}`);
    else ensurePathPosition(state);
    path.push(`L ${start.map(value => Number(value.toFixed(3))).join(' ')}`);
  } else {
    path.push(`M ${start.map(value => Number(value.toFixed(3))).join(' ')}`);
    if (state.currentPath !== undefined) { state.pathStartX = start[0]; state.pathStartY = start[1]; }
  }
  const segments = Math.max(1, Math.ceil(Math.abs(sweep) / (Math.PI / 2) - 1e-12)), step = sweep / segments;
  for (let index = 0; index < segments; index++) {
    const a = angle + index * step, b = a + step, k = 4 / 3 * Math.tan(step / 4);
    path.push(`C ${point(cx + rx * (Math.cos(a) - k * Math.sin(a)), cy + ry * (Math.sin(a) + k * Math.cos(a)))} ${point(cx + rx * (Math.cos(b) + k * Math.sin(b)), cy + ry * (Math.sin(b) - k * Math.cos(b)))} ${point(cx + rx * Math.cos(b), cy + ry * Math.sin(b))}`);
  }
  if (type === EMR.PIE) path.push(`L ${point(cx, cy)}`);
  if (closed) path.push('Z');
  const end = map(cx + rx * Math.cos(endAngle), cy + ry * Math.sin(endAngle));
  if (to) { state.currentX = end[0]; state.currentY = end[1]; state.logicalCurrentX = cx + rx * Math.cos(endAngle); state.logicalCurrentY = cy + ry * Math.sin(endAngle); }
  if (state.currentPath === undefined) elements.push(pathElement(path, state, closed ? 'paint' : 'stroke', to));
  else {
    state.pathFigureClosed = closed;
    state.pathEndX = closed ? state.pathStartX : end[0]; state.pathEndY = closed ? state.pathStartY : end[1];
  }
}

function drawRoundRect(x1: number, y1: number, x2: number, y2: number, cornerWidth: number, cornerHeight: number, state: DrawState, elements: string[], transformPoints: boolean): void {
  const left = Math.min(x1, x2), right = Math.max(x1, x2), top = Math.min(y1, y2), bottom = Math.max(y1, y2);
  let rx = Math.min(Math.abs(cornerWidth), right - left) / 2, ry = Math.min(Math.abs(cornerHeight), bottom - top) / 2;
  if (rx === 0 || ry === 0) rx = ry = 0;
  const map = (x: number, y: number): [number, number] => {
    if (state.clockwiseShapes) y = top + bottom - y;
    return transformPoints ? transformPoint(state, x, y) : [x, y];
  };
  const point = (x: number, y: number) => map(x, y).map(value => Number(value.toFixed(3))).join(' ');
  const start = map(right, top + ry), path = [`M ${point(right, top + ry)}`];
  if (rx === 0) path.push(`L ${point(left, top)}`, `L ${point(left, bottom)}`, `L ${point(right, bottom)}`);
  else {
    const kappa = 0.5522847498307936, kx = rx * kappa, ky = ry * kappa;
    path.push(`C ${point(right, top + ry - ky)} ${point(right - rx + kx, top)} ${point(right - rx, top)}`,
      `L ${point(left + rx, top)}`,
      `C ${point(left + rx - kx, top)} ${point(left, top + ry - ky)} ${point(left, top + ry)}`,
      `L ${point(left, bottom - ry)}`,
      `C ${point(left, bottom - ry + ky)} ${point(left + rx - kx, bottom)} ${point(left + rx, bottom)}`,
      `L ${point(right - rx, bottom)}`,
      `C ${point(right - rx + kx, bottom)} ${point(right, bottom - ry + ky)} ${point(right, bottom - ry)}`);
  }
  path.push('Z');
  if (state.currentPath === undefined) elements.push(pathElement(path, state, 'paint'));
  else {
    state.currentPath.push(...path); state.pathFigureClosed = true;
    state.pathStartX = state.pathEndX = start[0]; state.pathStartY = state.pathEndY = start[1];
  }
}

function appendEmfShapePath(bytes: Uint8Array, offset: number, ellipse: boolean, state: DrawState): void {
  const {path, start} = emfShapePath(bytes, offset, ellipse, state);
  state.currentPath!.push(...path);
  state.pathStartX = state.pathEndX = start[0];
  state.pathFigureClosed = true;
  state.pathStartY = state.pathEndY = start[1];
}

function emfShapePath(bytes: Uint8Array, offset: number, ellipse: boolean, state: DrawState): { path: string[]; start: [number, number] } {
  // GDI's recorder already adjusts GM_COMPATIBLE bounds to inclusive edges.
  const left = Math.min(i32(bytes, offset), i32(bytes, offset + 8));
  const right = Math.max(i32(bytes, offset), i32(bytes, offset + 8));
  const top = Math.min(i32(bytes, offset + 4), i32(bytes, offset + 12));
  const bottom = Math.max(i32(bytes, offset + 4), i32(bytes, offset + 12));
  const path: string[] = [];
  const point = (x: number, y: number) => transformPoint(state, x, y).map(value => Number(value.toFixed(3))).join(' ');
  const start = transformPoint(state, right, ellipse ? (top + bottom) / 2 : state.clockwiseShapes ? bottom : top);
  path.push(`M ${point(right, ellipse ? (top + bottom) / 2 : state.clockwiseShapes ? bottom : top)}`);
  if (!ellipse) {
    if (state.clockwiseShapes) path.push(`L ${point(left, bottom)}`, `L ${point(left, top)}`, `L ${point(right, top)}`);
    else path.push(`L ${point(left, top)}`, `L ${point(left, bottom)}`, `L ${point(right, bottom)}`);
  } else {
    const kappa = 0.5522847498307936, cx = (left + right) / 2, cy = (top + bottom) / 2, rx = (right - left) / 2, ry = (bottom - top) / 2;
    const sign = state.clockwiseShapes ? 1 : -1;
    const vertices = [[1, 0], [0, sign], [-1, 0], [0, -sign], [1, 0]];
    for (let index = 0; index < 4; index++) {
      const a = vertices[index], b = vertices[index + 1];
      path.push(`C ${point(cx + rx * (a[0] - kappa * a[1] * sign), cy + ry * (a[1] + kappa * a[0] * sign))} ${point(cx + rx * (b[0] + kappa * b[1] * sign), cy + ry * (b[1] - kappa * b[0] * sign))} ${point(cx + rx * b[0], cy + ry * b[1])}`);
    }
  }
  path.push('Z');
  return {path, start};
}

function rectElement(left: number, top: number, right: number, bottom: number, state: DrawState): string {
  return `<rect x="${Math.min(left, right)}" y="${Math.min(top, bottom)}" width="${Math.abs(right - left)}" height="${Math.abs(bottom - top)}" ${paintAttrs(state)}${clipAttr(state)} />`;
}

function ellipseElement(left: number, top: number, right: number, bottom: number, state: DrawState): string {
  const width = Math.abs(right - left);
  const height = Math.abs(bottom - top);
  return `<ellipse cx="${Math.min(left, right) + width / 2}" cy="${Math.min(top, bottom) + height / 2}" rx="${width / 2}" ry="${height / 2}" ${paintAttrs(state)}${clipAttr(state)} />`;
}

function polyElement(points: Array<[number, number]>, closed: boolean, state: DrawState): string {
  if (points.length === 0)
    return '';
  if(state.pen.cosmeticDashes){
    const path:string[]=[];appendNativePoint(path,'M',points[0],state);for(const point of points.slice(1))appendNativePoint(path,'L',point,state);if(closed)path.push('Z');
    const pixels=cosmeticPixelPath(path,state,closed?'paint':'stroke',false);if(pixels!==undefined)return pixels;
  }
  const tag = closed ? 'polygon' : 'polyline';
  const fill = closed ? `${fillAttrs(state)} ${fillRuleAttr(state)}` : 'fill="none"';
  return `<${tag} points="${points.map(([x, y]) => `${x},${y}`).join(' ')}" ${strokeAttrs(state)} ${fill}${clipAttr(state)} />`;
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

function pathElement(path: string[], state: DrawState, mode: 'fill' | 'stroke' | 'paint', continueCosmeticStyle = false): string {
  if(mode!=='fill'&&state.pen.cosmeticDashes){const pixels=cosmeticPixelPath(path,state,mode,continueCosmeticStyle);if(pixels!==undefined)return pixels;}
  if(mode!=='fill'&&!state.pen.none&&state.styledPen!==penIdentity(state.pen)){state.styledPen=penIdentity(state.pen);state.cosmeticPhase=0;}
  const stroke = mode === 'fill' ? 'stroke="none"' : strokeAttrs(state);
  const fill = mode === 'stroke' ? 'fill="none"' : fillAttrs(state);
  const fillRule = mode === 'stroke' ? '' : ` ${fillRuleAttr(state)}`;
  return `<path d="${path.join(' ')}" ${stroke} ${fill}${fillRule}${clipAttr(state)} />`;
}

function paintAttrs(state: DrawState): string {
  return `${strokeAttrs(state)} ${fillAttrs(state)}`;
}

function strokeAttrs(state: DrawState): string {
  if (state.pen.none) return 'stroke="none"';
  let attributes = `stroke="${state.pen.color}" stroke-width="${state.pen.width}"`;
  if (state.pen.lineCap !== undefined) attributes += ` stroke-linecap="${state.pen.lineCap}"`;
  if (state.pen.lineJoin !== undefined) attributes += ` stroke-linejoin="${state.pen.lineJoin}"`;
  if (state.pen.lineJoin === 'miter') attributes += ` stroke-miterlimit="${state.miterLimit}"`;
  if (state.pen.dashArray?.length) attributes += ` stroke-dasharray="${state.pen.dashArray.join(' ')}"`;
  if (state.pen.cosmeticDashes) attributes += ' shape-rendering="crispEdges"';
  return attributes;
}

function fillAttrs(state: DrawState): string {
  return state.brush.none ? 'fill="none"' : `fill="${state.resolvedBrushFill ?? state.brush.color}"`;
}

const EMF_BRUSH_RECORDS = new Set<number>([EMR.RECTANGLE, EMR.ELLIPSE, EMR.ROUNDRECT, EMR.CHORD, EMR.PIE,
  EMR.POLYGON, EMR.POLYGON16, EMR.POLYPOLYGON, EMR.POLYPOLYGON16, EMR.FILLPATH, EMR.STROKEANDFILLPATH]);

function resolveBrushFill(brush: BrushObject, state: DrawState, defs: string[], patterns: Map<string, string>): string {
  if (brush.none) return 'none';
  if (brush.hatch === undefined) return brush.color;
  // GDI's standard hatches are 8x8 device-pixel masks. Mapped geometry must
  // not scale or rotate the tile; preserve the native pixel phase.
  const x = (state.brushOrgX % 8 + 8) % 8, y = (state.brushOrgY % 8 + 8) % 8;
  const background = state.backgroundMode === 2 ? state.backgroundColor : 'transparent';
  const key = `${brush.hatch}:${brush.color}:${background}:${x}:${y}`;
  let id = patterns.get(key);
  if (id === undefined) {
    id = `hatch${patterns.size + 1}`;
    const pixels: string[] = [];
    for (let row = 0; row < 8; row++) for (let column = 0; column < 8; column++) {
      const painted = brush.hatch === 0 ? row === 3 : brush.hatch === 1 ? column === 4 : brush.hatch === 2 ? row === column
        : brush.hatch === 3 ? row + column === 7 : brush.hatch === 4 ? row === 3 || column === 4 : row === column || row + column === 7;
      if (painted) pixels.push(`M ${column} ${row}h1v1h-1Z`);
    }
    const backdrop = state.backgroundMode === 2 ? `<rect width="8" height="8" fill="${state.backgroundColor}" />` : '';
    defs.push(`<pattern id="${id}" patternUnits="userSpaceOnUse" x="${x}" y="${y}" width="8" height="8">${backdrop}<path d="${pixels.join(' ')}" fill="${brush.color}" /></pattern>`);
    patterns.set(key, id);
  }
  return `url(#${id})`;
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
  return (state.activeClipId ? ` clip-path="url(#${state.activeClipId})"` : '')
    + (state.activeMaskId ? ` mask="url(#${state.activeMaskId})"` : '');
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
    .replace(/[^\u0009\u000A\u000D\u0020-\uD7FF\uE000-\uFFFD\u{10000}-\u{10FFFF}]/gu, '\uFFFD')
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
