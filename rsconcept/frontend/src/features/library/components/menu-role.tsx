'use client';

import { urls, useConceptNavigation } from '@/app';
import { useAuthSuspense } from '@/features/auth';
import { useRoleStore, UserRole } from '@/features/users';
import { describeUserRole, labelUserRole } from '@/features/users/labels';

import { MiniButton } from '@/components/control';
import { Dropdown, DropdownButton, useDropdown } from '@/components/dropdown';
import { IconAlert } from '@/components/icons';

import { IconRole } from './icon-role';

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
      <MiniButton
        noPadding
        titleHtml='<b>Анонимный режим</b><br />Войти в Портал'
        hideTitle={accessMenu.isOpen}
        className='h-full pr-2 pl-3 bg-transparent'
        icon={<IconAlert size='1.25rem' className='icon-red' />}
        onClick={() => router.push({ path: urls.login })}
      />
    );
  }

  return (
    <div ref={accessMenu.ref} onBlur={accessMenu.handleBlur} className='relative'>
      <MiniButton
        noHover
        noPadding
        title={`Режим ${labelUserRole(role)}`}
        hideTitle={accessMenu.isOpen}
        className='h-full pr-2 text-muted-foreground hover:text-primary cc-animate-color'
        icon={<IconRole value={role} size='1.25rem' className='' />}
        onClick={accessMenu.toggle}
      />
      <Dropdown isOpen={accessMenu.isOpen} margin='mt-3'>
        <DropdownButton
          text={labelUserRole(UserRole.READER)}
          title={describeUserRole(UserRole.READER)}
          icon={<IconRole value={UserRole.READER} size='1rem' />}
          onClick={() => handleChangeMode(UserRole.READER)}
        />
        <DropdownButton
          text={labelUserRole(UserRole.EDITOR)}
          title={describeUserRole(UserRole.EDITOR)}
          icon={<IconRole value={UserRole.EDITOR} size='1rem' />}
          onClick={() => handleChangeMode(UserRole.EDITOR)}
          disabled={!isOwned && !isEditor}
        />
        <DropdownButton
          text={labelUserRole(UserRole.OWNER)}
          title={describeUserRole(UserRole.OWNER)}
          icon={<IconRole value={UserRole.OWNER} size='1rem' />}
          onClick={() => handleChangeMode(UserRole.OWNER)}
          disabled={!isOwned}
        />
        {user.is_staff ? (
          <DropdownButton
            text={labelUserRole(UserRole.ADMIN)}
            title={describeUserRole(UserRole.ADMIN)}
            icon={<IconRole value={UserRole.ADMIN} size='1rem' />}
            onClick={() => handleChangeMode(UserRole.ADMIN)}
            disabled={!user.is_staff}
          />
        ) : null}
      </Dropdown>
    </div>
  );
}
