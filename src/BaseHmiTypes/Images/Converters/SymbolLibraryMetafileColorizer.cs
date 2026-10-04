using System;
using BaseHmiTypes.Screens.Base;
namespace BaseHmiTypes.Images.Converters;

/// <summary>Symbol Factory brush-only WMF coloring. Original image bytes are never modified.</summary>
public static class SymbolLibraryMetafileColorizer
{
    public static byte[]? TryRecolor(byte[] bytes, HmiSymbolLibraryFillColorMode mode, HmiColor? color = null)
    {
        if (mode < HmiSymbolLibraryFillColorMode.Original || mode > HmiSymbolLibraryFillColorMode.Hollow || bytes.Length < 24 ||
            (U16(bytes, 0) != 1 && U16(bytes, 0) != 2) || U16(bytes, 2) != 9 ||
            (U16(bytes, 4) != 0x100 && U16(bytes, 4) != 0x300)) return null;
        if ((mode == HmiSymbolLibraryFillColorMode.Solid || mode == HmiSymbolLibraryFillColorMode.Shaded) &&
            (!color.HasValue || color.Value.Alpha != 255)) return null;
        var words = U32(bytes, 6);
        if (words < 12 || words > (uint)bytes.Length / 2) return null;
        var end = (int)words * 2;
        var result = (byte[])bytes.Clone();
        for (var at = 18; at + 6 <= end;)
        {
            var recordWords = U32(bytes, at);
            if (recordWords < 3 || recordWords > (uint)(end - at) / 2) return null;
            var code = U16(bytes, at + 4);
            if (code == 0x02fc && mode != HmiSymbolLibraryFillColorMode.Original)
            {
                if (recordWords < 7) return null;
                if (mode == HmiSymbolLibraryFillColorMode.Hollow)
                { result[at + 6] = 1; result[at + 7] = 0; }
                else
                {
                    var target = color!.Value;
                    var source = U32(bytes, at + 8);
                    var rgb = mode == HmiSymbolLibraryFillColorMode.Solid
                        ? Pack(target.Red, target.Green, target.Blue) : Shade(source, target);
                    for (var i = 0; i < 4; i++) result[at + 8 + i] = (byte)(rgb >> (i * 8));
                }
            }
            at += (int)recordWords * 2;
            if (code == 0) return recordWords == 3 && at == end ? result : null;
        }
        return null;
    }

    private static uint Shade(uint source, HmiColor target)
    {
        if (source == 0 || source == 0xffffff) return source;
        // Native FUN_1000e9b0 constants: 0.333 (not 1/3), 255, 0.5, 2.
        var brightness = ((source & 255) * 0.333 + ((source >> 8) & 255) * 0.333 + ((source >> 16) & 255) * 0.333) / 255;
        byte Channel(byte value) => (byte)(int)(brightness >= 0.5
            ? value + (255 - value) * (brightness - 0.5) * 2 : brightness * 2 * value);
        return Pack(Channel(target.Red), Channel(target.Green), Channel(target.Blue));
    }
    private static uint Pack(byte red, byte green, byte blue) => (uint)(red | green << 8 | blue << 16);
    private static ushort U16(byte[] bytes, int at) => (ushort)(bytes[at] | bytes[at + 1] << 8);
    private static uint U32(byte[] bytes, int at) => (uint)(bytes[at] | bytes[at + 1] << 8 | bytes[at + 2] << 16 | bytes[at + 3] << 24);
}
