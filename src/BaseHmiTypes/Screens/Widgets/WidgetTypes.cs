using BaseHmiTypes.Screens.Base;

namespace BaseHmiTypes.Screens.Widgets;

public class HmiTouchArea : HmiScreenModelBase
{
}

public abstract class HmiWidgetBase : HmiSimpleScreenItemBase
{
}

public class HmiButton : HmiWidgetBase
{
    public string? Text { get; set; }
}

public class HmiToggleSwitch : HmiButton
{
}

public class HmiClock : HmiWidgetBase
{
}

public abstract class HmiScaleWidgetBase : HmiWidgetBase
{
}

public abstract class HmiSelectionGroupBase : HmiWidgetBase
{
    public IList<string> Items { get; } = new List<string>();
}

public abstract class HmiTextWidgetBase : HmiWidgetBase
{
    public string? Text { get; set; }
}

public class HmiBar : HmiScaleWidgetBase
{
}

public class HmiSlider : HmiBar
{
}

public class HmiGauge : HmiScaleWidgetBase
{
}

public class HmiCheckBoxGroup : HmiSelectionGroupBase
{
}

public class HmiComboBox : HmiSelectionGroupBase
{
}

public class HmiListBox : HmiSelectionGroupBase
{
}

public class HmiRadioButtonGroup : HmiSelectionGroupBase
{
}

public class HmiIOField : HmiTextWidgetBase
{
}

public class HmiLabel : HmiTextWidgetBase
{
}

public class HmiTextBox : HmiLabel
{
}

public class HmiSymbolicIOField : HmiTextWidgetBase
{
}

public class HmiAlarmIndicator : HmiSimpleScreenItemBase
{
}
