using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Widgets;

public class HmiIOField : HmiTextWidgetBase
{
    public HmiIOField()
    {
        HmiObjectType = BaseHmiTypes.Screens.Base.HmiObjectType.HmiIOField;
    }

    public HmiProperty<string>? HotKey { get; set; }

    public HmiProperty<bool>? MaskInput { get; set; }

    public HmiProperty<string>? FillCharacters { get; set; }

    public HmiProperty<HmiDecimalPointMode>? DecimalPointMode { get; set; }

    public HmiEnterHandshakeSettings? EnterHandshake { get; set; }
}
