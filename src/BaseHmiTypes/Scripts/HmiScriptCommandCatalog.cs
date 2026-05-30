namespace BaseHmiTypes.Scripts;

public interface IHmiScriptCommandCatalog
{
    IReadOnlyList<HmiScriptCommandDefinition> Commands { get; }

    HmiScriptCommandDefinition? FindByKey(string key);

    HmiScriptCommandDefinition? FindByName(string name);

    HmiScriptCommand CreateCommandByKey(string key);

    HmiScriptCommand CreateCommand(string name);
}
