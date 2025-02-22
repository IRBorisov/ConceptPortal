import { UserRole } from './stores/role';

/**
 * Retrieves label for {@link UserRole}.
 */
export function labelUserRole(mode: UserRole): string {
  // prettier-ignore
  switch (mode) {
    case UserRole.READER:     return 'Читатель';
    case UserRole.EDITOR:     return 'Редактор';
    case UserRole.OWNER:      return 'Владелец';
    case UserRole.ADMIN:      return 'Администратор';
  }
}

/**
 * Retrieves description for {@link UserRole}.
 */
export function describeUserRole(mode: UserRole): string {
  // prettier-ignore
  switch (mode) {
    case UserRole.READER:
      return 'Режим запрещает редактирование';
    case UserRole.EDITOR:
      return 'Режим редактирования';
    case UserRole.OWNER:
      return 'Режим владельца';
    case UserRole.ADMIN:
      return 'Режим администратора';
  }
}
