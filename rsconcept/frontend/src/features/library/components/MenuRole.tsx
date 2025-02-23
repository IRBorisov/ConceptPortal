import { urls, useConceptNavigation } from '@/app';
import { useAuthSuspense } from '@/features/auth';
import { useRoleStore, UserRole } from '@/features/users';
import { describeUserRole, labelUserRole } from '@/features/users/labels';

import { Button } from '@/components/Control';
import { Dropdown, DropdownButton, useDropdown } from '@/components/Dropdown';
import { IconAlert } from '@/components/Icons';

import { IconRole } from './IconRole';

interface MenuRoleProps {
  isOwned: boolean;
  isEditor: boolean;
}

export function MenuRole({ isOwned, isEditor }: MenuRoleProps) {
  const { user, isAnonymous } = useAuthSuspense();
  const router = useConceptNavigation();
  const accessMenu = useDropdown();

  const role = useRoleStore(state => state.role);
  const setRole = useRoleStore(state => state.setRole);

  function handleChangeMode(newMode: UserRole) {
    accessMenu.hide();
    setRole(newMode);
  }

  if (isAnonymous) {
    return (
      <Button
        dense
        noBorder
        noOutline
        tabIndex={-1}
        titleHtml='<b>Анонимный режим</b><br />Войти в Портал'
        hideTitle={accessMenu.isOpen}
        className='h-full pr-2'
        icon={<IconAlert size='1.25rem' className='icon-red' />}
        onClick={() => router.push(urls.login)}
      />
    );
  }

  return (
    <div ref={accessMenu.ref}>
      <Button
        dense
        noBorder
        noOutline
        tabIndex={-1}
        title={`Режим ${labelUserRole(role)}`}
        hideTitle={accessMenu.isOpen}
        className='h-full pr-2'
        icon={<IconRole role={role} size='1.25rem' />}
        onClick={accessMenu.toggle}
      />
      <Dropdown isOpen={accessMenu.isOpen}>
        <DropdownButton
          text={labelUserRole(UserRole.READER)}
          title={describeUserRole(UserRole.READER)}
          icon={<IconRole role={UserRole.READER} size='1rem' />}
          onClick={() => handleChangeMode(UserRole.READER)}
        />
        <DropdownButton
          text={labelUserRole(UserRole.EDITOR)}
          title={describeUserRole(UserRole.EDITOR)}
          icon={<IconRole role={UserRole.EDITOR} size='1rem' />}
          disabled={!isOwned && !isEditor}
          onClick={() => handleChangeMode(UserRole.EDITOR)}
        />
        <DropdownButton
          text={labelUserRole(UserRole.OWNER)}
          title={describeUserRole(UserRole.OWNER)}
          icon={<IconRole role={UserRole.OWNER} size='1rem' />}
          disabled={!isOwned}
          onClick={() => handleChangeMode(UserRole.OWNER)}
        />
        <DropdownButton
          text={labelUserRole(UserRole.ADMIN)}
          title={describeUserRole(UserRole.ADMIN)}
          icon={<IconRole role={UserRole.ADMIN} size='1rem' />}
          disabled={!user.is_staff}
          onClick={() => handleChangeMode(UserRole.ADMIN)}
        />
      </Dropdown>
    </div>
  );
}
