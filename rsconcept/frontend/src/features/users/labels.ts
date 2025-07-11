import { UserRole } from './stores/role';

const labelUserRoleRecord: Record<UserRole, string> = {
  [UserRole.READER]: 'Читатель',
  [UserRole.EDITOR]: 'Редактор',
  [UserRole.OWNER]: 'Владелец',
  [UserRole.ADMIN]: 'Администратор'
};

const describeUserRoleRecord: Record<UserRole, string> = {
  [UserRole.READER]: 'Режим читателя',
  [UserRole.EDITOR]: 'Режим редактирования',
  [UserRole.OWNER]: 'Режим владельца',
  [UserRole.ADMIN]: 'Режим администратора'
};

/**
 * Retrieves label for {@link UserRole}.
 */
export function labelUserRole(mode: UserRole): string {
  return labelUserRoleRecord[mode] ?? `UNKNOWN USER ROLE: ${mode}`;
}

/**
 * Retrieves description for {@link UserRole}.
 */
export function describeUserRole(mode: UserRole): string {
  return describeUserRoleRecord[mode] ?? `UNKNOWN USER ROLE: ${mode}`;
}
