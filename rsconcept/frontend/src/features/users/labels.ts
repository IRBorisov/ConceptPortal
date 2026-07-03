import { globalTx } from '@/i18n';

import { UserRole } from './models/user-role';

const ROLE_LABEL_LID: Record<UserRole, string> = {
  [UserRole.READER]: 'tx.general.role.reader',
  [UserRole.EDITOR]: 'tx.general.role.editor',
  [UserRole.OWNER]: 'tx.general.role.owner',
  [UserRole.ADMIN]: 'tx.general.role.admin'
};

const ROLE_DESC_LID: Record<UserRole, string> = {
  [UserRole.READER]: 'tx.general.role.reader.hint',
  [UserRole.EDITOR]: 'tx.general.role.editor.hint',
  [UserRole.OWNER]: 'tx.general.role.owner.hint',
  [UserRole.ADMIN]: 'tx.general.role.admin.hint'
};

/** Retrieves label for {@link UserRole}. */
export function labelUserRole(mode: UserRole): string {
  const id = ROLE_LABEL_LID[mode];
  return id ? globalTx(id) : 'UNKNOWN USER ROLE:' + String(mode);
}

/** Retrieves description for {@link UserRole}. */
export function describeUserRole(mode: UserRole): string {
  const id = ROLE_DESC_LID[mode];
  return id ? globalTx(id) : 'UNKNOWN USER ROLE:' + String(mode);
}
