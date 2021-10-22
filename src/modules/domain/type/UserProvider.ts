export interface OIDCUserProvider {
  uuid: string;
  creationDate?: number;
  modificationDate?: number;
  type?: 'OIDC_PROVIDER';
  domainDiscriminator?: string;
  checkExternalUserID?: boolean;
  useAccessClaim?: boolean;
  useRoleClaim?: boolean;
  useEmailLocaleClaim?: boolean
}

export interface LDAPUserProvider {
  uuid: string;
  creationDAte?: number;
  modificationDate?: number;
  type?: 'LDAP_PROVIDER';
  ldapServer?: {
    uuid: string;
    name: string;
  }
  userFilter?: {
    uuid: string;
    name: string;
  }
  baseDn?: string;
}

export const EMPTY_PROVIDER = {
  uuid: ''
};
