export interface LDAPWorkspaceFilter {
  uuid: string;
  name: string;
  description?: string;
  type: 'LDAP';
  creationDate?: number;
  modificationDate?: number;
  searchPageSize: number;
  searchAllGroupsQuery: string;
  searchGroupQuery: string;
  groupPrefixToRemove: string;
  groupNameAttribute: string;
  groupMemberAttribute: string;
  memberMailAttribute: string;
  memberFirstNameAttribute: string;
  memberLastNameAttribute: string;
}

export const EMPTY_FILTER: LDAPWorkspaceFilter = {
  uuid: '',
  name: '',
  groupMemberAttribute: '',
  groupPrefixToRemove: '',
  memberFirstNameAttribute: '',
  memberLastNameAttribute: '',
  memberMailAttribute: '',
  groupNameAttribute: '',
  searchAllGroupsQuery: '',
  searchGroupQuery: '',
  searchPageSize: 1,
  type: 'LDAP'
};
