/** User role labels (library sharing / admin UI). */
export const usersLid = {
  role: {
    reader: 'labels.users.role.reader',
    editor: 'labels.users.role.editor',
    owner: 'labels.users.role.owner',
    admin: 'labels.users.role.admin'
  },
  roleDesc: {
    reader: 'labels.users.roleDesc.reader',
    editor: 'labels.users.roleDesc.editor',
    owner: 'labels.users.roleDesc.owner',
    admin: 'labels.users.roleDesc.admin'
  },
  fallback: {
    unknownRole: 'labels.users.fallback.unknownRole'
  }
} as const;

export const USERS_UI_DEFAULTS: Record<string, string> = {
  [usersLid.role.reader]: 'Reader',
  [usersLid.role.editor]: 'Editor',
  [usersLid.role.owner]: 'Owner',
  [usersLid.role.admin]: 'Administrator',

  [usersLid.roleDesc.reader]: 'Reader mode',
  [usersLid.roleDesc.editor]: 'Edit mode',
  [usersLid.roleDesc.owner]: 'Owner mode',
  [usersLid.roleDesc.admin]: 'Administrator mode',

  [usersLid.fallback.unknownRole]: 'UNKNOWN USER ROLE: {role}'
};
