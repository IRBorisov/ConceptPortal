import { formatLabel } from '@/app/i18n/labels/format-label';
import { usersLid } from '@/app/i18n/labels/users-ui';

import { UserRole } from './stores/role';

const ROLE_LABEL_LID: Record<UserRole, string> = {
  [UserRole.READER]: usersLid.role.reader,
  [UserRole.EDITOR]: usersLid.role.editor,
  [UserRole.OWNER]: usersLid.role.owner,
  [UserRole.ADMIN]: usersLid.role.admin
};

const ROLE_DESC_LID: Record<UserRole, string> = {
  [UserRole.READER]: usersLid.roleDesc.reader,
  [UserRole.EDITOR]: usersLid.roleDesc.editor,
  [UserRole.OWNER]: usersLid.roleDesc.owner,
  [UserRole.ADMIN]: usersLid.roleDesc.admin
};

/** Retrieves label for {@link UserRole}. */
export function labelUserRole(mode: UserRole): string {
  const id = ROLE_LABEL_LID[mode];
  return id ? formatLabel(id) : formatLabel(usersLid.fallback.unknownRole, { role: String(mode) });
}

/** Retrieves description for {@link UserRole}. */
export function describeUserRole(mode: UserRole): string {
  const id = ROLE_DESC_LID[mode];
  return id ? formatLabel(id) : formatLabel(usersLid.fallback.unknownRole, { role: String(mode) });
}
