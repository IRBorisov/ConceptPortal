import { globalTx } from '@/i18n';

import { UserRole } from './stores/role';

const ROLE_LABEL_LID: Record<UserRole, string> = {
  [UserRole.READER]: 'tx.general.reader',
  [UserRole.EDITOR]: 'tx.general.editor',
  [UserRole.OWNER]: 'tx.general.owner',
  [UserRole.ADMIN]: 'tx.general.admin'
};

const ROLE_DESC_LID: Record<UserRole, string> = {
  [UserRole.READER]: 'tx.general.reader.hint',
  [UserRole.EDITOR]: 'tx.general.editor.hint',
  [UserRole.OWNER]: 'tx.general.owner.hint',
  [UserRole.ADMIN]: 'tx.general.admin.hint'
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
