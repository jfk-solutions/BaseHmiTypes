using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace BaseHmiTypes.Images.Converters;

public sealed class TiffToPngRenderer
{
    public Task<string?> RenderAsync(byte[] bytes, string? extension = null)
    {
        if (!IsTiff(bytes, extension))
            return Task.FromResult<string?>(null);

        try
        {
            var decoded = DecodeTiff(bytes);
            return Task.FromResult(decoded is null ? null : RgbaToPngDataUri(decoded.Value.Rgba, decoded.Value.Width, decoded.Value.Height));
        }
        catch
        {
            return Task.FromResult<string?>(null);
        }
    }

    public Task<string?> Render(byte[] bytes, string? extension = null)
    {
        return RenderAsync(bytes, extension);
    }

    private static (byte[] Rgba, int Width, int Height)? DecodeTiff(byte[] bytes)
    {
        var reader = CreateReader(bytes);
        if (reader is null)
            return null;

        var firstIfdOffset = reader.ReadUInt32(bytes, 4);
        var image = FirstDisplayableImage(bytes, reader, firstIfdOffset);
        if (image is null || !CanRender(image))
            return null;

        var raster = DecodeStrips(bytes, image);
        if (raster is null)
            return null;

        var rgba = image.PlanarConfiguration == 2
            ? PlanarRasterToRgba(raster, image, reader)
            : ChunkyRasterToRgba(raster, image, reader);
        return rgba is null ? null : OrientRgba(rgba, image.Width, image.Height, image.Orientation);
    }

    private static TiffImage? FirstDisplayableImage(byte[] bytes, TiffReader reader, uint firstIfdOffset)
    {
        var ifdOffset = firstIfdOffset;
        var visited = new HashSet<uint>();
        while (ifdOffset > 0 && ifdOffset + 2 <= bytes.Length && !visited.Contains(ifdOffset))
        {
            visited.Add(ifdOffset);
            var parsed = ParseImageFileDirectory(bytes, reader, (int)ifdOffset);
            if (parsed is null)
                return null;
            if (ValidDimension(parsed.Value.Image.Width) && ValidDimension(parsed.Value.Image.Height))
                return parsed.Value.Image;
            ifdOffset = parsed.Value.NextIfdOffset;
        }

        return null;
    }

    private static (TiffImage Image, uint NextIfdOffset)? ParseImageFileDirectory(byte[] bytes, TiffReader reader, int offset)
    {
        var entryCount = reader.ReadUInt16(bytes, offset);
        if (offset + 2 + entryCount * 12 + 4 > bytes.Length)
            return null;

        var tags = new Dictionary<int, int[]>();
        for (var index = 0; index < entryCount; index++)
        {
            var entryOffset = offset + 2 + index * 12;
            var tag = reader.ReadUInt16(bytes, entryOffset);
            var values = ReadTagValues(bytes, reader, entryOffset);
            if (values is not null)
                tags[tag] = values;
        }

        var nextIfdOffset = reader.ReadUInt32(bytes, offset + 2 + entryCount * 12);
        var samplesPerPixel = First(tags, TiffTag.SamplesPerPixel) ?? 1;
        var image = new TiffImage
        {
            Width = First(tags, TiffTag.ImageWidth) ?? 0,
            Height = First(tags, TiffTag.ImageLength) ?? 0,
            BitsPerSample = NormalizeBitsPerSample(Get(tags, TiffTag.BitsPerSample), samplesPerPixel),
            Compression = First(tags, TiffTag.Compression) ?? 1,
            Photometric = First(tags, TiffTag.PhotometricInterpretation) ?? 1,
            StripOffsets = Get(tags, TiffTag.StripOffsets) ?? Array.Empty<int>(),
            StripByteCounts = Get(tags, TiffTag.StripByteCounts) ?? Array.Empty<int>(),
            SamplesPerPixel = samplesPerPixel,
            RowsPerStrip = First(tags, TiffTag.RowsPerStrip) ?? int.MaxValue,
            PlanarConfiguration = First(tags, TiffTag.PlanarConfiguration) ?? 1,
            ColorMap = Get(tags, TiffTag.ColorMap),
            ExtraSamples = Get(tags, TiffTag.ExtraSamples) ?? Array.Empty<int>(),
            Orientation = First(tags, TiffTag.Orientation) ?? 1,
            Predictor = First(tags, TiffTag.Predictor) ?? 1,
        };
        return (image, nextIfdOffset);
    }

    private static bool CanRender(TiffImage image)
    {
        return ValidDimension(image.Width)
            && ValidDimension(image.Height)
            && (long)image.Width * image.Height <= 100_000_000
            && (image.Compression == 1 || image.Compression == 5 || image.Compression == 32773)
            && (image.Predictor == 1 || image.Predictor == 2)
            && (image.Photometric == 0 || image.Photometric == 1 || image.Photometric == 2 || image.Photometric == 3)
            && (image.PlanarConfiguration == 1 || image.PlanarConfiguration == 2)
            && image.StripOffsets.Length > 0
            && image.StripByteCounts.Length > 0
            && Array.TrueForAll(image.BitsPerSample, bits => bits == 1 || bits == 2 || bits == 4 || bits == 8 || bits == 16)
            && (image.Photometric != 2 || image.SamplesPerPixel >= 3)
            && (image.Photometric != 3 || image.ColorMap is not null);
    }

    private static byte[]? DecodeStrips(byte[] bytes, TiffImage image)
    {
        var chunks = new List<byte[]>();
        var totalLength = 0;
        for (var index = 0; index < image.StripOffsets.Length; index++)
        {
            var offset = image.StripOffsets[index];
            var byteCount = index < image.StripByteCounts.Length ? image.StripByteCounts[index] : image.StripByteCounts[0];
            if (offset < 0 || byteCount < 0 || offset + byteCount > bytes.Length)
                return null;

            var encoded = Slice(bytes, offset, byteCount);
            var decoded = DecodeStrip(encoded, image.Compression);
            if (decoded is null)
                return null;
            chunks.Add(decoded);
            totalLength += decoded.Length;
        }

        var raster = new byte[totalLength];
        var targetOffset = 0;
        foreach (var chunk in chunks)
        {
            Buffer.BlockCopy(chunk, 0, raster, targetOffset, chunk.Length);
            targetOffset += chunk.Length;
        }

        return image.Predictor == 2 ? ApplyHorizontalPredictor(raster, image) : raster;
    }

    private static byte[]? DecodeStrip(byte[] bytes, int compression)
    {
        return compression switch
        {
            1 => bytes,
            5 => DecodeLzw(bytes),
            32773 => DecodePackBits(bytes),
            _ => null,
        };
    }

    private static byte[]? ChunkyRasterToRgba(byte[] raster, TiffImage image, TiffReader reader)
    {
        var rgba = new byte[image.Width * image.Height * 4];
        var bitsPerPixel = 0;
        for (var index = 0; index < image.SamplesPerPixel; index++)
            bitsPerPixel += index < image.BitsPerSample.Length ? image.BitsPerSample[index] : image.BitsPerSample[0];
        if (bitsPerPixel <= 0)
            return null;

        for (var pixel = 0; pixel < image.Width * image.Height; pixel++)
        {
            var samples = ReadChunkySamples(raster, pixel * bitsPerPixel, image.BitsPerSample, image.SamplesPerPixel, reader);
            if (samples is null)
                return null;
            WriteRgbaPixel(rgba, pixel * 4, samples, image);
        }

        return rgba;
    }

    private static byte[]? PlanarRasterToRgba(byte[] raster, TiffImage image, TiffReader reader)
    {
        var rgba = new byte[image.Width * image.Height * 4];
        var pixels = image.Width * image.Height;
        var planeOffsets = new int[image.BitsPerSample.Length];
        var nextPlaneOffset = 0;
        for (var index = 0; index < image.BitsPerSample.Length; index++)
        {
            planeOffsets[index] = nextPlaneOffset;
            nextPlaneOffset += ((pixels * image.BitsPerSample[index] + 7) / 8) * 8;
        }

        for (var pixel = 0; pixel < pixels; pixel++)
        {
            var samples = new int[image.SamplesPerPixel];
            for (var sample = 0; sample < image.SamplesPerPixel; sample++)
            {
                var bits = sample < image.BitsPerSample.Length ? image.BitsPerSample[sample] : image.BitsPerSample[0];
                var value = ReadSample(raster, planeOffsets[Math.Min(sample, planeOffsets.Length - 1)] + pixel * bits, bits, reader);
                if (value is null)
                    return null;
                samples[sample] = value.Value;
            }

            WriteRgbaPixel(rgba, pixel * 4, samples, image);
        }

        return rgba;
    }

    private static int[]? ReadChunkySamples(byte[] raster, int pixelBitOffset, int[] bitsPerSample, int samplesPerPixel, TiffReader reader)
    {
        var samples = new int[samplesPerPixel];
        var sampleBitOffset = pixelBitOffset;
        for (var sample = 0; sample < samplesPerPixel; sample++)
        {
            var bits = sample < bitsPerSample.Length ? bitsPerSample[sample] : bitsPerSample[0];
            var value = ReadSample(raster, sampleBitOffset, bits, reader);
            if (value is null)
                return null;
            samples[sample] = value.Value;
            sampleBitOffset += bits;
        }

        return samples;
    }

    private static void WriteRgbaPixel(byte[] rgba, int offset, int[] samples, TiffImage image)
    {
        if (image.Photometric == 2)
        {
            rgba[offset] = ScaleSample(samples.Length > 0 ? samples[0] : 0, At(image.BitsPerSample, 0, 8));
            rgba[offset + 1] = ScaleSample(samples.Length > 1 ? samples[1] : samples[0], At(image.BitsPerSample, 1, At(image.BitsPerSample, 0, 8)));
            rgba[offset + 2] = ScaleSample(samples.Length > 2 ? samples[2] : samples[0], At(image.BitsPerSample, 2, At(image.BitsPerSample, 0, 8)));
            rgba[offset + 3] = AlphaSample(samples, image);
            return;
        }

        if (image.Photometric == 3 && image.ColorMap is not null)
        {
            var index = samples.Length > 0 ? samples[0] : 0;
            var colors = image.ColorMap.Length / 3;
            rgba[offset] = ColorMapSample(At(image.ColorMap, index, 0));
            rgba[offset + 1] = ColorMapSample(At(image.ColorMap, index + colors, 0));
            rgba[offset + 2] = ColorMapSample(At(image.ColorMap, index + colors * 2, 0));
            rgba[offset + 3] = 255;
            return;
        }

        var bits = At(image.BitsPerSample, 0, 8);
        var gray = ScaleSample(samples.Length > 0 ? samples[0] : 0, bits);
        var value = image.Photometric == 0 ? (byte)(255 - gray) : gray;
        rgba[offset] = value;
        rgba[offset + 1] = value;
        rgba[offset + 2] = value;
        rgba[offset + 3] = AlphaSample(samples, image);
    }

    private static byte AlphaSample(int[] samples, TiffImage image)
    {
        var alphaIndex = Array.FindIndex(image.ExtraSamples, value => value == 1 || value == 2);
        if (alphaIndex < 0)
            return 255;

        var sampleIndex = image.SamplesPerPixel - image.ExtraSamples.Length + alphaIndex;
        return ScaleSample(At(samples, sampleIndex, 0), At(image.BitsPerSample, sampleIndex, At(image.BitsPerSample, 0, 8)));
    }

    private static (byte[] Rgba, int Width, int Height) OrientRgba(byte[] rgba, int width, int height, int orientation)
    {
        if (orientation < 2 || orientation > 8)
            return (rgba, width, height);

        var rotated = orientation >= 5 && orientation <= 8;
        var targetWidth = rotated ? height : width;
        var targetHeight = rotated ? width : height;
        var output = new byte[rgba.Length];
        for (var y = 0; y < height; y++)
        {
            for (var x = 0; x < width; x++)
            {
                var position = OrientedPosition(x, y, width, height, orientation);
                Buffer.BlockCopy(rgba, (y * width + x) * 4, output, (position.TargetY * targetWidth + position.TargetX) * 4, 4);
            }
        }

        return (output, targetWidth, targetHeight);
    }

    private static (int TargetX, int TargetY) OrientedPosition(int x, int y, int width, int height, int orientation)
    {
        return orientation switch
        {
            2 => (width - 1 - x, y),
            3 => (width - 1 - x, height - 1 - y),
            4 => (x, height - 1 - y),
            5 => (y, x),
            6 => (height - 1 - y, x),
            7 => (height - 1 - y, width - 1 - x),
            8 => (y, width - 1 - x),
            _ => (x, y),
        };
    }

    private static int? ReadSample(byte[] bytes, int bitOffset, int bits, TiffReader reader)
    {
        if (bits == 8 && bitOffset % 8 == 0)
        {
            var byteOffset = bitOffset / 8;
            return byteOffset < bytes.Length ? bytes[byteOffset] : null;
        }

        if (bits == 16 && bitOffset % 8 == 0)
        {
            var byteOffset = bitOffset / 8;
            return byteOffset + 2 <= bytes.Length ? reader.ReadUInt16(bytes, byteOffset) : null;
        }

        if (bitOffset + bits > bytes.Length * 8)
            return null;

        var value = 0;
        for (var bit = 0; bit < bits; bit++)
        {
            var absoluteBit = bitOffset + bit;
            value = (value << 1) | ((bytes[absoluteBit / 8] >> (7 - (absoluteBit % 8))) & 1);
        }

        return value;
    }

    private static byte ScaleSample(int value, int bits)
    {
        if (bits == 8)
            return (byte)(value & 0xff);
        if (bits == 16)
            return (byte)((uint)value >> 8);
        return (byte)Math.Round(value / (double)((1 << bits) - 1) * 255);
    }

    private static byte ColorMapSample(int value)
    {
        return (byte)(value > 255 ? value >> 8 : value);
    }

    private static byte[] DecodePackBits(byte[] bytes)
    {
        var output = new List<byte>();
        for (var offset = 0; offset < bytes.Length;)
        {
            var header = (sbyte)bytes[offset++];
            if (header >= 0 && header <= 127)
            {
                var count = header + 1;
                for (var index = 0; index < count && offset < bytes.Length; index++)
                    output.Add(bytes[offset++]);
            }
            else if (header >= -127 && header <= -1)
            {
                if (offset >= bytes.Length)
                    break;
                var value = bytes[offset++];
                var count = 1 - header;
                for (var index = 0; index < count; index++)
                    output.Add(value);
            }
        }

        return output.ToArray();
    }

    private static byte[]? DecodeLzw(byte[] bytes)
    {
        var reader = new MsbBitReader(bytes);
        var dictionary = CreateLzwDictionary();
        var codeSize = 9;
        var nextCode = 258;
        byte[]? previous = null;
        var output = new List<byte>();

        for (;;)
        {
            var code = reader.Read(codeSize);
            if (code is null)
                break;
            if (code == 256)
            {
                dictionary = CreateLzwDictionary();
                codeSize = 9;
                nextCode = 258;
                previous = null;
                continue;
            }

            if (code == 257)
                break;

            dictionary.TryGetValue(code.Value, out var entry);
            if (entry is null && previous is not null && code == nextCode)
                entry = Append(previous, previous[0]);
            if (entry is null)
                return null;

            output.AddRange(entry);
            if (previous is not null)
            {
                dictionary[nextCode++] = Append(previous, entry[0]);
                if (nextCode == 1 << codeSize && codeSize < 12)
                    codeSize++;
            }

            previous = entry;
        }

        return output.ToArray();
    }

    private static Dictionary<int, byte[]> CreateLzwDictionary()
    {
        var dictionary = new Dictionary<int, byte[]>();
        for (var index = 0; index < 256; index++)
            dictionary[index] = new[] { (byte)index };
        return dictionary;
    }

    private sealed class MsbBitReader
    {
        private readonly byte[] bytes;
        private int bitOffset;

        public MsbBitReader(byte[] bytes)
        {
            this.bytes = bytes;
        }

        public int? Read(int bits)
        {
            if (bitOffset + bits > bytes.Length * 8)
                return null;

            var value = 0;
            for (var index = 0; index < bits; index++)
            {
                var absoluteBit = bitOffset++;
                value = (value << 1) | ((bytes[absoluteBit / 8] >> (7 - (absoluteBit % 8))) & 1);
            }

            return value;
        }
    }

    private static byte[]? ApplyHorizontalPredictor(byte[] raster, TiffImage image)
    {
        if (Array.Exists(image.BitsPerSample, bits => bits != 8 && bits != 16))
            return null;

        var output = (byte[])raster.Clone();
        var bytesPerSample = image.BitsPerSample[0] == 16 ? 2 : 1;
        var bytesPerPixel = 0;
        for (var index = 0; index < image.SamplesPerPixel; index++)
            bytesPerPixel += At(image.BitsPerSample, index, image.BitsPerSample[0]) / 8;
        var rowBytes = image.Width * bytesPerPixel;

        if (image.PlanarConfiguration == 2)
        {
            var planeRowBytes = image.Width * bytesPerSample;
            for (var sample = 0; sample < image.SamplesPerPixel; sample++)
            {
                var planeOffset = sample * image.Height * planeRowBytes;
                RestorePredictorRows(output, planeOffset, image.Height, image.Width, bytesPerSample, planeRowBytes);
            }

            return output;
        }

        RestorePredictorRows(output, 0, image.Height, image.Width, bytesPerPixel, rowBytes);
        return output;
    }

    private static void RestorePredictorRows(byte[] bytes, int startOffset, int rows, int width, int stride, int rowBytes)
    {
        for (var y = 0; y < rows; y++)
        {
            var rowOffset = startOffset + y * rowBytes;
            for (var x = 1; x < width; x++)
            {
                var pixelOffset = rowOffset + x * stride;
                for (var channel = 0; channel < stride; channel++)
                    bytes[pixelOffset + channel] = (byte)((bytes[pixelOffset + channel] + bytes[pixelOffset + channel - stride]) & 0xff);
            }
        }
    }

    private static int[]? ReadTagValues(byte[] bytes, TiffReader reader, int entryOffset)
    {
        var type = reader.ReadUInt16(bytes, entryOffset + 2);
        var count = reader.ReadUInt32(bytes, entryOffset + 4);
        var size = TypeSize(type);
        if (size == 0 || count > 1_000_000)
            return null;

        var byteLength = (long)count * size;
        var valueOffset = byteLength <= 4 ? entryOffset + 8 : (int)reader.ReadUInt32(bytes, entryOffset + 8);
        if (valueOffset < 0 || valueOffset + byteLength > bytes.Length)
            return null;

        var values = new int[count];
        for (var index = 0; index < count; index++)
        {
            var offset = valueOffset + index * size;
            values[index] = type switch
            {
                (int)TiffType.Byte or (int)TiffType.Ascii or (int)TiffType.Undefined => bytes[offset],
                (int)TiffType.SByte => (sbyte)bytes[offset],
                (int)TiffType.Short => reader.ReadUInt16(bytes, offset),
                (int)TiffType.SShort => reader.ReadInt16(bytes, offset),
                (int)TiffType.Long => unchecked((int)reader.ReadUInt32(bytes, offset)),
                (int)TiffType.SLong => reader.ReadInt32(bytes, offset),
                _ => 0,
            };
        }

        return values;
    }

    private static TiffReader? CreateReader(byte[] bytes)
    {
        if (bytes.Length < 8)
            return null;
        if (bytes[0] == 0x49 && bytes[1] == 0x49 && bytes[2] == 0x2a && bytes[3] == 0x00)
            return new TiffReader(true, ReadUInt16LE, ReadInt16LE, ReadUInt32LE, ReadInt32LE);
        if (bytes[0] == 0x4d && bytes[1] == 0x4d && bytes[2] == 0x00 && bytes[3] == 0x2a)
            return new TiffReader(false, ReadUInt16BE, ReadInt16BE, ReadUInt32BE, ReadInt32BE);
        return null;
    }

    private static int TypeSize(int type)
    {
        return type switch
        {
            (int)TiffType.Byte or (int)TiffType.Ascii or (int)TiffType.SByte or (int)TiffType.Undefined => 1,
            (int)TiffType.Short or (int)TiffType.SShort => 2,
            (int)TiffType.Long or (int)TiffType.SLong => 4,
            _ => 0,
        };
    }

    private static int? First(Dictionary<int, int[]> tags, TiffTag tag)
    {
        return tags.TryGetValue((int)tag, out var values) && values.Length > 0 ? values[0] : null;
    }

    private static int[]? Get(Dictionary<int, int[]> tags, TiffTag tag)
    {
        return tags.TryGetValue((int)tag, out var values) ? values : null;
    }

    private static int[] NormalizeBitsPerSample(int[]? values, int count)
    {
        var length = Math.Max(1, count);
        var result = new int[length];
        for (var index = 0; index < result.Length; index++)
            result[index] = values is { Length: > 0 } ? At(values, index, values[0]) : 1;
        return result;
    }

    private static bool IsTiff(byte[] bytes, string? extension = null)
    {
        var normalized = (extension ?? string.Empty).ToLowerInvariant();
        if (normalized == ".tif" || normalized == ".tiff")
            return true;
        return bytes.Length >= 4
            && ((bytes[0] == 0x49 && bytes[1] == 0x49 && bytes[2] == 0x2a && bytes[3] == 0x00)
                || (bytes[0] == 0x4d && bytes[1] == 0x4d && bytes[2] == 0x00 && bytes[3] == 0x2a));
    }

    private static bool ValidDimension(int value)
    {
        return value > 0;
    }

    private static string? RgbaToPngDataUri(byte[] rgba, int width, int height)
    {
        var pngBytes = EncodePng(rgba, width, height);
        return $"data:image/png;base64,{Convert.ToBase64String(pngBytes)}";
    }

    private static ushort ReadUInt16BE(byte[] bytes, int offset)
    {
        return (ushort)((bytes[offset] << 8) | bytes[offset + 1]);
    }

    private static ushort ReadUInt16LE(byte[] bytes, int offset)
    {
        return (ushort)(bytes[offset] | (bytes[offset + 1] << 8));
    }

    private static short ReadInt16BE(byte[] bytes, int offset)
    {
        return unchecked((short)ReadUInt16BE(bytes, offset));
    }

    private static short ReadInt16LE(byte[] bytes, int offset)
    {
        return unchecked((short)ReadUInt16LE(bytes, offset));
    }

    private static uint ReadUInt32BE(byte[] bytes, int offset)
    {
        return (uint)((bytes[offset] << 24) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3]);
    }

    private static uint ReadUInt32LE(byte[] bytes, int offset)
    {
        return (uint)(bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16) | (bytes[offset + 3] << 24));
    }

    private static int ReadInt32BE(byte[] bytes, int offset)
    {
        return unchecked((int)ReadUInt32BE(bytes, offset));
    }

    private static int ReadInt32LE(byte[] bytes, int offset)
    {
        return unchecked((int)ReadUInt32LE(bytes, offset));
    }

    private static byte[] EncodePng(byte[] rgba, int width, int height)
    {
        using var stream = new MemoryStream();
        stream.Write(new byte[] { 137, 80, 78, 71, 13, 10, 26, 10 }, 0, 8);
        WriteChunk(stream, "IHDR", PngHeader(width, height));

        var scanlines = new byte[(width * 4 + 1) * height];
        for (var y = 0; y < height; y++)
            Buffer.BlockCopy(rgba, y * width * 4, scanlines, y * (width * 4 + 1) + 1, width * 4);
        WriteChunk(stream, "IDAT", ZlibStore(scanlines));
        WriteChunk(stream, "IEND", Array.Empty<byte>());
        return stream.ToArray();
    }

    private static byte[] PngHeader(int width, int height)
    {
        var data = new byte[13];
        SetU32BE(data, 0, (uint)width);
        SetU32BE(data, 4, (uint)height);
        data[8] = 8;
        data[9] = 6;
        return data;
    }

    private static byte[] ZlibStore(byte[] data)
    {
        using var stream = new MemoryStream();
        stream.WriteByte(0x78);
        stream.WriteByte(0x01);
        var offset = 0;
        while (offset < data.Length)
        {
            var length = Math.Min(65535, data.Length - offset);
            var final = offset + length >= data.Length;
            stream.WriteByte((byte)(final ? 1 : 0));
            stream.WriteByte((byte)(length & 0xff));
            stream.WriteByte((byte)(length >> 8));
            var nlen = length ^ 0xffff;
            stream.WriteByte((byte)(nlen & 0xff));
            stream.WriteByte((byte)(nlen >> 8));
            stream.Write(data, offset, length);
            offset += length;
        }

        SetU32BE(stream, Adler32(data));
        return stream.ToArray();
    }

    private static void WriteChunk(Stream stream, string type, byte[] data)
    {
        var typeBytes = System.Text.Encoding.ASCII.GetBytes(type);
        SetU32BE(stream, (uint)data.Length);
        stream.Write(typeBytes, 0, typeBytes.Length);
        stream.Write(data, 0, data.Length);
        var crcBytes = new byte[typeBytes.Length + data.Length];
        Buffer.BlockCopy(typeBytes, 0, crcBytes, 0, typeBytes.Length);
        Buffer.BlockCopy(data, 0, crcBytes, typeBytes.Length, data.Length);
        SetU32BE(stream, Crc32(crcBytes));
    }

    private static uint Adler32(byte[] data)
    {
        const uint mod = 65521;
        uint a = 1;
        uint b = 0;
        foreach (var value in data)
        {
            a = (a + value) % mod;
            b = (b + a) % mod;
        }

        return (b << 16) | a;
    }

    private static uint Crc32(byte[] data)
    {
        uint crc = 0xffffffff;
        foreach (var value in data)
        {
            crc ^= value;
            for (var bit = 0; bit < 8; bit++)
                crc = (crc & 1) != 0 ? 0xedb88320 ^ (crc >> 1) : crc >> 1;
        }

        return crc ^ 0xffffffff;
    }

    private static void SetU32BE(Stream stream, uint value)
    {
        stream.WriteByte((byte)(value >> 24));
        stream.WriteByte((byte)(value >> 16));
        stream.WriteByte((byte)(value >> 8));
        stream.WriteByte((byte)value);
    }

    private static void SetU32BE(byte[] bytes, int offset, uint value)
    {
        bytes[offset] = (byte)(value >> 24);
        bytes[offset + 1] = (byte)(value >> 16);
        bytes[offset + 2] = (byte)(value >> 8);
        bytes[offset + 3] = (byte)value;
    }

    private static byte[] Slice(byte[] bytes, int offset, int count)
    {
        var result = new byte[count];
        Buffer.BlockCopy(bytes, offset, result, 0, count);
        return result;
    }

    private static byte[] Append(byte[] bytes, byte value)
    {
        var result = new byte[bytes.Length + 1];
        Buffer.BlockCopy(bytes, 0, result, 0, bytes.Length);
        result[bytes.Length] = value;
        return result;
    }

    private static int At(int[] values, int index, int fallback)
    {
        return index >= 0 && index < values.Length ? values[index] : fallback;
    }
}

internal sealed class TiffReader
{
    public TiffReader(
        bool littleEndian,
        Func<byte[], int, ushort> readUInt16,
        Func<byte[], int, short> readInt16,
        Func<byte[], int, uint> readUInt32,
        Func<byte[], int, int> readInt32)
    {
        LittleEndian = littleEndian;
        ReadUInt16 = readUInt16;
        ReadInt16 = readInt16;
        ReadUInt32 = readUInt32;
        ReadInt32 = readInt32;
    }

    public bool LittleEndian { get; }

    public Func<byte[], int, ushort> ReadUInt16 { get; }

    public Func<byte[], int, short> ReadInt16 { get; }

    public Func<byte[], int, uint> ReadUInt32 { get; }

    public Func<byte[], int, int> ReadInt32 { get; }
}

internal sealed class TiffImage
{
    public int Width { get; set; }

    public int Height { get; set; }

    public int[] BitsPerSample { get; set; } = Array.Empty<int>();

    public int Compression { get; set; }

    public int Photometric { get; set; }

    public int[] StripOffsets { get; set; } = Array.Empty<int>();

    public int[] StripByteCounts { get; set; } = Array.Empty<int>();

    public int SamplesPerPixel { get; set; }

    public int RowsPerStrip { get; set; }

    public int PlanarConfiguration { get; set; }

    public int[]? ColorMap { get; set; }

    public int[] ExtraSamples { get; set; } = Array.Empty<int>();

    public int Orientation { get; set; }

    public int Predictor { get; set; }
}

internal enum TiffTag
{
    ImageWidth = 256,
    ImageLength = 257,
    BitsPerSample = 258,
    Compression = 259,
    PhotometricInterpretation = 262,
    StripOffsets = 273,
    Orientation = 274,
    SamplesPerPixel = 277,
    RowsPerStrip = 278,
    StripByteCounts = 279,
    PlanarConfiguration = 284,
    Predictor = 317,
    ColorMap = 320,
    ExtraSamples = 338,
}

internal enum TiffType
{
    Byte = 1,
    Ascii = 2,
    Short = 3,
    Long = 4,
    SByte = 6,
    Undefined = 7,
    SShort = 8,
    SLong = 9,
}
