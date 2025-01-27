import { useUsers } from './useUsers';

export function useLabelUser() {
  const { users } = useUsers();

  function getUserLabel(userID: number | null): string {
    const user = users.find(({ id }) => id === userID);
    if (!user || userID === null) {
      return userID ? `Аноним ${userID.toString()}` : 'Отсутствует';
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
    return `Аноним ${userID.toString()}`;
  }
  return getUserLabel;
}
