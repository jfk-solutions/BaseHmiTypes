namespace BaseHmiTypes.Scripts.Commands;

/// <summary>Clear a source-defined message buffer, preserving its selector rather than an alarm class.</summary>
public sealed class ClearMessageBufferCommand : HmiScriptCommand
{
    public override string CommandName => "ClearMessageBuffer";
    public HmiScriptCommandArgument BufferType { get; }
    public ClearMessageBufferCommand()
    {
        BufferType = AddArgument(nameof(BufferType), "Buffer type", HmiScriptCommandParameterDirection.In);
    }
}
