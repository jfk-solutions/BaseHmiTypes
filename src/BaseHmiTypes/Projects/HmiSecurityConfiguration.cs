namespace BaseHmiTypes.Projects;

/// <summary>Public account metadata. Credential material remains with the project provider.</summary>
public class HmiSecurityUser
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public List<string> Roles { get; set; } = [];
    public uint? GroupNumber { get; set; }
    public bool Enabled { get; set; } = true;
    public bool Anonymous { get; set; }
    public bool CredentialAvailable { get; set; }
    public bool CanChangePassword { get; set; } = true;
    public int? SessionTimeoutMinutes { get; set; }
}

public class HmiSecurityRole
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public List<string> Authorizations { get; set; } = [];
    public bool AllAuthorizations { get; set; }
    public int? SessionTimeoutMinutes { get; set; }
}

public class HmiSecurityConfiguration
{
    public List<HmiSecurityUser> Users { get; set; } = [];
    public List<HmiSecurityRole> Roles { get; set; } = [];
    public string AdministrationAuthorization { get; set; } = "HMI.UserManagement";
    public bool PreventSelfAdministration { get; set; }
    public string? MonitorOnlyAuthorization { get; set; }
}
