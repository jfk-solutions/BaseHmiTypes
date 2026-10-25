namespace BaseHmiTypes.Projects;

/// <summary>Coordinates in the SVG viewBox, independent of display resolution.</summary>
public class HmiDeviceFrameBounds
{
    public double X { get; set; }
    public double Y { get; set; }
    public double Width { get; set; }
    public double Height { get; set; }
}

public enum HmiDeviceInputKind { RuntimeKey, HardwareSignal }

public enum HmiDeviceFrameLedEncoding { OffFastSlowOn, OffSlowFastOn, OffFlashRedGreen }

/// <summary>Assignment in a normalized logical LED image; no PLC address is inferred.</summary>
public class HmiDeviceFrameLedBinding
{
    public string OutputCode { get; set; } = string.Empty;
    public string? LedId { get; set; }
    public int BitIndex { get; set; }
    public int BitCount { get; set; } = 2;
}

public class HmiDeviceFrameLedRouting
{
    public HmiDeviceFrameLedEncoding Encoding { get; set; }
    public List<HmiDeviceFrameLedBinding> Bindings { get; } = new();
}

/// <summary>A physical HMI key or an adapter-owned hardware signal.</summary>
public class HmiDeviceFrameControl
{
    public string Id { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public HmiDeviceFrameBounds Bounds { get; set; } = new();
    public HmiDeviceInputKind InputKind { get; set; }
    /// <summary>Native key identity (e.g. F1, Enter), or adapter-specific hardware signal.</summary>
    public string InputCode { get; set; } = string.Empty;
}

public class HmiDeviceFrameLed
{
    public string Id { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public HmiDeviceFrameBounds Bounds { get; set; } = new();
    public string OffColor { get; set; } = "#343b32";
    public string OnColor { get; set; } = "#70ee54";
    /// <summary>Optional native output identity; protocol addressing belongs to the project/adapter.</summary>
    public string? OutputCode { get; set; }
}

/// <summary>Passive device artwork and geometry, without scripts or simulator state.</summary>
public class HmiDeviceFrame
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public bool IsSchematic { get; set; } = true;
    public double Width { get; set; }
    public double Height { get; set; }
    public string Svg { get; set; } = string.Empty;
    public HmiDeviceFrameBounds DisplayBounds { get; set; } = new();
    public int DisplayWidth { get; set; }
    public int DisplayHeight { get; set; }
    public List<HmiDeviceFrameControl> Controls { get; } = new();
    public List<HmiDeviceFrameLed> Leds { get; } = new();
}
