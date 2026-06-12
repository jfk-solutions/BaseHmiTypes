using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;

namespace BaseHmiTypes.Images.Converters;

public sealed class MetafileToSvgRenderer
{
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
                case EMR.SetTextColor:
                    state.TextColor = ColorRef(bytes, dataOffset);
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
                    objects[U32(bytes, dataOffset)] = new PenObject
                    {
                        Width = Math.Max(1, I32(bytes, dataOffset + 12)),
                        Color = ColorRef(bytes, dataOffset + 20),
                        None = U32(bytes, dataOffset + 4) == 5,
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
                    objects[U32(bytes, dataOffset)] = new PenObject
                    {
                        Width = ScaledPenWidth(state, I32(bytes, dataOffset + 24)),
                        Color = ColorRef(bytes, dataOffset + 32),
                        None = (U32(bytes, dataOffset + 20) & 0x0000000f) == 5,
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
                        state.PathStartY = state.CurrentY;
                    }

                    break;
                case EMR.LineTo:
                    {
                        var point = TransformPoint(state, I32(bytes, dataOffset), I32(bytes, dataOffset + 4));
                        if (state.CurrentPath is not null)
                            state.CurrentPath.Add($"L {Number(point.X)} {Number(point.Y)}");
                        else
                            elements.Add(LineElement(state.CurrentX, state.CurrentY, point.X, point.Y, state));
                        state.CurrentX = point.X;
                        state.CurrentY = point.Y;
                        break;
                    }
                case EMR.BeginPath:
                    state.CurrentPath = new List<string>();
                    state.PathStartX = null;
                    state.PathStartY = null;
                    break;
                case EMR.CloseFigure:
                    state.CurrentPath?.Add("Z");
                    if (state.PathStartX is not null && state.PathStartY is not null)
                    {
                        state.CurrentX = state.PathStartX.Value;
                        state.CurrentY = state.PathStartY.Value;
                    }

                    break;
                case EMR.SelectClipPath:
                    if (state.CurrentPath is { Count: > 0 })
                    {
                        var id = $"clip{++clipSequence}";
                        defs.Add($"<clipPath id=\"{id}\"><path d=\"{string.Join(" ", state.CurrentPath)}\" /></clipPath>");
                        state.ActiveClipId = id;
                    }

                    state.CurrentPath = null;
                    break;
                case EMR.PolylineTo:
                    AppendLinePointsToPath(state, ReadEmfPoints32(bytes, dataOffset));
                    break;
                case EMR.PolylineTo16:
                    AppendLinePointsToPath(state, ReadEmfPoints16(bytes, dataOffset));
                    break;
                case EMR.PolyBezier16:
                    AppendEmfPolyBezierPath(state, ReadEmfPoints16(bytes, dataOffset));
                    break;
                case EMR.PolyBezierTo16:
                    AppendEmfPolyBezierToPath(state, ReadEmfPoints16(bytes, dataOffset));
                    break;
                case EMR.PolyDraw16:
                    AppendEmfPolyDraw16ToPath(state, bytes, dataOffset);
                    break;
                case EMR.Rectangle:
                    {
                        var rect = TransformRect(state, I32(bytes, dataOffset), I32(bytes, dataOffset + 4), I32(bytes, dataOffset + 8), I32(bytes, dataOffset + 12));
                        elements.Add(RectElement(rect.Left, rect.Top, rect.Right, rect.Bottom, state));
                        break;
                    }
                case EMR.Ellipse:
                    {
                        var rect = TransformRect(state, I32(bytes, dataOffset), I32(bytes, dataOffset + 4), I32(bytes, dataOffset + 8), I32(bytes, dataOffset + 12));
                        elements.Add(EllipseElement(rect.Left, rect.Top, rect.Right, rect.Bottom, state));
                        break;
                    }
                case EMR.Polygon16:
                    elements.Add(PolyElement(MapPoints(ReadEmfPoints16(bytes, dataOffset), state), true, state));
                    break;
                case EMR.Polyline16:
                    elements.Add(PolyElement(MapPoints(ReadEmfPoints16(bytes, dataOffset), state), false, state));
                    break;
                case EMR.PolyPolygon16:
                    foreach (var points in ReadEmfPolyPoly16(bytes, dataOffset))
                        elements.Add(PolyElement(MapPoints(points, state), true, state));
                    break;
                case EMR.PolyPolyline16:
                    foreach (var points in ReadEmfPolyPoly16(bytes, dataOffset))
                        elements.Add(PolyElement(MapPoints(points, state), false, state));
                    break;
                case EMR.FillPath:
                    if (state.CurrentPath is { Count: > 0 })
                        elements.Add(PathElement(state.CurrentPath, state, PathPaintMode.Fill));
                    state.CurrentPath = null;
                    break;
                case EMR.StrokePath:
                    if (state.CurrentPath is { Count: > 0 })
                        elements.Add(PathElement(state.CurrentPath, state, PathPaintMode.Stroke));
                    state.CurrentPath = null;
                    break;
                case EMR.StrokeAndFillPath:
                    if (state.CurrentPath is { Count: > 0 })
                        elements.Add(PathElement(state.CurrentPath, state, PathPaintMode.Paint));
                    state.CurrentPath = null;
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

        return SvgDocument(viewBox, mirroredElements);
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
            ActiveClipId = state.ActiveClipId,
            CurrentPath = state.CurrentPath is null ? null : new List<string>(state.CurrentPath),
            PathStartX = state.PathStartX,
            PathStartY = state.PathStartY,
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
        target.ActiveClipId = restored.ActiveClipId;
        target.CurrentPath = restored.CurrentPath;
        target.PathStartX = restored.PathStartX;
        target.PathStartY = restored.PathStartY;
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
            0x80000005 => new BrushObject { Color = "#ffffff" },
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

    private static void AppendLinePointsToPath(DrawState state, List<(double X, double Y)> points)
    {
        foreach (var point in MapPoints(points, state))
        {
            if (state.CurrentPath is not null)
                state.CurrentPath.Add($"L {Number(point.X)} {Number(point.Y)}");
            state.CurrentX = point.X;
            state.CurrentY = point.Y;
        }
    }

    private static void AppendEmfPolyBezierPath(DrawState state, List<(double X, double Y)> points)
    {
        if (points.Count == 0)
            return;
        var mapped = MapPoints(points, state);
        state.CurrentPath ??= new List<string>();
        state.CurrentPath.Add($"M {Number(mapped[0].X)} {Number(mapped[0].Y)}");
        state.PathStartX = mapped[0].X;
        state.PathStartY = mapped[0].Y;
        for (var index = 1; index + 2 < mapped.Count; index += 3)
            state.CurrentPath.Add($"C {Number(mapped[index].X)} {Number(mapped[index].Y)} {Number(mapped[index + 1].X)} {Number(mapped[index + 1].Y)} {Number(mapped[index + 2].X)} {Number(mapped[index + 2].Y)}");
    }

    private static void AppendEmfPolyBezierToPath(DrawState state, List<(double X, double Y)> points)
    {
        var mapped = MapPoints(points, state);
        for (var index = 0; index + 2 < mapped.Count; index += 3)
            state.CurrentPath?.Add($"C {Number(mapped[index].X)} {Number(mapped[index].Y)} {Number(mapped[index + 1].X)} {Number(mapped[index + 1].Y)} {Number(mapped[index + 2].X)} {Number(mapped[index + 2].Y)}");
    }

    private static void AppendEmfPolyDraw16ToPath(DrawState state, byte[] bytes, int offset)
    {
        var points = ReadEmfPoints16(bytes, offset);
        var typesOffset = offset + 16 + points.Count * 4;
        var mapped = MapPoints(points, state);
        for (var index = 0; index < mapped.Count; index++)
        {
            var type = bytes[typesOffset + index] & 0x07;
            if (type == PolyDrawTypeMoveTo)
                state.CurrentPath?.Add($"M {Number(mapped[index].X)} {Number(mapped[index].Y)}");
            else if (type == PolyDrawTypeLineTo)
                state.CurrentPath?.Add($"L {Number(mapped[index].X)} {Number(mapped[index].Y)}");
            else if (type == PolyDrawTypeBezierTo && index + 2 < mapped.Count)
            {
                state.CurrentPath?.Add($"C {Number(mapped[index].X)} {Number(mapped[index].Y)} {Number(mapped[index + 1].X)} {Number(mapped[index + 1].Y)} {Number(mapped[index + 2].X)} {Number(mapped[index + 2].Y)}");
                index += 2;
            }

            if ((bytes[typesOffset + index] & PolyDrawTypeCloseFigure) != 0)
                state.CurrentPath?.Add("Z");
        }
    }

    private static List<(double X, double Y)> ReadEmfPoints32(byte[] bytes, int offset)
    {
        var count = (int)U32(bytes, offset + 16);
        var pointsOffset = offset + 20;
        var points = new List<(double X, double Y)>();
        for (var index = 0; index < count && pointsOffset + index * 8 + 8 <= bytes.Length; index++)
            points.Add((I32(bytes, pointsOffset + index * 8), I32(bytes, pointsOffset + index * 8 + 4)));
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

    private static List<List<(double X, double Y)>> ReadEmfPolyPoly16(byte[] bytes, int offset)
    {
        var polygonCount = (int)U32(bytes, offset + 16);
        var pointCount = (int)U32(bytes, offset + 20);
        var countsOffset = offset + 24;
        var pointsOffset = countsOffset + polygonCount * 4;
        var result = new List<List<(double X, double Y)>>();
        var pointIndex = 0;
        for (var polygon = 0; polygon < polygonCount; polygon++)
        {
            var count = (int)U32(bytes, countsOffset + polygon * 4);
            var points = new List<(double X, double Y)>();
            for (var index = 0; index < count && pointIndex < pointCount; index++, pointIndex++)
                points.Add((I16(bytes, pointsOffset + pointIndex * 4), I16(bytes, pointsOffset + pointIndex * 4 + 2)));
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
        var dataOffset = record.Offset + 8;
        if (dataOffset + 76 > record.Offset + record.Size)
            return null;
        var x = I32(bytes, dataOffset + 8);
        var y = I32(bytes, dataOffset + 12);
        var chars = (int)U32(bytes, dataOffset + 40);
        var stringOffset = (int)U32(bytes, dataOffset + 44);
        var absoluteStringOffset = record.Offset + stringOffset;
        if (chars <= 0 || absoluteStringOffset < 0 || absoluteStringOffset + chars * 2 > bytes.Length)
            return null;
        var value = Encoding.Unicode.GetString(bytes, absoluteStringOffset, chars * 2).TrimEnd('\0');
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

    private static string LineElement(double x1, double y1, double x2, double y2, DrawState state)
    {
        return $"<line x1=\"{Number(x1)}\" y1=\"{Number(y1)}\" x2=\"{Number(x2)}\" y2=\"{Number(y2)}\" {StrokeAttrs(state)} fill=\"none\" />";
    }

    private static string RectElement(double left, double top, double right, double bottom, DrawState state)
    {
        return $"<rect x=\"{Number(Math.Min(left, right))}\" y=\"{Number(Math.Min(top, bottom))}\" width=\"{Number(Math.Abs(right - left))}\" height=\"{Number(Math.Abs(bottom - top))}\" {PaintAttrs(state)} />";
    }

    private static string EllipseElement(double left, double top, double right, double bottom, DrawState state)
    {
        var width = Math.Abs(right - left);
        var height = Math.Abs(bottom - top);
        return $"<ellipse cx=\"{Number(Math.Min(left, right) + width / 2)}\" cy=\"{Number(Math.Min(top, bottom) + height / 2)}\" rx=\"{Number(width / 2)}\" ry=\"{Number(height / 2)}\" {PaintAttrs(state)} />";
    }

    private static string PolyElement(List<(double X, double Y)> points, bool closed, DrawState state)
    {
        if (points.Count == 0)
            return string.Empty;
        var tag = closed ? "polygon" : "polyline";
        var fill = closed ? $"{FillAttrs(state)} {FillRuleAttr(state)}" : "fill=\"none\"";
        return $"<{tag} points=\"{string.Join(" ", points.ConvertAll(point => $"{Number(point.X)},{Number(point.Y)}"))}\" {StrokeAttrs(state)} {fill} />";
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
        return state.Pen.None ? "stroke=\"none\"" : $"stroke=\"{state.Pen.Color}\" stroke-width=\"{Number(state.Pen.Width)}\"";
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
        return state.ActiveClipId is null ? string.Empty : $" clip-path=\"url(#{state.ActiveClipId})\"";
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
        return value
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
    private const byte PolyDrawTypeCloseFigure = 0x80;
}

internal abstract class MetafileObject
{
}

internal sealed class PenObject : MetafileObject
{
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

    public List<string>? CurrentPath { get; set; }

    public double? PathStartX { get; set; }

    public double? PathStartY { get; set; }
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
    public const uint CloseFigure = 0x003d;
    public const uint FillPath = 0x003e;
    public const uint StrokeAndFillPath = 0x003f;
    public const uint StrokePath = 0x0040;
    public const uint SelectClipPath = 0x0043;
    public const uint MoveToEx = 0x001b;
    public const uint LineTo = 0x0036;
    public const uint PolylineTo = 0x0006;
    public const uint PolyBezier16 = 0x0055;
    public const uint PolyBezierTo16 = 0x0058;
    public const uint PolylineTo16 = 0x0059;
    public const uint PolyDraw16 = 0x005c;
    public const uint SelectObject = 0x0025;
    public const uint CreatePen = 0x0026;
    public const uint CreateBrushIndirect = 0x0027;
    public const uint DeleteObject = 0x0028;
    public const uint Rectangle = 0x002b;
    public const uint Ellipse = 0x002a;
    public const uint Polygon16 = 0x0056;
    public const uint Polyline16 = 0x0057;
    public const uint PolyPolyline16 = 0x005a;
    public const uint PolyPolygon16 = 0x005b;
    public const uint StretchDiBits = 0x0051;
    public const uint ExtCreateFontIndirectW = 0x0052;
    public const uint ExtTextOutW = 0x0054;
    public const uint ExtCreatePen = 0x005f;
}

internal static class META
{
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
    public const ushort Ellipse = 0x0418;
    public const ushort StretchDib = 0x0f43;
}
