using BaseHmiTypes.Images;

namespace BaseHmiTypes.Screens.Base;

public class HmiSymbolLibraryControl : HmiOcxControl
{
    public const string SiemensSymbolLibraryGuid = "3cd08690-fff0-11d3-b482-00105abbfd73";

    public HmiSymbolLibraryControl()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiSymbolLibraryControl;
        OcxGuid = SiemensSymbolLibraryGuid;
        OcxName = "Siemens HMI Symbol Library";
    }

    public string? SymbolId { get; set; }

    public HmiImage? Symbol { get; set; }

    public HmiProperty<HmiSymbolLibraryFillColorMode>? SymbolAppearance { get; set; }

    public HmiProperty<HmiSymbolLibraryFillColorMode>? FillColorMode { get; set; }

    public HmiProperty<HmiSymbolLibraryBlinkMode>? BlinkMode { get; set; }

    public HmiProperty<bool>? Stretch { get; set; }

    public HmiProperty<bool>? FixedAspectRatio { get; set; }

    public HmiProperty<HmiSymbolLibraryFlip>? Flip { get; set; }

    public HmiProperty<HmiColor>? FillColor { get; set; }

    public HmiProperty<HmiSymbolLibraryBlinkSpeed>? BlinkSpeed { get; set; }

    public HmiProperty<HmiColor>? BlinkColor { get; set; }

    public HmiProperty<HmiSymbolLibraryRotation>? Rotation { get; set; }

    public HmiProperty<HmiColor>? BackColor { get; set; }

    public HmiProperty<HmiSymbolLibraryBackFillStyle>? BackFillStyle { get; set; }

    public new HmiProperty<short>? Padding { get; set; }

    public HmiProperty<bool>? ChangeMouseCursor { get; set; }

    public HmiProperty<HmiColor>? ForeColor { get; set; }

    public HmiProperty<IntPtr>? Blob { get; set; }

    public HmiProperty<int>? Flashing { get; set; }

    public HmiProperty<bool>? FlashingOnLimitViolation { get; set; }

    public new HmiProperty<bool>? Enabled { get; set; }

    public HmiProperty<HmiColor>? AboveUpperLimitColor { get; set; }

    public HmiProperty<HmiColor>? BelowLowerLimitColor { get; set; }
}
