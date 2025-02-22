'use client';

import { urls, useConceptNavigation } from '@/app';
import { useAuthSuspense } from '@/features/auth';
import { useRoleStore, UserRole } from '@/features/users';
import { describeUserRole, labelUserRole } from '@/features/users/labels';

import { Divider } from '@/components/Container';
import { Button } from '@/components/Control';
import { Dropdown, DropdownButton, useDropdown } from '@/components/Dropdown';
import {
  IconAdmin,
  IconAlert,
  IconChild,
  IconDestroy,
  IconEdit2,
  IconEditor,
  IconLibrary,
  IconMenu,
  IconNewItem,
  IconOwner,
  IconReader,
  IconShare
} from '@/components/Icons';
import { sharePage } from '@/utils/utils';

import { useMutatingOss } from '../../backend/useMutatingOss';

import { useOssEdit } from './OssEditContext';

export function MenuOssTabs() {
  const { deleteSchema, promptRelocateConstituents, isMutable, isOwned, schema } = useOssEdit();
  const router = useConceptNavigation();
  const { user, isAnonymous } = useAuthSuspense();

  const isProcessing = useMutatingOss();

  const role = useRoleStore(state => state.role);
  const setRole = useRoleStore(state => state.setRole);

  const schemaMenu = useDropdown();
  const editMenu = useDropdown();
  const accessMenu = useDropdown();

  function handleDelete() {
    schemaMenu.hide();
    deleteSchema();
  }

  function handleShare() {
    schemaMenu.hide();
    sharePage();
  }

  function handleChangeRole(newMode: UserRole) {
    accessMenu.hide();
    setRole(newMode);
  }

  function handleCreateNew() {
    router.push(urls.create_schema);
  }

  function handleLogin() {
    router.push(urls.login);
  }

  function handleRelocate() {
    editMenu.hide();
    promptRelocateConstituents(undefined, []);
  }

  return (
    <div className='flex  border-r-2'>
      <div ref={schemaMenu.ref}>
        <Button
          dense
          noBorder
          noOutline
          tabIndex={-1}
          title='Меню'
          hideTitle={schemaMenu.isOpen}
          icon={<IconMenu size='1.25rem' className='clr-text-controls' />}
          className='h-full pl-2'
          onClick={schemaMenu.toggle}
        />
        <Dropdown isOpen={schemaMenu.isOpen}>
          <DropdownButton
            text='Поделиться'
            icon={<IconShare size='1rem' className='icon-primary' />}
            onClick={handleShare}
          />
          {isMutable ? (
            <DropdownButton
              text='Удалить схему'
              icon={<IconDestroy size='1rem' className='icon-red' />}
              disabled={isProcessing || role < UserRole.OWNER}
              onClick={handleDelete}
            />
          ) : null}

          <Divider margins='mx-3 my-1' />

          {!isAnonymous ? (
            <DropdownButton
              text='Создать новую схему'
              icon={<IconNewItem size='1rem' className='icon-primary' />}
              onClick={handleCreateNew}
            />
          ) : null}
          <DropdownButton
            text='Библиотека'
            icon={<IconLibrary size='1rem' className='icon-primary' />}
            onClick={() => router.push(urls.library)}
          />
        </Dropdown>
      </div>

      {!isAnonymous ? (
        <div ref={editMenu.ref}>
          <Button
            dense
            noBorder
            noOutline
            tabIndex={-1}
            title='Редактирование'
            hideTitle={editMenu.isOpen}
            className='h-full px-2'
            icon={<IconEdit2 size='1.25rem' className={isMutable ? 'icon-green' : 'icon-red'} />}
            onClick={editMenu.toggle}
          />
          <Dropdown isOpen={editMenu.isOpen}>
            <DropdownButton
              text='Конституенты'
              titleHtml='Перенос конституент</br>между схемами'
              icon={<IconChild size='1rem' className='icon-green' />}
              disabled={isProcessing}
              onClick={handleRelocate}
            />
          </Dropdown>
        </div>
      ) : null}

      {!isAnonymous ? (
        <div ref={accessMenu.ref}>
          <Button
            dense
            noBorder
            noOutline
            tabIndex={-1}
            title={`Режим ${labelUserRole(role)}`}
            hideTitle={accessMenu.isOpen}
            className='h-full pr-2'
            icon={
              role === UserRole.ADMIN ? (
                <IconAdmin size='1.25rem' className='icon-primary' />
              ) : role === UserRole.OWNER ? (
                <IconOwner size='1.25rem' className='icon-primary' />
              ) : role === UserRole.EDITOR ? (
                <IconEditor size='1.25rem' className='icon-primary' />
              ) : (
                <IconReader size='1.25rem' className='icon-primary' />
              )
            }
            onClick={accessMenu.toggle}
          />
          <Dropdown isOpen={accessMenu.isOpen}>
            <DropdownButton
              text={labelUserRole(UserRole.READER)}
              title={describeUserRole(UserRole.READER)}
              icon={<IconReader size='1rem' className='icon-primary' />}
              onClick={() => handleChangeRole(UserRole.READER)}
            />
            <DropdownButton
              text={labelUserRole(UserRole.EDITOR)}
              title={describeUserRole(UserRole.EDITOR)}
              icon={<IconEditor size='1rem' className='icon-primary' />}
              disabled={!isOwned && (!user.id || !schema.editors.includes(user.id))}
              onClick={() => handleChangeRole(UserRole.EDITOR)}
            />
            <DropdownButton
              text={labelUserRole(UserRole.OWNER)}
              title={describeUserRole(UserRole.OWNER)}
              icon={<IconOwner size='1rem' className='icon-primary' />}
              disabled={!isOwned}
              onClick={() => handleChangeRole(UserRole.OWNER)}
            />
            <DropdownButton
              text={labelUserRole(UserRole.ADMIN)}
              title={describeUserRole(UserRole.ADMIN)}
              icon={<IconAdmin size='1rem' className='icon-primary' />}
              disabled={!user.is_staff}
              onClick={() => handleChangeRole(UserRole.ADMIN)}
            />
          </Dropdown>
        </div>
      ) : null}
      {isAnonymous ? (
        <Button
          dense
          noBorder
          noOutline
          tabIndex={-1}
          titleHtml='<b>Анонимный режим</b><br />Войти в Портал'
          hideTitle={accessMenu.isOpen}
          className='h-full pr-2'
          icon={<IconAlert size='1.25rem' className='icon-red' />}
          onClick={handleLogin}
        />
      ) : null}
    </div>
  );
}
