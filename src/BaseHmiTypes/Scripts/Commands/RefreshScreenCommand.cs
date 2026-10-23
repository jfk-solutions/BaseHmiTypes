namespace BaseHmiTypes.Scripts.Commands;

/// <summary>Requests a fresh read of every process tag used by the active screen.</summary>
public sealed class RefreshScreenCommand : HmiScriptCommand
{
    public override string CommandName => "RefreshScreen";
}
