using BaseHmiTypes.Screens.Base;
namespace BaseHmiTypes.Images.Converters;

/// <summary>Symbol Factory's record-level WMF flip/cardinal rotation, without moving its host rectangle.</summary>
public static class SymbolLibraryMetafileTransformer
{
    public static byte[]? TryTransform(byte[] bytes, HmiSymbolLibraryFlip flip, HmiSymbolLibraryRotation rotation)
    {
        if (flip < HmiSymbolLibraryFlip.None || flip > HmiSymbolLibraryFlip.Both ||
            rotation < HmiSymbolLibraryRotation.Angle0 || rotation > HmiSymbolLibraryRotation.Angle270) return null;
        var result = SymbolLibraryMetafileColorizer.TryRecolor(bytes, HmiSymbolLibraryFillColorMode.Original);
        if (result == null) return null;
        var horizontal = flip == HmiSymbolLibraryFlip.Horizontal || flip == HmiSymbolLibraryFlip.Both;
        var vertical = flip == HmiSymbolLibraryFlip.Vertical || flip == HmiSymbolLibraryFlip.Both;
        if (rotation == HmiSymbolLibraryRotation.Angle90 || rotation == HmiSymbolLibraryRotation.Angle180)
        { horizontal = !horizontal; vertical = !vertical; }
        var quarterTurn = rotation == HmiSymbolLibraryRotation.Angle90 || rotation == HmiSymbolLibraryRotation.Angle270;
        var originX = 0; var originY = 0; var extentX = 32767; var extentY = 32767;
        var end = (int)U32(bytes, 6) * 2;
        void Point(int xAt, int yAt, bool xy)
        {
            var x = (int)I16(result, xAt); var y = (int)I16(result, yAt);
            if (horizontal) x = originX * 2 + extentX - x;
            if (vertical) y = originY * 2 + extentY - y;
            if (quarterTurn)
            {
                var old = xy ? x : y;
                if (xy) { x = originX + extentY - (y - originY); y = originY + (old - originX); }
                else { y = originX + extentY - (x - originY); x = originY + (old - originX); }
            }
            Set16(result, xAt, x); Set16(result, yAt, y);
        }
        for (var at = 18; at < end;)
        {
            var size = (int)U32(bytes, at) * 2; var code = U16(bytes, at + 4); var p = at + 6;
            switch (code)
            {
                case 0x020b:
                    if (size < 10) return null;
                    originX = I16(bytes, p + 2); originY = I16(bytes, p); break;
                case 0x020c:
                    if (size < 10) return null;
                    extentX = I16(bytes, p + 2); extentY = I16(bytes, p);
                    if (quarterTurn) { Set16(result, p + 2, extentY); Set16(result, p, extentX); } break;
                case 0x0213: case 0x0214:
                    if (size < 10) return null;
                    Point(p + 2, p, false); break;
                case 0x0324: case 0x0325:
                    if (size < 8) return null;
                    var count = I16(bytes, p);
                    if (count < 0 || count > (size - 8) / 4) return null;
                    for (var i = 0; i < count; i++) Point(p + 2 + i * 4, p + 4 + i * 4, true);
                    break;
                case 0x0538:
                    if (size < 8) return null;
                    var polygons = I16(bytes, p);
                    if (polygons < 0 || polygons > (size - 8) / 2) return null;
                    var pointsAt = p + 2 + polygons * 2;
                    for (var i = 0; i < polygons; i++)
                    {
                        var points = I16(bytes, p + 2 + i * 2);
                        if (points < 0 || points > (at + size - pointsAt) / 4) return null;
                        for (var j = 0; j < points; j++) Point(pointsAt + j * 4, pointsAt + j * 4 + 2, true);
                        pointsAt += points * 4;
                    }
                    break;
                case 0x0418: case 0x041b:
                    if (size < 14) return null;
                    // Preserve the native rectangle/ellipse formulas, including nonzero-origin behavior.
                    if (horizontal)
                    { var right = I16(result, p + 2); Set16(result, p + 2, originX * 2 + extentX - I16(result, p + 6)); Set16(result, p + 6, originX * 2 + extentX - right); }
                    if (vertical)
                    { var bottom = I16(result, p); Set16(result, p, originY + extentY - (I16(result, p + 4) - originX)); Set16(result, p + 4, originY + extentY - (bottom - originX)); }
                    if (quarterTurn)
                    { var bottom = I16(result, p); Set16(result, p, originX * 2 + extentX - I16(result, p + 2)); Set16(result, p + 2, originX * 2 + extentX - bottom); }
                    break;
                case 0x041f:
                    if (size < 18) return null;
                    Point(p + 10, p + 8, false); break;
            }
            at += size;
        }
        return result;
    }
    private static ushort U16(byte[] b, int p) => (ushort)(b[p] | b[p + 1] << 8);
    private static short I16(byte[] b, int p) => unchecked((short)U16(b, p));
    private static uint U32(byte[] b, int p) => (uint)(b[p] | b[p + 1] << 8 | b[p + 2] << 16 | b[p + 3] << 24);
    private static void Set16(byte[] b, int p, int value) { b[p] = (byte)value; b[p + 1] = (byte)(value >> 8); }
}
