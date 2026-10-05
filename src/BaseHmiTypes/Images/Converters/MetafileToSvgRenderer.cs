using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;

namespace BaseHmiTypes.Images.Converters;

public sealed class MetafileToSvgRenderer
{
    private const string ClipViewportToken = "__METAFILE_CLIP_VIEWPORT__";
    public string? Render(byte[] bytes, string? extension = null)
    {
        var normalized = extension?.ToLowerInvariant();
        if (normalized == ".emf" || IsEmf(bytes))
            return RenderEmf(bytes);
        if (normalized == ".wmf" || IsWmf(bytes))
            return RenderWmf(bytes);
        return null;
    }

    private static bool IsEmf(byte[] bytes)
    {
        return bytes.Length >= 44 && U32(bytes, 0) == EMR.Header && U32(bytes, 40) == 0x464d4520;
    }

    private static bool IsWmf(byte[] bytes)
    {
        if (bytes.Length < 18)
            return false;
        return U32(bytes, 0) == PlaceableWmfKey || U16(bytes, 0) == 1 || U16(bytes, 0) == 2;
    }

    private string? RenderEmf(byte[] bytes)
    {
        if (!IsEmf(bytes))
            return null;

        var viewBox = EmfHeaderViewBox(bytes) ?? NormalizeViewBox(new ViewBox
        {
            X = I32(bytes, 8),
            Y = I32(bytes, 12),
            Width = I32(bytes, 16) - I32(bytes, 8) + 1,
            Height = I32(bytes, 20) - I32(bytes, 12) + 1,
        });
        var state = CreateInitialState();
        var stateStack = new Stack<DrawState>();
        var objects = new Dictionary<uint, MetafileObject>();
        var elements = new List<string>();
        var defs = new List<string>();
        var clipSequence = 0;

        foreach (var record in EmfRecords(bytes))
        {
            var dataOffset = record.Offset + 8;
            var dataEnd = record.Offset + record.Size;
            if (dataEnd > bytes.Length)
                break;

            switch (record.Type)
            {
                case EMR.SetWindowOrgEx:
                    state.WindowOrgX = I32(bytes, dataOffset);
                    state.WindowOrgY = I32(bytes, dataOffset + 4);
                    break;
                case EMR.SetWindowExtEx:
                    state.WindowExtX = I32(bytes, dataOffset) is var wx && wx != 0 ? wx : 1;
                    state.WindowExtY = I32(bytes, dataOffset + 4) is var wy && wy != 0 ? wy : 1;
                    break;
                case EMR.SetViewportOrgEx:
                    state.ViewportOrgX = I32(bytes, dataOffset);
                    state.ViewportOrgY = I32(bytes, dataOffset + 4);
                    break;
                case EMR.SetViewportExtEx:
                    state.ViewportExtX = I32(bytes, dataOffset) is var vx && vx != 0 ? vx : 1;
                    state.ViewportExtY = I32(bytes, dataOffset + 4) is var vy && vy != 0 ? vy : 1;
                    break;
                case EMR.SetPolyFillMode:
                    state.FillRule = PolyFillRule(U32(bytes, dataOffset));
                    break;
                case EMR.SetArcDirection:
                    if (record.Size >= 12 && U32(bytes, dataOffset) is var direction && (direction == 1 || direction == 2))
                        state.ClockwiseShapes = direction == 2;
                    break;
                case EMR.SetTextColor:
                    state.TextColor = ColorRef(bytes, dataOffset);
                    break;
                case EMR.SetMiterLimit:
                    if (record.Size >= 12)
                    {
                        var limit = F32(bytes, dataOffset);
                        if (!float.IsNaN(limit) && !float.IsInfinity(limit) && limit >= 1) state.MiterLimit = limit;
                    }
                    break;
                case EMR.SaveDc:
                    stateStack.Push(CloneState(state));
                    break;
                case EMR.RestoreDc:
                    RestoreState(state, stateStack.Count > 0 ? stateStack.Pop() : null);
                    break;
                case EMR.SetWorldTransform:
                    state.WorldTransform = ReadTransform(bytes, dataOffset);
                    break;
                case EMR.ModifyWorldTransform:
                    state.WorldTransform = ModifyWorldTransform(state.WorldTransform, ReadTransform(bytes, dataOffset), U32(bytes, dataOffset + 24));
                    break;
                case EMR.CreatePen:
                    if (record.Size < 28) break;
                    objects[U32(bytes, dataOffset)] = new PenObject
                    {
                        // LogPen.Width.x supplies the width; Width.y is ignored.
                        // The complete 16-byte LogPen ends inside this record.
                        Width = Math.Max(1, Math.Abs((double)I32(bytes, dataOffset + 8))),
                        Color = ColorRef(bytes, dataOffset + 16),
                        None = (U32(bytes, dataOffset + 4) & 0xF) == 5,
                    };
                    break;
                case EMR.CreateBrushIndirect:
                    objects[U32(bytes, dataOffset)] = new BrushObject
                    {
                        Color = ColorRef(bytes, dataOffset + 8),
                        None = U32(bytes, dataOffset + 4) == 1,
                    };
                    break;
                case EMR.ExtCreateFontIndirectW:
                    objects[U32(bytes, dataOffset)] = ReadEmfFont(bytes, dataOffset + 4, record.Size - 12);
                    break;
                case EMR.ExtCreatePen:
                    if (record.Size < 52) break;
                    var extendedPenStyle = U32(bytes, dataOffset + 20);
                    var geometricPen = (extendedPenStyle & 0xF0000) == 0x10000;
                    objects[U32(bytes, dataOffset)] = new PenObject
                    {
                        Width = ScaledPenWidth(state, I32(bytes, dataOffset + 24)),
                        Color = ColorRef(bytes, dataOffset + 32),
                        None = (U32(bytes, dataOffset + 20) & 0x0000000f) == 5,
                        LineCap = geometricPen ? (extendedPenStyle & 0xF00) switch
                        {
                            0 => "round", 0x100 => "square", 0x200 => "butt", _ => null,
                        } : null,
                        LineJoin = geometricPen ? (extendedPenStyle & 0xF000) switch
                        {
                            0 => "round", 0x1000 => "bevel", 0x2000 => "miter", _ => null,
                        } : null,
                    };
                    break;
                case EMR.SelectObject:
                    SelectObject(state, EmfStockObject(U32(bytes, dataOffset)) ?? (objects.TryGetValue(U32(bytes, dataOffset), out var obj) ? obj : null));
                    break;
                case EMR.DeleteObject:
                    objects.Remove(U32(bytes, dataOffset));
                    break;
                case EMR.MoveToEx:
                    (state.CurrentX, state.CurrentY) = TransformPoint(state, I32(bytes, dataOffset), I32(bytes, dataOffset + 4));
                    if (state.CurrentPath is not null)
                    {
                        state.CurrentPath.Add($"M {Number(state.CurrentX)} {Number(state.CurrentY)}");
                        state.PathStartX = state.CurrentX;
                        state.PathFigureClosed = false;
                        state.PathStartY = state.CurrentY;
                        state.PathEndX = state.CurrentX;
                        state.PathEndY = state.CurrentY;
                    }

                    break;
                case EMR.LineTo:
                    {
                        var point = TransformPoint(state, I32(bytes, dataOffset), I32(bytes, dataOffset + 4));
                        if (state.CurrentPath is not null)
                        {
                            EnsurePathPosition(state);
                            state.CurrentPath.Add($"L {Number(point.X)} {Number(point.Y)}");
                            state.PathEndX = point.X;
                            state.PathEndY = point.Y;
                        }
                        else
                            elements.Add(LineElement(state.CurrentX, state.CurrentY, point.X, point.Y, state));
                        state.CurrentX = point.X;
                        state.CurrentY = point.Y;
                        break;
                    }
                case EMR.BeginPath:
                    state.SelectedPath = null;
                    state.CurrentPath = new List<string>();
                    state.PathFigureClosed = false;
                    state.PathStartX = null;
                    state.PathStartY = null;
                    state.PathEndX = null;
                    state.PathEndY = null;
                    break;
                case EMR.EndPath:
                    if (state.CurrentPath is not null)
                    {
                        state.SelectedPath = state.CurrentPath;
                        ResetPathConstruction(state);
                    }
                    break;
                case EMR.AbortPath:
                    state.SelectedPath = null;
                    ResetPathConstruction(state);
                    break;
                case EMR.CloseFigure:
                    if (state.CurrentPath is { Count: > 0 } && !state.PathFigureClosed)
                    {
                        // Pending MoveTo commands are not geometry; GDI closes
                        // the preceding drawn figure without moving DC position.
                        while (state.CurrentPath.Count > 0 && state.CurrentPath[state.CurrentPath.Count - 1].StartsWith("M ", StringComparison.Ordinal))
                            state.CurrentPath.RemoveAt(state.CurrentPath.Count - 1);
                        if (state.CurrentPath.Count > 0 && state.CurrentPath[state.CurrentPath.Count - 1] != "Z") state.CurrentPath.Add("Z");
                        state.PathEndX = state.PathStartX;
                        state.PathEndY = state.PathStartY;
                        state.PathFigureClosed = true;
                    }

                    break;
                case EMR.SelectClipPath:
                    if (record.Size >= 12 && U32(bytes, dataOffset) is var clipMode && clipMode >= 1 && clipMode <= 5 && state.SelectedPath is { Count: > 0 })
                    {
                        SelectPathClip(state, clipMode, viewBox, defs, ++clipSequence);
                        state.SelectedPath = null;
                    }
                    break;
                case EMR.IntersectClipRect:
                case EMR.ExcludeClipRect:
                    if (record.Size >= 24)
                        CombineRectClip(I32(bytes, dataOffset), I32(bytes, dataOffset + 4), I32(bytes, dataOffset + 8), I32(bytes, dataOffset + 12), record.Type == EMR.IntersectClipRect ? 1u : 4u, state, viewBox, defs, ++clipSequence, true);
                    break;
                case EMR.PolylineTo:
                case EMR.PolylineTo16:
                case EMR.PolyBezier:
                case EMR.PolyBezier16:
                case EMR.PolyBezierTo:
                case EMR.PolyBezierTo16:
                    DrawEmfPointCurve(bytes, record, state, elements);
                    break;
                case EMR.PolyDraw16:
                case EMR.PolyDraw:
                    DrawEmfPolyDraw(state, bytes, record, elements);
                    break;
                case EMR.Rectangle:
                case EMR.Ellipse:
                    {
                        if (record.Size < 24) break;
                        if (state.CurrentPath is not null)
                        {
                            AppendEmfShapePath(bytes, dataOffset, record.Type == EMR.Ellipse, state);
                            break;
                        }
                        var rect = TransformRect(state, I32(bytes, dataOffset), I32(bytes, dataOffset + 4), I32(bytes, dataOffset + 8), I32(bytes, dataOffset + 12));
                        elements.Add(record.Type == EMR.Ellipse
                            ? EllipseElement(rect.Left, rect.Top, rect.Right, rect.Bottom, state)
                            : RectElement(rect.Left, rect.Top, rect.Right, rect.Bottom, state));
                        break;
                    }
                case EMR.RoundRect:
                    if (record.Size >= 32)
                        DrawRoundRect(I32(bytes, dataOffset), I32(bytes, dataOffset + 4), I32(bytes, dataOffset + 8), I32(bytes, dataOffset + 12), I32(bytes, dataOffset + 16), I32(bytes, dataOffset + 20), state, elements, true);
                    break;
                case EMR.AngleArc:
                    if (record.Size >= 28)
                        DrawAngleArc(I32(bytes, dataOffset), I32(bytes, dataOffset + 4), U32(bytes, dataOffset + 8), F32(bytes, dataOffset + 12), F32(bytes, dataOffset + 16), state, elements);
                    break;
                case EMR.Arc:
                case EMR.Chord:
                case EMR.Pie:
                case EMR.ArcTo:
                    if (record.Size >= 40)
                        DrawArc(record.Type, I32(bytes, dataOffset), I32(bytes, dataOffset + 4), I32(bytes, dataOffset + 8), I32(bytes, dataOffset + 12), I32(bytes, dataOffset + 16), I32(bytes, dataOffset + 20), I32(bytes, dataOffset + 24), I32(bytes, dataOffset + 28), state, elements, true);
                    break;
                case EMR.Polygon16:
                case EMR.Polyline16:
                case EMR.Polygon:
                case EMR.Polyline:
                    {
                        var shortPoints = record.Type == EMR.Polygon16 || record.Type == EMR.Polyline16;
                        var points = MapPoints(ReadEmfPointArray32(bytes, record, shortPoints), state);
                        if (points.Count < 2) break;
                        var closed = record.Type == EMR.Polygon || record.Type == EMR.Polygon16;
                        if (state.CurrentPath is null)
                            elements.Add(PolyElement(points, closed, state));
                        else
                        {
                            // These records start independent figures and do not change
                            // the DC's current position, unlike POLYLINETO.
                            state.CurrentPath.Add($"M {Number(points[0].X)} {Number(points[0].Y)}");
                            for (var index = 1; index < points.Count; index++)
                                state.CurrentPath.Add($"L {Number(points[index].X)} {Number(points[index].Y)}");
                            if (closed) state.CurrentPath.Add("Z");
                            state.PathFigureClosed = closed;
                            state.PathStartX = points[0].X;
                            state.PathStartY = points[0].Y;
                            state.PathEndX = closed ? points[0].X : points[points.Count - 1].X;
                            state.PathEndY = closed ? points[0].Y : points[points.Count - 1].Y;
                        }
                        break;
                    }
                case EMR.PolyPolygon16:
                case EMR.PolyPolyline16:
                case EMR.PolyPolygon:
                case EMR.PolyPolyline:
                    {
                        var closed = record.Type == EMR.PolyPolygon || record.Type == EMR.PolyPolygon16;
                        var shortPoints = record.Type == EMR.PolyPolygon16 || record.Type == EMR.PolyPolyline16;
                        var path = new List<string>();
                        foreach (var figure in ReadEmfCompoundPoints(bytes, record, shortPoints))
                        {
                            var points = MapPoints(figure, state);
                            path.Add($"M {Number(points[0].X)} {Number(points[0].Y)}");
                            for (var index = 1; index < points.Count; index++)
                                path.Add($"L {Number(points[index].X)} {Number(points[index].Y)}");
                            if (closed) path.Add("Z");
                            if (state.CurrentPath is not null)
                            {
                                state.PathStartX = points[0].X;
                                state.PathFigureClosed = closed;
                                state.PathStartY = points[0].Y;
                                state.PathEndX = closed ? points[0].X : points[points.Count - 1].X;
                                state.PathEndY = closed ? points[0].Y : points[points.Count - 1].Y;
                            }
                        }
                        if (path.Count == 0) break;
                        if (state.CurrentPath is not null) state.CurrentPath.AddRange(path);
                        else elements.Add(PathElement(path, state, closed ? PathPaintMode.Paint : PathPaintMode.Stroke));
                        break;
                    }
                case EMR.FillPath:
                    if (state.SelectedPath is { Count: > 0 })
                        elements.Add(PathElement(state.SelectedPath, state, PathPaintMode.Fill));
                    state.SelectedPath = null;
                    break;
                case EMR.StrokePath:
                    if (state.SelectedPath is { Count: > 0 })
                        elements.Add(PathElement(state.SelectedPath, state, PathPaintMode.Stroke));
                    state.SelectedPath = null;
                    break;
                case EMR.StrokeAndFillPath:
                    if (state.SelectedPath is { Count: > 0 })
                        elements.Add(PathElement(state.SelectedPath, state, PathPaintMode.Paint));
                    state.SelectedPath = null;
                    break;
                case EMR.ExtTextOutW:
                    {
                        var text = EmfTextElement(bytes, record, state);
                        if (text is not null)
                            elements.Add(text);
                        break;
                    }
                case EMR.StretchDiBits:
                    {
                        var image = EmfStretchDibitsElement(bytes, dataOffset, viewBox, state);
                        if (image is not null)
                            elements.Add(image);
                        break;
                    }
            }
        }

        return SvgDocument(viewBox, elements, defs);
    }

    private string? RenderWmf(byte[] bytes)
    {
        if (!IsWmf(bytes))
            return null;

        var embeddedEmf = ExtractWmfcEmf(bytes);
        if (embeddedEmf is not null)
        {
            var svg = RenderEmf(embeddedEmf);
            if (svg is not null)
                return svg;
        }

        var placeable = U32(bytes, 0) == PlaceableWmfKey;
        var headerOffset = WmfHeaderOffset(bytes);
        var start = headerOffset + 18;
        var rawViewBox = placeable
            ? new ViewBox { X = I16(bytes, 6), Y = I16(bytes, 8), Width = I16(bytes, 10) - I16(bytes, 6), Height = I16(bytes, 12) - I16(bytes, 8) }
            : new ViewBox { X = 0, Y = 0, Width = 1000, Height = 1000 };
        var mirrorVertically = placeable && ShouldMirrorPlaceableWmfVertically(bytes, start, rawViewBox);
        var viewBox = NormalizeViewBox(rawViewBox);
        var state = CreateInitialState();
        var objects = new List<MetafileObject?>();
        var elements = new List<string>();
        var defs = new List<string>();
        var clipSequence = 0;
        var windowOrg = (X: viewBox.X, Y: viewBox.Y);
        var windowExt = (X: viewBox.Width, Y: viewBox.Height);
        var hasExplicitWindow = false;
        var bounds = new BoundsBuilder();

        foreach (var record in WmfRecords(bytes, start))
        {
            var p = record.Offset + 6;
            switch (record.Type)
            {
                case META.SetWindowOrg:
                    windowOrg = (I16(bytes, p + 2), I16(bytes, p));
                    viewBox = NormalizeViewBox(new ViewBox { X = windowOrg.X, Y = windowOrg.Y, Width = windowExt.X, Height = windowExt.Y });
                    hasExplicitWindow = true;
                    break;
                case META.SetWindowExt:
                    windowExt = (I16(bytes, p + 2), I16(bytes, p));
                    viewBox = NormalizeViewBox(new ViewBox { X = windowOrg.X, Y = windowOrg.Y, Width = windowExt.X, Height = windowExt.Y });
                    mirrorVertically = windowExt.Y < 0;
                    hasExplicitWindow = true;
                    break;
                case META.SetPolyFillMode:
                    state.FillRule = PolyFillRule(U16(bytes, p));
                    break;
                case META.IntersectClipRect:
                case META.ExcludeClipRect:
                    if (record.SizeBytes >= 14)
                        CombineRectClip(I16(bytes, p + 6), I16(bytes, p + 4), I16(bytes, p + 2), I16(bytes, p), record.Type == META.IntersectClipRect ? 1u : 4u, state, null, defs, ++clipSequence, false);
                    break;
                case META.CreatePenIndirect:
                    AddWmfObject(objects, new PenObject { Width = Math.Max(1, Math.Abs((int)I16(bytes, p + 2))), Color = ColorRef(bytes, p + 6), None = U16(bytes, p) == 5 });
                    break;
                case META.CreateBrushIndirect:
                    AddWmfObject(objects, new BrushObject { Color = ColorRef(bytes, p + 2), None = U16(bytes, p) == 1 });
                    break;
                case META.SelectObject:
                    SelectObject(state, U16(bytes, p) < objects.Count ? objects[U16(bytes, p)] : null);
                    break;
                case META.DeleteObject:
                    if (U16(bytes, p) < objects.Count)
                        objects[U16(bytes, p)] = null;
                    break;
                case META.MoveTo:
                    state.CurrentY = I16(bytes, p);
                    state.CurrentX = I16(bytes, p + 2);
                    break;
                case META.LineTo:
                    {
                        var y = I16(bytes, p);
                        var x = I16(bytes, p + 2);
                        bounds.Add(state.CurrentX, state.CurrentY);
                        bounds.Add(x, y);
                        elements.Add(LineElement(state.CurrentX, state.CurrentY, x, y, state));
                        state.CurrentX = x;
                        state.CurrentY = y;
                        break;
                    }
                case META.Rectangle:
                    {
                        var left = I16(bytes, p + 6);
                        var top = I16(bytes, p + 4);
                        var right = I16(bytes, p + 2);
                        var bottom = I16(bytes, p);
                        bounds.Add(left, top);
                        bounds.Add(right, bottom);
                        elements.Add(RectElement(left, top, right, bottom, state));
                        break;
                    }
                case META.RoundRect:
                    if (record.SizeBytes >= 18)
                    {
                        var left = I16(bytes, p + 10);var top = I16(bytes, p + 8);
                        var right = I16(bytes, p + 6);var bottom = I16(bytes, p + 4);
                        bounds.Add(left, top);bounds.Add(right, bottom);
                        DrawRoundRect(left, top, right, bottom, I16(bytes, p + 2), I16(bytes, p), state, elements, false);
                    }
                    break;
                case META.Arc:
                case META.Chord:
                case META.Pie:
                    if (record.SizeBytes >= 22)
                    {
                        var left = I16(bytes, p + 14);var top = I16(bytes, p + 12);var right = I16(bytes, p + 10);var bottom = I16(bytes, p + 8);
                        bounds.Add(left, top);bounds.Add(right, bottom);
                        DrawArc(record.Type == META.Arc ? EMR.Arc : record.Type == META.Chord ? EMR.Chord : EMR.Pie, left, top, right, bottom, I16(bytes, p + 6), I16(bytes, p + 4), I16(bytes, p + 2), I16(bytes, p), state, elements, false);
                    }
                    break;
                case META.Ellipse:
                    {
                        var left = I16(bytes, p + 6);
                        var top = I16(bytes, p + 4);
                        var right = I16(bytes, p + 2);
                        var bottom = I16(bytes, p);
                        bounds.Add(left, top);
                        bounds.Add(right, bottom);
                        elements.Add(EllipseElement(left, top, right, bottom, state));
                        break;
                    }
                case META.Polygon:
                    {
                        var points = ReadWmfPoints(bytes, p);
                        bounds.Add(points);
                        elements.Add(PolyElement(points, true, state));
                        break;
                    }
                case META.PolyPolygon:
                    foreach (var points in ReadWmfPolyPolygon(bytes, p))
                    {
                        bounds.Add(points);
                        elements.Add(PolyElement(points, true, state));
                    }
                    break;
                case META.Polyline:
                    {
                        var points = ReadWmfPoints(bytes, p);
                        bounds.Add(points);
                        elements.Add(PolyElement(points, false, state));
                        break;
                    }
                case META.StretchDib:
                    {
                        var image = WmfStretchDibElement(bytes, record, state);
                        if (image is not null)
                            elements.Add(image);
                        break;
                    }
            }
        }

        if (!placeable && !hasExplicitWindow && bounds.HasValue)
            viewBox = bounds.ToViewBox();

        var mirroredElements = elements;
        if (mirrorVertically)
            mirroredElements = MirrorElementsVertically(mirroredElements, viewBox);

        for (var index = 0; index < defs.Count; index++)
            defs[index] = defs[index].Replace(ClipViewportToken, ClipViewportAttrs(viewBox));
        return SvgDocument(viewBox, mirroredElements, defs);
    }

    private static void AddWmfObject(IList<MetafileObject?> objects, MetafileObject obj)
    {
        for (var index = 0; index < objects.Count; index++)
        {
            if (objects[index] == null)
            {
                objects[index] = obj;
                return;
            }
        }

        objects.Add(obj);
    }

    private const uint PlaceableWmfKey = 0x9ac6cdd7;
    private const ushort WmfEscapeFunctionPrivate = 0x000f;

    private static IEnumerable<EmfRecord> EmfRecords(byte[] bytes)
    {
        var offset = 0;
        while (offset + 8 <= bytes.Length)
        {
            var type = U32(bytes, offset);
            var size = U32(bytes, offset + 4);
            if (size < 8 || offset + size > bytes.Length)
                yield break;
            yield return new EmfRecord(type, offset, (int)size);
            if (type == EMR.Eof)
                yield break;
            offset += (int)size;
        }
    }

    private static IEnumerable<WmfRecord> WmfRecords(byte[] bytes, int start)
    {
        var offset = start;
        while (offset + 6 <= bytes.Length)
        {
            var sizeWords = U32(bytes, offset);
            var type = U16(bytes, offset + 4);
            var sizeBytes = (int)sizeWords * 2;
            if (sizeWords < 3 || offset + sizeBytes > bytes.Length)
                yield break;
            yield return new WmfRecord(type, offset, sizeBytes);
            if (type == 0)
                yield break;
            offset += sizeBytes;
        }
    }

    private static byte[]? ExtractWmfcEmf(byte[] bytes)
    {
        var start = WmfHeaderOffset(bytes) + 18;
        var chunks = new List<byte[]>();
        var totalLength = 0;

        foreach (var record in WmfRecords(bytes, start))
        {
            if (record.Type != META.Escape || record.SizeBytes < 44)
                continue;

            var offset = record.Offset + 6;
            if (U16(bytes, offset) != WmfEscapeFunctionPrivate || Ascii4(bytes, offset + 4) != "WMFC")
                continue;

            var payloadStart = record.Offset + 44;
            var payloadEnd = record.Offset + record.SizeBytes;
            if (payloadStart >= payloadEnd || payloadEnd > bytes.Length)
                continue;

            var chunk = Slice(bytes, payloadStart, payloadEnd - payloadStart);
            chunks.Add(chunk);
            totalLength += chunk.Length;
        }

        if (totalLength < 44)
            return null;

        var emf = new byte[totalLength];
        var targetOffset = 0;
        foreach (var chunk in chunks)
        {
            Buffer.BlockCopy(chunk, 0, emf, targetOffset, chunk.Length);
            targetOffset += chunk.Length;
        }

        return U32(emf, 0) == EMR.Header && U32(emf, 40) == 0x464d4520 && U32(emf, 48) <= emf.Length ? emf : null;
    }

    private static int WmfHeaderOffset(byte[] bytes)
    {
        if (U32(bytes, 0) != PlaceableWmfKey)
            return 0;
        if (IsWmfHeaderAt(bytes, 22))
            return 22;
        return IsWmfHeaderAt(bytes, 24) ? 24 : 22;
    }

    private static bool IsWmfHeaderAt(byte[] bytes, int offset)
    {
        return offset + 18 <= bytes.Length
            && (U16(bytes, offset) == 1 || U16(bytes, offset) == 2)
            && U16(bytes, offset + 2) == 9;
    }

    private static bool ShouldMirrorPlaceableWmfVertically(byte[] bytes, int start, ViewBox viewBox)
    {
        (double X, double Y)? windowOrg = null;
        (double X, double Y)? windowExt = null;

        foreach (var record in WmfRecords(bytes, start))
        {
            var p = record.Offset + 6;
            if (record.Type == META.SetWindowOrg)
                windowOrg = (I16(bytes, p + 2), I16(bytes, p));
            else if (record.Type == META.SetWindowExt)
                windowExt = (I16(bytes, p + 2), I16(bytes, p));
            if (windowOrg is not null && windowExt is not null)
                return false;
        }

        return viewBox.Height > 0;
    }

    private static ViewBox NormalizeViewBox(ViewBox value)
    {
        var width = Math.Abs(value.Width);
        var height = Math.Abs(value.Height);
        return new ViewBox
        {
            X = value.Width < 0 ? value.X + value.Width : value.X,
            Y = value.Height < 0 ? value.Y + value.Height : value.Y,
            Width = width == 0 ? 1 : width,
            Height = height == 0 ? 1 : height,
        };
    }

    private static ViewBox? EmfHeaderViewBox(byte[] bytes)
    {
        if (bytes.Length < 88)
            return null;

        var frameLeft = I32(bytes, 24);
        var frameTop = I32(bytes, 28);
        var frameRight = I32(bytes, 32);
        var frameBottom = I32(bytes, 36);
        var deviceWidth = I32(bytes, 72);
        var deviceHeight = I32(bytes, 76);
        var millimetersWidth = I32(bytes, 80);
        var millimetersHeight = I32(bytes, 84);
        if (deviceWidth <= 0 || deviceHeight <= 0 || millimetersWidth <= 0 || millimetersHeight <= 0 || frameRight == frameLeft || frameBottom == frameTop)
            return null;

        var xScale = deviceWidth / (millimetersWidth * 100d);
        var yScale = deviceHeight / (millimetersHeight * 100d);
        return NormalizeViewBox(new ViewBox
        {
            X = frameLeft * xScale,
            Y = frameTop * yScale,
            Width = (frameRight - frameLeft) * xScale,
            Height = (frameBottom - frameTop) * yScale,
        });
    }

    private static DrawState CreateInitialState()
    {
        return new DrawState
        {
            Pen = new PenObject { Color = "#000000", Width = 1 },
            Brush = new BrushObject { Color = "#ffffff", None = true },
            Font = new FontObject { Family = "Arial", Height = 12, Weight = 400 },
            TextColor = "#000000",
            WindowExtX = 1,
            WindowExtY = 1,
            ViewportExtX = 1,
            ViewportExtY = 1,
            WorldTransform = IdentityTransform(),
            FillRule = "evenodd",
        };
    }

    private static DrawState CloneState(DrawState state)
    {
        return new DrawState
        {
            Pen = state.Pen,
            Brush = state.Brush,
            Font = state.Font,
            TextColor = state.TextColor,
            CurrentX = state.CurrentX,
            CurrentY = state.CurrentY,
            WindowOrgX = state.WindowOrgX,
            WindowOrgY = state.WindowOrgY,
            WindowExtX = state.WindowExtX,
            WindowExtY = state.WindowExtY,
            ViewportOrgX = state.ViewportOrgX,
            ViewportOrgY = state.ViewportOrgY,
            ViewportExtX = state.ViewportExtX,
            ViewportExtY = state.ViewportExtY,
            WorldTransform = state.WorldTransform,
            FillRule = state.FillRule,
            ClockwiseShapes = state.ClockwiseShapes,
            MiterLimit = state.MiterLimit,
            ActiveClipId = state.ActiveClipId,
            ActiveMaskId = state.ActiveMaskId,
            CurrentPath = state.CurrentPath is null ? null : new List<string>(state.CurrentPath),
            SelectedPath = state.SelectedPath is null ? null : new List<string>(state.SelectedPath),
            PathStartX = state.PathStartX,
            PathFigureClosed = state.PathFigureClosed,
            PathStartY = state.PathStartY,
            PathEndX = state.PathEndX,
            PathEndY = state.PathEndY,
        };
    }

    private static void RestoreState(DrawState target, DrawState? source)
    {
        if (source is null)
            return;
        var restored = CloneState(source);
        target.Pen = restored.Pen;
        target.Brush = restored.Brush;
        target.Font = restored.Font;
        target.TextColor = restored.TextColor;
        target.CurrentX = restored.CurrentX;
        target.CurrentY = restored.CurrentY;
        target.WindowOrgX = restored.WindowOrgX;
        target.WindowOrgY = restored.WindowOrgY;
        target.WindowExtX = restored.WindowExtX;
        target.WindowExtY = restored.WindowExtY;
        target.ViewportOrgX = restored.ViewportOrgX;
        target.ViewportOrgY = restored.ViewportOrgY;
        target.ViewportExtX = restored.ViewportExtX;
        target.ViewportExtY = restored.ViewportExtY;
        target.WorldTransform = restored.WorldTransform;
        target.FillRule = restored.FillRule;
        target.ClockwiseShapes = restored.ClockwiseShapes;
        target.MiterLimit = restored.MiterLimit;
        target.ActiveClipId = restored.ActiveClipId;
        target.ActiveMaskId = restored.ActiveMaskId;
        target.CurrentPath = restored.CurrentPath;
        target.PathStartX = restored.PathStartX;
        target.PathFigureClosed = restored.PathFigureClosed;
        target.SelectedPath = restored.SelectedPath;
        target.PathStartY = restored.PathStartY;
        target.PathEndX = restored.PathEndX;
        target.PathEndY = restored.PathEndY;
    }

    private static void SelectObject(DrawState state, MetafileObject? obj)
    {
        switch (obj)
        {
            case PenObject pen:
                state.Pen = pen;
                break;
            case BrushObject brush:
                state.Brush = brush;
                break;
            case FontObject font:
                state.Font = font;
                break;
        }
    }

    private static MetafileObject? EmfStockObject(uint index)
    {
        return index switch
        {
            0x80000000 => new BrushObject { Color = "#ffffff" },
            0x80000001 => new BrushObject { Color = "#c0c0c0" },
            0x80000002 => new BrushObject { Color = "#808080" },
            0x80000003 => new BrushObject { Color = "#404040" },
            0x80000004 => new BrushObject { Color = "#000000" },
            0x80000005 => new BrushObject { None = true },
            0x80000006 => new PenObject { Color = "#ffffff", Width = 1 },
            0x80000007 => new PenObject { Color = "#000000", Width = 1 },
            0x80000008 => new PenObject { None = true, Width = 1 },
            _ => null,
        };
    }

    private static FontObject ReadEmfFont(byte[] bytes, int offset, int size)
    {
        var height = Math.Abs(I32(bytes, offset));
        var weight = I32(bytes, offset + 16);
        var italic = offset + 20 < bytes.Length && bytes[offset + 20] != 0;
        var nameOffset = offset + 28;
        var maxChars = Math.Max(0, Math.Min(32, size - 28));
        var family = "Arial";
        if (maxChars > 0 && nameOffset + maxChars * 2 <= bytes.Length)
        {
            var chars = new List<byte>();
            for (var index = 0; index < maxChars * 2; index += 2)
            {
                if (bytes[nameOffset + index] == 0 && bytes[nameOffset + index + 1] == 0)
                    break;
                chars.Add(bytes[nameOffset + index]);
                chars.Add(bytes[nameOffset + index + 1]);
            }

            if (chars.Count > 0)
                family = Encoding.Unicode.GetString(chars.ToArray());
        }

        return new FontObject { Family = family, Height = height == 0 ? 12 : height, Weight = weight == 0 ? 400 : weight, Italic = italic };
    }

    private static int ScaledPenWidth(DrawState state, int width)
    {
        var scale = Math.Abs(state.ViewportExtX / (double)(state.WindowExtX == 0 ? 1 : state.WindowExtX));
        return Math.Max(1, (int)Math.Round(Math.Abs(width) * (scale == 0 ? 1 : scale)));
    }

    private static (double X, double Y) TransformPoint(DrawState state, double x, double y)
    {
        var mappedX = state.ViewportOrgX + (x - state.WindowOrgX) * state.ViewportExtX / (state.WindowExtX == 0 ? 1 : state.WindowExtX);
        var mappedY = state.ViewportOrgY + (y - state.WindowOrgY) * state.ViewportExtY / (state.WindowExtY == 0 ? 1 : state.WindowExtY);
        return TransformPointWithTransform(state.WorldTransform, mappedX, mappedY);
    }

    private static (double X, double Y) TransformPointWithTransform(Transform transform, double x, double y)
    {
        return (x * transform.M11 + y * transform.M21 + transform.Dx, x * transform.M12 + y * transform.M22 + transform.Dy);
    }

    private static void DrawAngleArc(double cx, double cy, uint radius, double startDegrees, double sweepDegrees, DrawState state, List<string> elements)
    {
        // Bound expansion of hostile FLOAT sweep values, without dropping ordinary
        // repeated turns (which matter for recorded path winding).
        if (double.IsNaN(startDegrees) || double.IsInfinity(startDegrees) || double.IsNaN(sweepDegrees) || double.IsInfinity(sweepDegrees) || Math.Abs(sweepDegrees) > 4096 * 90)
            return;
        var angle = -(startDegrees % 360) * Math.PI / 180;
        var sweep = -sweepDegrees * Math.PI / 180;
        (double X, double Y) Map(double a) => TransformPoint(state, cx + radius * Math.Cos(a), cy + radius * Math.Sin(a));
        string Point(double x, double y) { var p = TransformPoint(state, x, y); return $"{Number(p.X)} {Number(p.Y)}"; }
        var start = Map(angle);
        var path = state.CurrentPath ?? new List<string>();
        if (state.CurrentPath is null) path.Add($"M {Number(state.CurrentX)} {Number(state.CurrentY)}");
        else EnsurePathPosition(state);
        path.Add($"L {Number(start.X)} {Number(start.Y)}");
        var segments = radius == 0 ? 0 : (int)Math.Ceiling(Math.Abs(sweepDegrees) / 90);
        var step = segments == 0 ? 0 : sweep / segments;
        for (var index = 0; index < segments; index++)
        {
            var a = angle + index * step; var b = a + step; var k = 4.0 / 3 * Math.Tan(step / 4);
            path.Add($"C {Point(cx + radius * (Math.Cos(a) - k * Math.Sin(a)), cy + radius * (Math.Sin(a) + k * Math.Cos(a)))} {Point(cx + radius * (Math.Cos(b) + k * Math.Sin(b)), cy + radius * (Math.Sin(b) - k * Math.Cos(b)))} {Point(cx + radius * Math.Cos(b), cy + radius * Math.Sin(b))}");
        }
        var end = Map(angle + sweep);
        state.CurrentX = end.X;
        state.CurrentY = end.Y;
        if (state.CurrentPath is null) elements.Add(PathElement(path, state, PathPaintMode.Stroke));
        else
        {
            state.PathFigureClosed = false;
            state.PathEndX = end.X;
            state.PathEndY = end.Y;
        }
    }

    private static void DrawArc(uint type, double x1, double y1, double x2, double y2, double sx, double sy, double ex, double ey, DrawState state, List<string> elements, bool transformPoints)
    {
        var left = Math.Min(x1, x2);var right = Math.Max(x1, x2);var top = Math.Min(y1, y2);var bottom = Math.Max(y1, y2);
        var rx = (right - left) / 2;var ry = (bottom - top) / 2;
        if (rx == 0 || ry == 0) return;
        var cx = (left + right) / 2;var cy = (top + bottom) / 2;
        var angle = Math.Atan2((sy - cy) / ry, (sx - cx) / rx);
        var endAngle = Math.Atan2((ey - cy) / ry, (ex - cx) / rx);
        var sweep = endAngle - angle;
        if (Math.Abs(sweep) < 1e-12) sweep = state.ClockwiseShapes ? Math.PI * 2 : -Math.PI * 2;
        else if (state.ClockwiseShapes) { while (sweep <= 0) sweep += Math.PI * 2; }
        else { while (sweep >= 0) sweep -= Math.PI * 2; }
        (double X, double Y) Map(double x, double y)=>transformPoints ? TransformPoint(state, x, y) : (x, y);
        string Point(double x, double y) {var point = Map(x, y);return $"{Number(point.X)} {Number(point.Y)}";}
        var start = Map(cx + rx * Math.Cos(angle), cy + ry * Math.Sin(angle));
        var to = type == EMR.ArcTo;var closed = type == EMR.Chord || type == EMR.Pie;
        var path = state.CurrentPath ?? new List<string>();
        if (to)
        {
            if (state.CurrentPath is null) path.Add($"M {Number(state.CurrentX)} {Number(state.CurrentY)}");
            else EnsurePathPosition(state);
            path.Add($"L {Number(start.X)} {Number(start.Y)}");
        }
        else
        {
            path.Add($"M {Number(start.X)} {Number(start.Y)}");
            if (state.CurrentPath is not null) {state.PathStartX = start.X;state.PathStartY = start.Y;}
        }
        var segments = Math.Max(1, (int)Math.Ceiling(Math.Abs(sweep) / (Math.PI / 2) - 1e-12));
        var step = sweep / segments;
        for (var index = 0; index < segments; index++)
        {
            var a = angle + index * step;var b = a + step;var k = 4.0 / 3 * Math.Tan(step / 4);
            path.Add($"C {Point(cx + rx * (Math.Cos(a) - k * Math.Sin(a)), cy + ry * (Math.Sin(a) + k * Math.Cos(a)))} {Point(cx + rx * (Math.Cos(b) + k * Math.Sin(b)), cy + ry * (Math.Sin(b) - k * Math.Cos(b)))} {Point(cx + rx * Math.Cos(b), cy + ry * Math.Sin(b))}");
        }
        if (type == EMR.Pie) path.Add($"L {Point(cx, cy)}");
        if (closed) path.Add("Z");
        var end = Map(cx + rx * Math.Cos(endAngle), cy + ry * Math.Sin(endAngle));
        if (to) {state.CurrentX = end.X;state.CurrentY = end.Y;}
        if (state.CurrentPath is null) elements.Add(PathElement(path, state, closed ? PathPaintMode.Paint : PathPaintMode.Stroke));
        else
        {
            state.PathFigureClosed = closed;
            state.PathEndX = closed ? state.PathStartX : end.X;state.PathEndY = closed ? state.PathStartY : end.Y;
        }
    }

    private static void DrawRoundRect(double x1, double y1, double x2, double y2, double cornerWidth, double cornerHeight, DrawState state, List<string> elements, bool transformPoints)
    {
        var left = Math.Min(x1, x2);var right = Math.Max(x1, x2);var top = Math.Min(y1, y2);var bottom = Math.Max(y1, y2);
        var rx = Math.Min(Math.Abs(cornerWidth), right - left) / 2;
        var ry = Math.Min(Math.Abs(cornerHeight), bottom - top) / 2;
        if (rx == 0 || ry == 0) rx = ry = 0;
        (double X, double Y) Map(double x, double y)
        {
            if (state.ClockwiseShapes) y = top + bottom - y;
            return transformPoints ? TransformPoint(state, x, y) : (x, y);
        }
        string Point(double x, double y) { var point = Map(x, y);return $"{Number(point.X)} {Number(point.Y)}"; }
        var start = Map(right, top + ry);
        var path = new List<string> { $"M {Number(start.X)} {Number(start.Y)}" };
        if (rx == 0)
            path.AddRange(new[] { $"L {Point(left, top)}", $"L {Point(left, bottom)}", $"L {Point(right, bottom)}" });
        else
        {
            const double kappa = 0.5522847498307936;
            var kx = rx * kappa;var ky = ry * kappa;
            path.Add($"C {Point(right, top + ry - ky)} {Point(right - rx + kx, top)} {Point(right - rx, top)}");
            path.Add($"L {Point(left + rx, top)}");
            path.Add($"C {Point(left + rx - kx, top)} {Point(left, top + ry - ky)} {Point(left, top + ry)}");
            path.Add($"L {Point(left, bottom - ry)}");
            path.Add($"C {Point(left, bottom - ry + ky)} {Point(left + rx - kx, bottom)} {Point(left + rx, bottom)}");
            path.Add($"L {Point(right - rx, bottom)}");
            path.Add($"C {Point(right - rx + kx, bottom)} {Point(right, bottom - ry + ky)} {Point(right, bottom - ry)}");
        }
        path.Add("Z");
        if (state.CurrentPath is null) elements.Add(PathElement(path, state, PathPaintMode.Paint));
        else
        {
            state.CurrentPath.AddRange(path);state.PathFigureClosed = true;
            state.PathStartX = state.PathEndX = start.X;state.PathStartY = state.PathEndY = start.Y;
        }
    }

    private static void AppendEmfShapePath(byte[] bytes, int offset, bool ellipse, DrawState state)
    {
        // EMF records already carry inclusive bounds: GDI's recorder adjusts
        // GM_COMPATIBLE right/bottom edges before writing these records.
        double left = Math.Min(I32(bytes, offset), I32(bytes, offset + 8));
        double right = Math.Max(I32(bytes, offset), I32(bytes, offset + 8));
        double top = Math.Min(I32(bytes, offset + 4), I32(bytes, offset + 12));
        double bottom = Math.Max(I32(bytes, offset + 4), I32(bytes, offset + 12));
        var path = state.CurrentPath!;
        string Point(double x, double y)
        {
            var point = TransformPoint(state, x, y);
            return $"{Number(point.X)} {Number(point.Y)}";
        }
        var start = TransformPoint(state, right, ellipse ? (top + bottom) / 2 : state.ClockwiseShapes ? bottom : top);
        path.Add($"M {Number(start.X)} {Number(start.Y)}");
        if (!ellipse)
        {
            if (state.ClockwiseShapes)
            {
                path.Add($"L {Point(left, bottom)}");path.Add($"L {Point(left, top)}");path.Add($"L {Point(right, top)}");
            }
            else
            {
                path.Add($"L {Point(left, top)}");path.Add($"L {Point(left, bottom)}");path.Add($"L {Point(right, bottom)}");
            }
        }
        else
        {
            const double kappa = 0.5522847498307936;
            var cx = (left + right) / 2;var cy = (top + bottom) / 2;
            var rx = (right - left) / 2;var ry = (bottom - top) / 2;
            var sign = state.ClockwiseShapes ? 1 : -1;
            var vertices = new[] { (X: 1, Y: 0), (X: 0, Y: sign), (X: -1, Y: 0), (X: 0, Y: -sign), (X: 1, Y: 0) };
            for (var index = 0; index < 4; index++)
            {
                var a = vertices[index];var b = vertices[index + 1];
                path.Add($"C {Point(cx + rx * (a.X - kappa * a.Y * sign), cy + ry * (a.Y + kappa * a.X * sign))} {Point(cx + rx * (b.X + kappa * b.Y * sign), cy + ry * (b.Y - kappa * b.X * sign))} {Point(cx + rx * b.X, cy + ry * b.Y)}");
            }
        }
        path.Add("Z");
        state.PathFigureClosed = true;
        state.PathStartX = state.PathEndX = start.X;
        state.PathStartY = state.PathEndY = start.Y;
    }

    private static (double Left, double Top, double Right, double Bottom) TransformRect(DrawState state, int left, int top, int right, int bottom)
    {
        var a = TransformPoint(state, left, top);
        var b = TransformPoint(state, right, bottom);
        return (a.X, a.Y, b.X, b.Y);
    }

    private static Transform IdentityTransform()
    {
        return new Transform { M11 = 1, M22 = 1 };
    }

    private static Transform ReadTransform(byte[] bytes, int offset)
    {
        return new Transform { M11 = F32(bytes, offset), M12 = F32(bytes, offset + 4), M21 = F32(bytes, offset + 8), M22 = F32(bytes, offset + 12), Dx = F32(bytes, offset + 16), Dy = F32(bytes, offset + 20) };
    }

    private static Transform ModifyWorldTransform(Transform current, Transform value, uint mode)
    {
        return mode switch
        {
            1 => IdentityTransform(),
            2 => value,
            3 => MultiplyTransform(value, current),
            4 => MultiplyTransform(current, value),
            _ => current,
        };
    }

    private static Transform MultiplyTransform(Transform a, Transform b)
    {
        return new Transform
        {
            M11 = a.M11 * b.M11 + a.M12 * b.M21,
            M12 = a.M11 * b.M12 + a.M12 * b.M22,
            M21 = a.M21 * b.M11 + a.M22 * b.M21,
            M22 = a.M21 * b.M12 + a.M22 * b.M22,
            Dx = a.Dx * b.M11 + a.Dy * b.M21 + b.Dx,
            Dy = a.Dx * b.M12 + a.Dy * b.M22 + b.Dy,
        };
    }

    private static List<(double X, double Y)> MapPoints(IEnumerable<(double X, double Y)> points, DrawState state)
    {
        var result = new List<(double X, double Y)>();
        foreach (var point in points)
            result.Add(TransformPoint(state, point.X, point.Y));
        return result;
    }

    private static void ResetPathConstruction(DrawState state)
    {
        state.CurrentPath = null;
        state.PathFigureClosed = false;
        state.PathStartX = state.PathStartY = state.PathEndX = state.PathEndY = null;
    }

    private static void EnsurePathPosition(DrawState state)
    {
        if (state.CurrentPath is not null && (state.PathFigureClosed || state.PathEndX != state.CurrentX || state.PathEndY != state.CurrentY))
        {
            state.CurrentPath.Add($"M {Number(state.CurrentX)} {Number(state.CurrentY)}");
            state.PathStartX = state.CurrentX;
            state.PathFigureClosed = false;
            state.PathStartY = state.CurrentY;
        }
    }

    private static void DrawEmfPointCurve(byte[] bytes, EmfRecord record, DrawState state, List<string> elements)
    {
        var line = record.Type == EMR.PolylineTo || record.Type == EMR.PolylineTo16;
        var to = line || record.Type == EMR.PolyBezierTo || record.Type == EMR.PolyBezierTo16;
        var shortPoints = record.Type == EMR.PolylineTo16 || record.Type == EMR.PolyBezier16 || record.Type == EMR.PolyBezierTo16;
        var points = MapPoints(ReadEmfPointArray32(bytes, record, shortPoints), state);
        if (line ? points.Count < 1 : to ? points.Count < 3 || points.Count % 3 != 0 : points.Count < 4 || (points.Count - 1) % 3 != 0) return;
        var path = state.CurrentPath ?? new List<string>();
        if (to)
        {
            if (state.CurrentPath is null) path.Add($"M {Number(state.CurrentX)} {Number(state.CurrentY)}");
            else EnsurePathPosition(state);
        }
        else
        {
            path.Add($"M {Number(points[0].X)} {Number(points[0].Y)}");
            if (state.CurrentPath is not null) { state.PathStartX = points[0].X; state.PathStartY = points[0].Y; state.PathFigureClosed = false; }
        }
        for (var index = to ? 0 : 1; index < points.Count; index += line ? 1 : 3)
            path.Add(line ? $"L {Number(points[index].X)} {Number(points[index].Y)}" : $"C {Number(points[index].X)} {Number(points[index].Y)} {Number(points[index + 1].X)} {Number(points[index + 1].Y)} {Number(points[index + 2].X)} {Number(points[index + 2].Y)}");
        var end = points[points.Count - 1];
        if (to) { state.CurrentX = end.X; state.CurrentY = end.Y; }
        if (state.CurrentPath is not null) { state.PathEndX = end.X; state.PathEndY = end.Y; }
        else elements.Add(PathElement(path, state, PathPaintMode.Stroke));
    }

    private static void DrawEmfPolyDraw(DrawState state, byte[] bytes, EmfRecord record, List<string> elements)
    {
        if (record.Size < 28) return;
        var count = U32(bytes, record.Offset + 24);
        var shortPoints = record.Type == EMR.PolyDraw16;
        var pointSize = shortPoints ? 4 : 8;
        if (count == 0 || count > (record.Size - 28) / (pointSize + 1)) return;
        var typesOffset = record.Offset + 28 + (int)count * pointSize;
        // Validate every command before painting or changing the DC position.
        for (var index = 0; index < count; index++)
        {
            var type = bytes[typesOffset + index];
            if (type == PolyDrawTypeMoveTo || type == PolyDrawTypeLineTo || type == (PolyDrawTypeLineTo | PolyDrawTypeCloseFigure)) continue;
            if (type != PolyDrawTypeBezierTo || index + 2 >= count || bytes[typesOffset + index + 1] != PolyDrawTypeBezierTo ||
                (bytes[typesOffset + index + 2] != PolyDrawTypeBezierTo && bytes[typesOffset + index + 2] != (PolyDrawTypeBezierTo | PolyDrawTypeCloseFigure))) return;
            index += 2;
        }
        var mapped = MapPoints(ReadEmfPointArray32(bytes, record, shortPoints), state);
        var path = state.CurrentPath ?? new List<string>();
        if (bytes[typesOffset] != PolyDrawTypeMoveTo)
        {
            if (state.CurrentPath is not null) EnsurePathPosition(state);
            else { path.Add($"M {Number(state.CurrentX)} {Number(state.CurrentY)}"); state.PathStartX = state.CurrentX; state.PathStartY = state.CurrentY; state.PathFigureClosed = false; }
        }
        for (var index = 0; index < mapped.Count; index++)
        {
            var type = bytes[typesOffset + index] & ~PolyDrawTypeCloseFigure;
            if (type != PolyDrawTypeMoveTo && state.PathFigureClosed)
            {
                path.Add($"M {Number(state.CurrentX)} {Number(state.CurrentY)}");
                state.PathStartX = state.CurrentX;
                state.PathStartY = state.CurrentY;
                state.PathFigureClosed = false;
            }
            if (type == PolyDrawTypeMoveTo)
            {
                state.PathFigureClosed = false;
                path.Add($"M {Number(mapped[index].X)} {Number(mapped[index].Y)}");
                state.PathStartX = mapped[index].X;
                state.PathStartY = mapped[index].Y;
            }
            else if (type == PolyDrawTypeLineTo)
                path.Add($"L {Number(mapped[index].X)} {Number(mapped[index].Y)}");
            else
            {
                path.Add($"C {Number(mapped[index].X)} {Number(mapped[index].Y)} {Number(mapped[index + 1].X)} {Number(mapped[index + 1].Y)} {Number(mapped[index + 2].X)} {Number(mapped[index + 2].Y)}");
                index += 2;
            }
            state.PathEndX = state.CurrentX = mapped[index].X;
            state.PathEndY = state.CurrentY = mapped[index].Y;
            if ((bytes[typesOffset + index] & PolyDrawTypeCloseFigure) != 0)
            {
                path.Add("Z");
                state.PathFigureClosed = true;
                // Windows GDI closes the figure without moving the DC current
                // position back from the supplied endpoint (verified natively).
                state.PathEndX = state.PathStartX;
                state.PathEndY = state.PathStartY;
            }
        }
        if (state.CurrentPath is null) elements.Add(PathElement(path, state, PathPaintMode.Stroke));
    }

    private static List<(double X, double Y)> ReadEmfPointArray32(byte[] bytes, EmfRecord record, bool shortPoints = false)
    {
        var points = new List<(double X, double Y)>();
        if (record.Size < 28) return points;
        var count = U32(bytes, record.Offset + 24);
        // Validate unsigned counts against this record, not the remaining file.
        var pointSize = shortPoints ? 4 : 8;
        if (count > (record.Size - 28) / pointSize) return points;
        for (var index = 0; index < count; index++)
        {
            var offset = record.Offset + 28 + index * pointSize;
            points.Add(shortPoints ? (I16(bytes, offset), I16(bytes, offset + 2)) : (I32(bytes, offset), I32(bytes, offset + 4)));
        }
        return points;
    }

    private static List<(double X, double Y)> ReadEmfPoints16(byte[] bytes, int offset)
    {
        var count = (int)U32(bytes, offset + 16);
        var pointsOffset = offset + 20;
        var points = new List<(double X, double Y)>();
        for (var index = 0; index < count && pointsOffset + index * 4 + 4 <= bytes.Length; index++)
            points.Add((I16(bytes, pointsOffset + index * 4), I16(bytes, pointsOffset + index * 4 + 2)));
        return points;
    }

    private static List<List<(double X, double Y)>> ReadEmfCompoundPoints(byte[] bytes, EmfRecord record, bool shortPoints)
    {
        var result = new List<List<(double X, double Y)>>();
        if (record.Size < 32) return result;
        var figureCount = U32(bytes, record.Offset + 24);
        var pointCount = U32(bytes, record.Offset + 28);
        if (figureCount > (record.Size - 32) / 4) return result;
        var countsOffset = record.Offset + 32;
        var pointsOffset = countsOffset + (int)figureCount * 4;
        var pointSize = shortPoints ? 4 : 8;
        if (pointCount > (record.Offset + record.Size - pointsOffset) / pointSize) return result;
        uint consumed = 0;
        for (var figure = 0; figure < figureCount; figure++)
        {
            var count = U32(bytes, countsOffset + figure * 4);
            if (count < 2 || count > pointCount - consumed) return result;
            consumed += count;
        }
        var pointIndex = 0;
        for (var figure = 0; figure < figureCount; figure++)
        {
            var count = U32(bytes, countsOffset + figure * 4);
            var points = new List<(double X, double Y)>();
            for (var index = 0; index < count; index++, pointIndex++)
            {
                var offset = pointsOffset + pointIndex * pointSize;
                points.Add(shortPoints ? (I16(bytes, offset), I16(bytes, offset + 2)) : (I32(bytes, offset), I32(bytes, offset + 4)));
            }
            result.Add(points);
        }

        return result;
    }

    private static List<(double X, double Y)> ReadWmfPoints(byte[] bytes, int offset)
    {
        var count = U16(bytes, offset);
        var points = new List<(double X, double Y)>();
        for (var index = 0; index < count && offset + 2 + index * 4 + 4 <= bytes.Length; index++)
            points.Add((I16(bytes, offset + 2 + index * 4), I16(bytes, offset + 2 + index * 4 + 2)));
        return points;
    }

    private static List<List<(double X, double Y)>> ReadWmfPolyPolygon(byte[] bytes, int offset)
    {
        var polygonCount = U16(bytes, offset);
        var countsOffset = offset + 2;
        var pointsOffset = countsOffset + polygonCount * 2;
        var result = new List<List<(double X, double Y)>>();
        for (var polygon = 0; polygon < polygonCount; polygon++)
        {
            var count = U16(bytes, countsOffset + polygon * 2);
            var points = new List<(double X, double Y)>();
            for (var index = 0; index < count; index++)
            {
                points.Add((I16(bytes, pointsOffset), I16(bytes, pointsOffset + 2)));
                pointsOffset += 4;
            }

            result.Add(points);
        }

        return result;
    }

    private static string? EmfTextElement(byte[] bytes, EmfRecord record, DrawState state)
    {
        if (record.Size < 60)
            return null;
        // EmrText starts at byte 36 of EMR_EXTTEXTOUTW, not at the ignored Bounds.
        var x = I32(bytes, record.Offset + 36);
        var y = I32(bytes, record.Offset + 40);
        var chars = U32(bytes, record.Offset + 44);
        var stringOffset = U32(bytes, record.Offset + 48);
        var options = U32(bytes, record.Offset + 52);
        var fixedSize = (options & 0x100) != 0 ? 60u : 76u;
        // Glyph indices are not Unicode. Font-specific glyph playback remains unsupported.
        if ((options & 0x10) != 0 || chars == 0 || stringOffset < fixedSize || stringOffset % 2 != 0 ||
            stringOffset > record.Size || chars > (record.Size - stringOffset) / 2)
            return null;
        var value = Encoding.Unicode.GetString(bytes, record.Offset + (int)stringOffset, (int)chars * 2).TrimEnd('\0');
        if (value.Length == 0)
            return null;
        var point = TransformPoint(state, x, y);
        var weight = state.Font.Weight >= 600 ? " font-weight=\"bold\"" : string.Empty;
        var italic = state.Font.Italic ? " font-style=\"italic\"" : string.Empty;
        return $"<text x=\"{Number(point.X)}\" y=\"{Number(point.Y)}\" fill=\"{state.TextColor}\" font-family=\"{XmlEscape(state.Font.Family)}\" font-size=\"{Number(state.Font.Height)}\"{weight}{italic}{ClipAttr(state)}>{XmlEscape(value)}</text>";
    }

    private static string? EmfStretchDibitsElement(byte[] bytes, int offset, ViewBox viewBox, DrawState state)
    {
        var boundsLeft = I32(bytes, offset);
        var boundsTop = I32(bytes, offset + 4);
        var boundsRight = I32(bytes, offset + 8);
        var boundsBottom = I32(bytes, offset + 12);
        var xDest = I32(bytes, offset + 16);
        var yDest = I32(bytes, offset + 20);
        var offBmiSrc = U32(bytes, offset + 40);
        var cbBmiSrc = U32(bytes, offset + 44);
        var offBitsSrc = U32(bytes, offset + 48);
        var cbBitsSrc = U32(bytes, offset + 52);
        var cxDest = I32(bytes, offset + 64);
        var cyDest = I32(bytes, offset + 68);
        if (cbBmiSrc == 0 || cbBitsSrc == 0)
            return null;
        var bmiStart = offset - 8 + (int)offBmiSrc;
        var bitsStart = offset - 8 + (int)offBitsSrc;
        if (bmiStart + cbBmiSrc > bytes.Length || bitsStart + cbBitsSrc > bytes.Length)
            return null;
        var dib = ConcatBytes(Slice(bytes, bmiStart, (int)cbBmiSrc), Slice(bytes, bitsStart, (int)cbBitsSrc));
        var bmp = DibToBmp(dib);
        var fallback = TransformRect(state, xDest, yDest, xDest + (cxDest == 0 ? (int)viewBox.Width : cxDest), yDest + (cyDest == 0 ? (int)viewBox.Height : cyDest));
        var left = boundsLeft != 0 || boundsRight != 0 ? Math.Min(boundsLeft, boundsRight) : Math.Min(fallback.Left, fallback.Right);
        var top = boundsTop != 0 || boundsBottom != 0 ? Math.Min(boundsTop, boundsBottom) : Math.Min(fallback.Top, fallback.Bottom);
        var width = boundsLeft != 0 || boundsRight != 0 ? Math.Abs(boundsRight - boundsLeft) + 1 : Math.Abs(fallback.Right - fallback.Left);
        var height = boundsTop != 0 || boundsBottom != 0 ? Math.Abs(boundsBottom - boundsTop) + 1 : Math.Abs(fallback.Bottom - fallback.Top);
        return $"<image x=\"{Number(left)}\" y=\"{Number(top)}\" width=\"{Number(width == 0 ? Math.Abs(cxDest == 0 ? viewBox.Width : cxDest) : width)}\" height=\"{Number(height == 0 ? Math.Abs(cyDest == 0 ? viewBox.Height : cyDest) : height)}\" href=\"data:image/bmp;base64,{Convert.ToBase64String(bmp)}\"{ClipAttr(state)} />";
    }

    private static string? WmfStretchDibElement(byte[] bytes, WmfRecord record, DrawState state)
    {
        var p = record.Offset + 6;
        var dibStart = p + 22;
        var recordEnd = record.Offset + record.SizeBytes;
        if (dibStart >= recordEnd || recordEnd > bytes.Length)
            return null;

        var xDest = I16(bytes, p + 20);
        var yDest = I16(bytes, p + 18);
        var width = I16(bytes, p + 16);
        var height = I16(bytes, p + 14);
        var dib = Slice(bytes, dibStart, recordEnd - dibStart);
        var bmp = DibToBmp(dib);
        return $"<image x=\"{xDest}\" y=\"{yDest}\" width=\"{Math.Abs(width) switch { 0 => 1, var w => w }}\" height=\"{Math.Abs(height) switch { 0 => 1, var h => h }}\" href=\"data:image/bmp;base64,{Convert.ToBase64String(bmp)}\"{ClipAttr(state)} />";
    }

    private static byte[] DibToBmp(byte[] dib)
    {
        const int fileHeaderSize = 14;
        var pixelOffset = fileHeaderSize + DibHeaderAndPaletteSize(dib);
        var fileSize = fileHeaderSize + dib.Length;
        var result = new byte[fileSize];
        result[0] = 0x42;
        result[1] = 0x4d;
        SetU32(result, 2, (uint)fileSize);
        SetU32(result, 10, (uint)pixelOffset);
        Buffer.BlockCopy(dib, 0, result, fileHeaderSize, dib.Length);
        return result;
    }

    private static int DibHeaderAndPaletteSize(byte[] dib)
    {
        if (dib.Length < 40)
            return dib.Length;
        var headerSize = U32(dib, 0);
        var bitCount = U16(dib, 14);
        var colorsUsed = U32(dib, 32);
        var paletteEntries = colorsUsed != 0 ? colorsUsed : bitCount <= 8 ? 1u << bitCount : 0;
        return Math.Min(dib.Length, (int)(headerSize + paletteEntries * 4));
    }

    private static string SvgDocument(ViewBox viewBox, List<string> elements, List<string>? defs = null)
    {
        var defsMarkup = defs is { Count: > 0 } ? $"<defs>{string.Join(string.Empty, defs)}</defs>" : string.Empty;
        return $"<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"{Number(viewBox.X)} {Number(viewBox.Y)} {Number(viewBox.Width)} {Number(viewBox.Height)}\" width=\"{Number(viewBox.Width)}\" height=\"{Number(viewBox.Height)}\">{defsMarkup}{string.Join(string.Empty, elements)}</svg>";
    }

    private static List<string> MirrorElementsVertically(List<string> elements, ViewBox viewBox)
    {
        return new List<string> { $"<g transform=\"translate(0 {Number(viewBox.Y * 2 + viewBox.Height)}) scale(1 -1)\">{string.Join(string.Empty, elements)}</g>" };
    }

    private static void SelectPathClip(DrawState state, uint mode, ViewBox viewBox, List<string> defs, int sequence)
    {
        var geometry = $"d=\"{string.Join(" ", state.SelectedPath!)}\" fill-rule=\"{state.FillRule}\" clip-rule=\"{state.FillRule}\"";
        CombineClipGeometry(state, geometry, mode, viewBox, defs, sequence);
    }

    private static void CombineRectClip(double x1, double y1, double x2, double y2, uint mode, DrawState state, ViewBox? viewBox, List<string> defs, int sequence, bool transformPoints)
    {
        var left = Math.Min(x1, x2); var right = Math.Max(x1, x2);
        var top = Math.Min(y1, y2); var bottom = Math.Max(y1, y2);
        string Point(double x, double y) { var p = transformPoints ? TransformPoint(state, x, y) : (X: x, Y: y); return $"{Number(p.X)} {Number(p.Y)}"; }
        var path = left == right || top == bottom ? string.Empty : $"M {Point(left, top)} L {Point(right, top)} L {Point(right, bottom)} L {Point(left, bottom)} Z";
        CombineClipGeometry(state, $"d=\"{path}\" fill-rule=\"nonzero\" clip-rule=\"nonzero\"", mode, viewBox, defs, sequence);
    }

    private static string ClipViewportAttrs(ViewBox viewBox)
        => $"x=\"{Number(viewBox.X)}\" y=\"{Number(viewBox.Y)}\" width=\"{Number(viewBox.Width)}\" height=\"{Number(viewBox.Height)}\"";

    private static void CombineClipGeometry(DrawState state, string geometry, uint mode, ViewBox? viewBox, List<string> defs, int sequence)
    {
        if (mode == 5 || (mode == 1 && state.ActiveClipId is null && state.ActiveMaskId is null))
        {
            var id = $"clip{sequence}";
            defs.Add($"<clipPath id=\"{id}\"><path {geometry} /></clipPath>");
            state.ActiveClipId = id;
            state.ActiveMaskId = null;
            return;
        }
        // Boolean regions use luminance masks: white includes, black excludes.
        // The finite mask domain is the image viewport, which already bounds output.
        var old = ClipAttr(state);
        // WMF bounds can be inferred only after drawing records have been read.
        var rect = viewBox is null ? ClipViewportToken : ClipViewportAttrs(viewBox);
        var previous = $"<rect {rect} fill=\"#ffffff\"{old} />";
        var include = $"<path {geometry} fill=\"#ffffff\" />";
        var exclude = $"<path {geometry} fill=\"#000000\" />";
        var content = mode switch
        {
            1 => $"<g{old}>{include}</g>",
            2 => previous + include,
            3 => previous + include + $"<path {geometry} fill=\"#000000\"{old} />",
            _ => previous + exclude,
        };
        var maskId = $"mask{sequence}";
        defs.Add($"<mask id=\"{maskId}\" maskUnits=\"userSpaceOnUse\" maskContentUnits=\"userSpaceOnUse\" {rect}>{content}</mask>");
        state.ActiveClipId = null;
        state.ActiveMaskId = maskId;
    }

    private static string LineElement(double x1, double y1, double x2, double y2, DrawState state)
    {
        return $"<line x1=\"{Number(x1)}\" y1=\"{Number(y1)}\" x2=\"{Number(x2)}\" y2=\"{Number(y2)}\" {StrokeAttrs(state)} fill=\"none\"{ClipAttr(state)} />";
    }

    private static string RectElement(double left, double top, double right, double bottom, DrawState state)
    {
        return $"<rect x=\"{Number(Math.Min(left, right))}\" y=\"{Number(Math.Min(top, bottom))}\" width=\"{Number(Math.Abs(right - left))}\" height=\"{Number(Math.Abs(bottom - top))}\" {PaintAttrs(state)}{ClipAttr(state)} />";
    }

    private static string EllipseElement(double left, double top, double right, double bottom, DrawState state)
    {
        var width = Math.Abs(right - left);
        var height = Math.Abs(bottom - top);
        return $"<ellipse cx=\"{Number(Math.Min(left, right) + width / 2)}\" cy=\"{Number(Math.Min(top, bottom) + height / 2)}\" rx=\"{Number(width / 2)}\" ry=\"{Number(height / 2)}\" {PaintAttrs(state)}{ClipAttr(state)} />";
    }

    private static string PolyElement(List<(double X, double Y)> points, bool closed, DrawState state)
    {
        if (points.Count == 0)
            return string.Empty;
        var tag = closed ? "polygon" : "polyline";
        var fill = closed ? $"{FillAttrs(state)} {FillRuleAttr(state)}" : "fill=\"none\"";
        return $"<{tag} points=\"{string.Join(" ", points.ConvertAll(point => $"{Number(point.X)},{Number(point.Y)}"))}\" {StrokeAttrs(state)} {fill}{ClipAttr(state)} />";
    }

    private static string PathElement(List<string> path, DrawState state, PathPaintMode mode)
    {
        var stroke = mode == PathPaintMode.Fill ? "stroke=\"none\"" : StrokeAttrs(state);
        var fill = mode == PathPaintMode.Stroke ? "fill=\"none\"" : FillAttrs(state);
        var fillRule = mode == PathPaintMode.Stroke ? string.Empty : $" {FillRuleAttr(state)}";
        return $"<path d=\"{string.Join(" ", path)}\" {stroke} {fill}{fillRule}{ClipAttr(state)} />";
    }

    private static string PaintAttrs(DrawState state)
    {
        return $"{StrokeAttrs(state)} {FillAttrs(state)}";
    }

    private static string StrokeAttrs(DrawState state)
    {
        if (state.Pen.None) return "stroke=\"none\"";
        var attributes = $"stroke=\"{state.Pen.Color}\" stroke-width=\"{Number(state.Pen.Width)}\"";
        if (state.Pen.LineCap is not null) attributes += $" stroke-linecap=\"{state.Pen.LineCap}\"";
        if (state.Pen.LineJoin is not null) attributes += $" stroke-linejoin=\"{state.Pen.LineJoin}\"";
        if (state.Pen.LineJoin == "miter") attributes += $" stroke-miterlimit=\"{Number(state.MiterLimit)}\"";
        return attributes;
    }

    private static string FillAttrs(DrawState state)
    {
        return state.Brush.None ? "fill=\"none\"" : $"fill=\"{state.Brush.Color}\"";
    }

    private static string FillRuleAttr(DrawState state)
    {
        return $"fill-rule=\"{state.FillRule}\"";
    }

    private static string PolyFillRule(uint mode)
    {
        return mode == 2 ? "nonzero" : "evenodd";
    }

    private static string ClipAttr(DrawState state)
    {
        return (state.ActiveClipId is null ? string.Empty : $" clip-path=\"url(#{state.ActiveClipId})\"")
            + (state.ActiveMaskId is null ? string.Empty : $" mask=\"url(#{state.ActiveMaskId})\"");
    }

    private static string ColorRef(byte[] bytes, int offset)
    {
        return $"#{Hex(Get(bytes, offset))}{Hex(Get(bytes, offset + 1))}{Hex(Get(bytes, offset + 2))}";
    }

    private static string Hex(byte value)
    {
        return value.ToString("x2", CultureInfo.InvariantCulture);
    }

    private static byte[] ConcatBytes(params byte[][] chunks)
    {
        var result = new byte[0];
        var total = 0;
        foreach (var chunk in chunks)
            total += chunk.Length;
        result = new byte[total];
        var offset = 0;
        foreach (var chunk in chunks)
        {
            Buffer.BlockCopy(chunk, 0, result, offset, chunk.Length);
            offset += chunk.Length;
        }

        return result;
    }

    private static ushort U16(byte[] bytes, int offset)
    {
        return (ushort)(Get(bytes, offset) | (Get(bytes, offset + 1) << 8));
    }

    private static short I16(byte[] bytes, int offset)
    {
        return unchecked((short)U16(bytes, offset));
    }

    private static uint U32(byte[] bytes, int offset)
    {
        return (uint)(Get(bytes, offset) | (Get(bytes, offset + 1) << 8) | (Get(bytes, offset + 2) << 16) | (Get(bytes, offset + 3) << 24));
    }

    private static int I32(byte[] bytes, int offset)
    {
        return unchecked((int)U32(bytes, offset));
    }

    private static float F32(byte[] bytes, int offset)
    {
        return BitConverter.ToSingle(bytes, offset);
    }

    private static void SetU32(byte[] bytes, int offset, uint value)
    {
        bytes[offset] = (byte)(value & 0xff);
        bytes[offset + 1] = (byte)((value >> 8) & 0xff);
        bytes[offset + 2] = (byte)((value >> 16) & 0xff);
        bytes[offset + 3] = (byte)((value >> 24) & 0xff);
    }

    private static string Ascii4(byte[] bytes, int offset)
    {
        return new string(new[] { (char)Get(bytes, offset), (char)Get(bytes, offset + 1), (char)Get(bytes, offset + 2), (char)Get(bytes, offset + 3) });
    }

    private static string XmlEscape(string value)
    {
        var safe = new StringBuilder(value.Length);
        for (var at = 0; at < value.Length; at++)
        {
            var c = value[at];
            if (char.IsHighSurrogate(c) && at + 1 < value.Length && char.IsLowSurrogate(value[at + 1]))
            { safe.Append(c).Append(value[++at]); continue; }
            safe.Append(c is '\t' or '\r' or '\n' || c >= ' ' && c <= '\uD7FF' || c >= '\uE000' && c <= '\uFFFD' ? c : '\uFFFD');
        }
        return safe.ToString()
            .Replace("&", "&amp;")
            .Replace("<", "&lt;")
            .Replace(">", "&gt;")
            .Replace("\"", "&quot;");
    }

    private static byte[] Slice(byte[] bytes, int offset, int count)
    {
        var result = new byte[count];
        Buffer.BlockCopy(bytes, offset, result, 0, count);
        return result;
    }

    private static byte Get(byte[] bytes, int offset)
    {
        return offset >= 0 && offset < bytes.Length ? bytes[offset] : (byte)0;
    }

    private static string Number(double value)
    {
        return value.ToString("0.###", CultureInfo.InvariantCulture);
    }

    private const byte PolyDrawTypeMoveTo = 0x06;
    private const byte PolyDrawTypeLineTo = 0x02;
    private const byte PolyDrawTypeBezierTo = 0x04;
    private const byte PolyDrawTypeCloseFigure = 0x01;
}

internal abstract class MetafileObject
{
}

internal sealed class PenObject : MetafileObject
{
    public string? LineCap { get; set; }

    public string? LineJoin { get; set; }

    public string Color { get; set; } = "#000000";

    public double Width { get; set; } = 1;

    public bool None { get; set; }
}

internal sealed class BrushObject : MetafileObject
{
    public string Color { get; set; } = "#ffffff";

    public bool None { get; set; }
}

internal sealed class FontObject : MetafileObject
{
    public string Family { get; set; } = "Arial";

    public double Height { get; set; } = 12;

    public int Weight { get; set; } = 400;

    public bool Italic { get; set; }
}

internal sealed class DrawState
{
    public bool PathFigureClosed { get; set; }
    public bool ClockwiseShapes { get; set; }
    public List<string>? SelectedPath { get; set; }
    public double MiterLimit { get; set; } = 10;

    public PenObject Pen { get; set; } = new();

    public BrushObject Brush { get; set; } = new();

    public FontObject Font { get; set; } = new();

    public string TextColor { get; set; } = "#000000";

    public double CurrentX { get; set; }

    public double CurrentY { get; set; }

    public double WindowOrgX { get; set; }

    public double WindowOrgY { get; set; }

    public double WindowExtX { get; set; } = 1;

    public double WindowExtY { get; set; } = 1;

    public double ViewportOrgX { get; set; }

    public double ViewportOrgY { get; set; }

    public double ViewportExtX { get; set; } = 1;

    public double ViewportExtY { get; set; } = 1;

    public Transform WorldTransform { get; set; } = new();

    public string FillRule { get; set; } = "evenodd";

    public string? ActiveClipId { get; set; }
    public string? ActiveMaskId { get; set; }

    public List<string>? CurrentPath { get; set; }

    public double? PathStartX { get; set; }

    public double? PathStartY { get; set; }
    public double? PathEndX { get; set; }
    public double? PathEndY { get; set; }
}

internal sealed class ViewBox
{
    public double X { get; set; }

    public double Y { get; set; }

    public double Width { get; set; }

    public double Height { get; set; }
}

internal sealed class BoundsBuilder
{
    private double _left = double.PositiveInfinity;
    private double _top = double.PositiveInfinity;
    private double _right = double.NegativeInfinity;
    private double _bottom = double.NegativeInfinity;

    public bool HasValue { get; private set; }

    public void Add(double x, double y)
    {
        if (double.IsNaN(x) || double.IsInfinity(x) || double.IsNaN(y) || double.IsInfinity(y))
            return;

        _left = Math.Min(_left, x);
        _top = Math.Min(_top, y);
        _right = Math.Max(_right, x);
        _bottom = Math.Max(_bottom, y);
        HasValue = true;
    }

    public void Add(IEnumerable<(double X, double Y)> points)
    {
        foreach (var point in points)
            Add(point.X, point.Y);
    }

    public ViewBox ToViewBox()
    {
        return new ViewBox
        {
            X = _left,
            Y = _top,
            Width = Math.Max(1, _right - _left),
            Height = Math.Max(1, _bottom - _top),
        };
    }
}

internal readonly struct EmfRecord
{
    public EmfRecord(uint type, int offset, int size)
    {
        Type = type;
        Offset = offset;
        Size = size;
    }

    public uint Type { get; }

    public int Offset { get; }

    public int Size { get; }
}

internal readonly struct WmfRecord
{
    public WmfRecord(ushort type, int offset, int sizeBytes)
    {
        Type = type;
        Offset = offset;
        SizeBytes = sizeBytes;
    }

    public ushort Type { get; }

    public int Offset { get; }

    public int SizeBytes { get; }
}

internal sealed class Transform
{
    public double M11 { get; set; }

    public double M12 { get; set; }

    public double M21 { get; set; }

    public double M22 { get; set; }

    public double Dx { get; set; }

    public double Dy { get; set; }
}

internal enum PathPaintMode
{
    Fill,
    Stroke,
    Paint,
}

internal static class EMR
{
    public const uint ExcludeClipRect = 0x001d;
    public const uint IntersectClipRect = 0x001e;
    public const uint AngleArc = 0x0029;
    public const uint SetMiterLimit = 0x003a;
    public const uint Header = 0x0001;
    public const uint Eof = 0x000e;
    public const uint SetWindowExtEx = 0x0009;
    public const uint SetWindowOrgEx = 0x000a;
    public const uint SetViewportExtEx = 0x000b;
    public const uint SetViewportOrgEx = 0x000c;
    public const uint SetPolyFillMode = 0x0013;
    public const uint SetTextColor = 0x0018;
    public const uint SaveDc = 0x0021;
    public const uint RestoreDc = 0x0022;
    public const uint SetWorldTransform = 0x0023;
    public const uint ModifyWorldTransform = 0x0024;
    public const uint BeginPath = 0x003b;
    public const uint EndPath = 0x003c;
    public const uint AbortPath = 0x0044;
    public const uint CloseFigure = 0x003d;
    public const uint FillPath = 0x003e;
    public const uint StrokeAndFillPath = 0x003f;
    public const uint StrokePath = 0x0040;
    public const uint SelectClipPath = 0x0043;
    public const uint MoveToEx = 0x001b;
    public const uint LineTo = 0x0036;
    public const uint PolylineTo = 0x0006;
    public const uint PolyBezier = 0x0002;
    public const uint PolyBezierTo = 0x0005;
    public const uint PolyBezier16 = 0x0055;
    public const uint PolyBezierTo16 = 0x0058;
    public const uint PolylineTo16 = 0x0059;
    public const uint PolyDraw16 = 0x005c;
    public const uint PolyDraw = 0x0038;
    public const uint SelectObject = 0x0025;
    public const uint CreatePen = 0x0026;
    public const uint CreateBrushIndirect = 0x0027;
    public const uint DeleteObject = 0x0028;
    public const uint Rectangle = 0x002b;
    public const uint RoundRect = 0x002c;
    public const uint Arc = 0x002d;
    public const uint Chord = 0x002e;
    public const uint Pie = 0x002f;
    public const uint ArcTo = 0x0037;
    public const uint SetArcDirection = 0x0039;
    public const uint Ellipse = 0x002a;
    public const uint Polygon16 = 0x0056;
    public const uint Polygon = 0x0003;
    public const uint Polyline = 0x0004;
    public const uint Polyline16 = 0x0057;
    public const uint PolyPolyline16 = 0x005a;
    public const uint PolyPolygon16 = 0x005b;
    public const uint PolyPolyline = 0x0007;
    public const uint PolyPolygon = 0x0008;
    public const uint StretchDiBits = 0x0051;
    public const uint ExtCreateFontIndirectW = 0x0052;
    public const uint ExtTextOutW = 0x0054;
    public const uint ExtCreatePen = 0x005f;
}

internal static class META
{
    public const ushort ExcludeClipRect = 0x0415;
    public const ushort IntersectClipRect = 0x0416;
    public const ushort Escape = 0x0626;
    public const ushort SetWindowOrg = 0x020b;
    public const ushort SetWindowExt = 0x020c;
    public const ushort SetPolyFillMode = 0x0106;
    public const ushort DeleteObject = 0x01f0;
    public const ushort CreateBrushIndirect = 0x02fc;
    public const ushort CreatePenIndirect = 0x02fa;
    public const ushort SelectObject = 0x012d;
    public const ushort MoveTo = 0x0214;
    public const ushort LineTo = 0x0213;
    public const ushort Polygon = 0x0324;
    public const ushort Polyline = 0x0325;
    public const ushort PolyPolygon = 0x0538;
    public const ushort Rectangle = 0x041b;
    public const ushort RoundRect = 0x061c;
    public const ushort Arc = 0x0817;
    public const ushort Chord = 0x0830;
    public const ushort Pie = 0x081a;
    public const ushort Ellipse = 0x0418;
    public const ushort StretchDib = 0x0f43;
}
