using System;
using System.Collections.Generic;
using System.Text;

namespace BaseHmiTypes.Images.Converters;

public sealed class ExtractedRtfImage
{
    public byte[] Bytes { get; set; } = Array.Empty<byte>();

    public string Extension { get; set; } = string.Empty;
}

public static class RtfImageExtractor
{
    private static readonly IReadOnlyDictionary<string, string> PictureTypes = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
    {
        ["pngblip"] = ".png",
        ["jpegblip"] = ".jpg",
        ["emfblip"] = ".emf",
        ["wmetafile"] = ".wmf",
        ["macpict"] = ".pct",
        ["dibitmap"] = ".bmp",
        ["wbitmap"] = ".bmp",
    };

    public static ExtractedRtfImage? ExtractFirstRtfImage(byte[] bytes)
    {
        if (!IsRtf(bytes))
            return null;

        var text = AsciiText(bytes);
        var pictIndex = text.IndexOf("\\pict", StringComparison.Ordinal);
        while (pictIndex >= 0)
        {
            var groupStart = FindGroupStart(text, pictIndex);
            var groupEnd = groupStart >= 0 ? FindGroupEnd(text, groupStart) : -1;
            if (groupStart >= 0 && groupEnd > pictIndex)
            {
                var image = ExtractPictureGroup(text, pictIndex + "\\pict".Length, groupEnd);
                if (image is not null)
                    return image;
            }

            pictIndex = text.IndexOf("\\pict", pictIndex + 5, StringComparison.Ordinal);
        }

        return null;
    }

    private static bool IsRtf(byte[] bytes)
    {
        return bytes.Length >= 6
            && bytes[0] == 0x7b
            && bytes[1] == 0x5c
            && bytes[2] == 0x72
            && bytes[3] == 0x74
            && bytes[4] == 0x66;
    }

    private static string AsciiText(byte[] bytes)
    {
        var chars = new char[bytes.Length];
        for (var index = 0; index < bytes.Length; index++)
            chars[index] = (char)bytes[index];
        return new string(chars);
    }

    private static int FindGroupStart(string text, int offset)
    {
        for (var index = offset; index >= 0; index--)
        {
            if (text[index] == '{' && !IsEscapedRtfChar(text, index))
                return index;
        }

        return -1;
    }

    private static int FindGroupEnd(string text, int groupStart)
    {
        var depth = 0;
        for (var index = groupStart; index < text.Length; index++)
        {
            var character = text[index];
            if (IsEscapedRtfChar(text, index))
                continue;
            if (character == '{')
                depth += 1;
            else if (character == '}')
            {
                depth -= 1;
                if (depth == 0)
                    return index;
            }
        }

        return -1;
    }

    private static bool IsEscapedRtfChar(string text, int offset)
    {
        var slashCount = 0;
        for (var index = offset - 1; index >= 0 && text[index] == '\\'; index--)
            slashCount += 1;
        return slashCount % 2 == 1;
    }

    private static ExtractedRtfImage? ExtractPictureGroup(string text, int offset, int groupEnd)
    {
        var index = offset;
        string? extension = null;

        while (index < groupEnd)
        {
            index = SkipWhitespace(text, index, groupEnd);
            if (index >= groupEnd || text[index] != '\\')
                break;

            var token = ReadControlWord(text, index, groupEnd);
            if (token is null)
                break;

            if (PictureTypes.TryGetValue(token.Value.Word, out var pictureExtension))
                extension = pictureExtension;
            index = token.Value.End;
        }

        if (extension is null)
            return null;

        var imageBytes = HexBytes(text, index, groupEnd);
        return imageBytes.Length > 0 ? new ExtractedRtfImage { Bytes = imageBytes, Extension = extension } : null;
    }

    private static int SkipWhitespace(string text, int offset, int end)
    {
        var index = offset;
        while (index < end && char.IsWhiteSpace(text[index]))
            index += 1;
        return index;
    }

    private static (string Word, int End)? ReadControlWord(string text, int offset, int end)
    {
        var index = offset + 1;
        var wordStart = index;
        while (index < end && IsAsciiLetter(text[index]))
            index += 1;
        if (index == wordStart)
            return null;

        var word = text.Substring(wordStart, index - wordStart).ToLowerInvariant();
        if (index < end && text[index] == '-')
            index += 1;
        while (index < end && char.IsDigit(text[index]))
            index += 1;
        if (index < end && char.IsWhiteSpace(text[index]))
            index += 1;
        return (word, index);
    }

    private static byte[] HexBytes(string text, int offset, int end)
    {
        var values = new List<byte>();
        int? highNibble = null;
        for (var index = offset; index < end; index++)
        {
            var value = HexValue(text[index]);
            if (value < 0)
                continue;
            if (highNibble is null)
                highNibble = value;
            else
            {
                values.Add((byte)((highNibble.Value << 4) | value));
                highNibble = null;
            }
        }

        return values.ToArray();
    }

    private static int HexValue(char character)
    {
        if (character >= '0' && character <= '9')
            return character - '0';
        if (character >= 'A' && character <= 'F')
            return character - 'A' + 10;
        if (character >= 'a' && character <= 'f')
            return character - 'a' + 10;
        return -1;
    }

    private static bool IsAsciiLetter(char character)
    {
        return (character >= 'a' && character <= 'z') || (character >= 'A' && character <= 'Z');
    }
}
