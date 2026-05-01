import { formatAppMessage } from '@/i18n/format-app-message';

import { useUsers } from './use-users';

export function useLabelUser() {
  const { users } = useUsers();

  function getUserLabel(userID: number | null): string {
    const user = users.find(({ id }) => id === userID);
    if (!user || userID === null) {
      return userID
        ? formatAppMessage('ui.users.anonymousWithId', 'Anonymous {id}', { id: userID.toString() })
        : formatAppMessage('ui.users.absent', 'Absent');
    }
    const hasFirstName = user.first_name !== '';
    const hasLastName = user.last_name !== '';
    if (hasFirstName || hasLastName) {
      if (!hasLastName) {
        return user.first_name;
      }
      if (!hasFirstName) {
        return user.last_name;
      }
      return user.last_name + ' ' + user.first_name;
    }
    return formatAppMessage('ui.users.anonymousWithId', 'Anonymous {id}', { id: userID.toString() });
  }
  return getUserLabel;
}
