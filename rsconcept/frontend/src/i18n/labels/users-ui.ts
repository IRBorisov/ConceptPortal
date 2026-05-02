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
