namespace BaseHmiTypes.Screens.Base;

public abstract class HmiModelBase
{
    public string? Id { get; set; }

    public string? Name { get; set; }
}

public abstract class HmiScreenModelBase : HmiModelBase
{
}

public abstract class HmiScreenBase : HmiScreenModelBase
{
    public IList<HmiLayer> Layers { get; } = new List<HmiLayer>();
}

public class HmiLayer : HmiModelBase
{
    public bool Visible { get; set; } = true;

    public bool Locked { get; set; }

    public IList<HmiScreenItemBase> Items { get; } = new List<HmiScreenItemBase>();
}

public abstract class HmiScreenItemBase : HmiScreenModelBase
{
    public double X { get; set; }

    public double Y { get; set; }

    public double Width { get; set; }

    public double Height { get; set; }

    public bool Visible { get; set; } = true;
}

public abstract class HmiLayoutContainerBase : HmiScreenItemBase
{
    public IList<HmiScreenItemBase> Items { get; } = new List<HmiScreenItemBase>();
}

public abstract class HmiSimpleScreenItemBase : HmiScreenItemBase
{
}

public abstract class HmiWindowBase : HmiScreenItemBase
{
}

public class HmiGroup : HmiLayoutContainerBase
{
}

public class HmiCustomWidgetContainer : HmiSimpleScreenItemBase
{
}

public abstract class HmiContainerBase : HmiWindowBase
{
    public IList<HmiScreenItemBase> Items { get; } = new List<HmiScreenItemBase>();
}

public abstract class HmiControlWindowBase : HmiWindowBase
{
}

public class HmiDcsFaceplateContainer : HmiWindowBase
{
}

public class HmiSymbolContainer : HmiCustomWidgetContainer
{
}

public class HmiCustomWebControlContainer : HmiContainerBase
{
}

public class HmiDotNetControlContainer : HmiContainerBase
{
}

public class HmiFaceplateContainer : HmiContainerBase
{
}

public class HmiSwacContainer : HmiContainerBase
{
}

public class HmiFaceplateType : HmiScreenBase
{
}

public abstract class HmiCompanionBase : HmiControlWindowBase
{
}

public abstract class HmiTrendControlBase : HmiControlWindowBase
{
}
