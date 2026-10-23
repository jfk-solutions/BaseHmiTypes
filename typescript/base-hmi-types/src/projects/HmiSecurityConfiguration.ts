/** Public account metadata. Credential material remains with the project provider. */
export class HmiSecurityUser {
  id = '';
  name = '';
  roles: string[] = [];
  groupNumber?: number;
  enabled = true;
  anonymous = false;
  credentialAvailable = false;
  canChangePassword = true;
  sessionTimeoutMinutes?: number;
}

export class HmiSecurityRole {
  id = '';
  name = '';
  authorizations: string[] = [];
  allAuthorizations = false;
  sessionTimeoutMinutes?: number;
}

export class HmiSecurityConfiguration {
  users: HmiSecurityUser[] = [];
  roles: HmiSecurityRole[] = [];
  administrationAuthorization = 'HMI.UserManagement';
  preventSelfAdministration = false;
  monitorOnlyAuthorization?: string;
}
