'use client';

import { urls } from '@/app/urls';
import {
  IconAdmin,
  IconAlert,
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
import Button from '@/components/ui/Button';
import Dropdown from '@/components/ui/Dropdown';
import DropdownButton from '@/components/ui/DropdownButton';
import DropdownDivider from '@/components/ui/DropdownDivider';
import { useAccessMode } from '@/context/AccessModeContext';
import { useAuth } from '@/context/AuthContext';
import { useConceptNavigation } from '@/context/NavigationContext';
import { useOSS } from '@/context/OssContext';
import useDropdown from '@/hooks/useDropdown';
import { UserLevel } from '@/models/user';
import { describeAccessMode, labelAccessMode } from '@/utils/labels';

import { useOssEdit } from './OssEditContext';

interface MenuOssTabsProps {
  onDestroy: () => void;
}

function MenuOssTabs({ onDestroy }: MenuOssTabsProps) {
  const controller = useOssEdit();
  const router = useConceptNavigation();
  const { user } = useAuth();
  const model = useOSS();

  const { accessLevel, setAccessLevel } = useAccessMode();

  const schemaMenu = useDropdown();
  const editMenu = useDropdown();
  const accessMenu = useDropdown();

  function handleDelete() {
    schemaMenu.hide();
    onDestroy();
  }

  function handleShare() {
    schemaMenu.hide();
    controller.share();
  }

  function handleChangeMode(newMode: UserLevel) {
    accessMenu.hide();
    setAccessLevel(newMode);
  }

  function handleCreateNew() {
    router.push(urls.create_schema);
  }

  function handleLogin() {
    router.push(urls.login);
  }

  return (
    <div className='flex'>
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
          {controller.isMutable ? (
            <DropdownButton
              text='Удалить схему'
              icon={<IconDestroy size='1rem' className='icon-red' />}
              disabled={controller.isProcessing || accessLevel < UserLevel.OWNER}
              onClick={handleDelete}
            />
          ) : null}

          <DropdownDivider margins='mx-3 my-1' />

          {user ? (
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

      {user ? (
        <div ref={editMenu.ref}>
          <Button
            dense
            noBorder
            noOutline
            tabIndex={-1}
            title='Редактирование'
            hideTitle={editMenu.isOpen}
            className='h-full px-2'
            icon={<IconEdit2 size='1.25rem' className={controller.isMutable ? 'icon-green' : 'icon-red'} />}
            onClick={editMenu.toggle}
          />
          <Dropdown isOpen={editMenu.isOpen}>
            <DropdownButton
              text='см. Граф синтеза'
              titleHtml='Редактирование доступно <br/>через Граф синтеза'
              disabled
            />
          </Dropdown>
        </div>
      ) : null}

      {user ? (
        <div ref={accessMenu.ref}>
          <Button
            dense
            noBorder
            noOutline
            tabIndex={-1}
            title={`Режим ${labelAccessMode(accessLevel)}`}
            hideTitle={accessMenu.isOpen}
            className='h-full pr-2'
            icon={
              accessLevel === UserLevel.ADMIN ? (
                <IconAdmin size='1.25rem' className='icon-primary' />
              ) : accessLevel === UserLevel.OWNER ? (
                <IconOwner size='1.25rem' className='icon-primary' />
              ) : accessLevel === UserLevel.EDITOR ? (
                <IconEditor size='1.25rem' className='icon-primary' />
              ) : (
                <IconReader size='1.25rem' className='icon-primary' />
              )
            }
            onClick={accessMenu.toggle}
          />
          <Dropdown isOpen={accessMenu.isOpen}>
            <DropdownButton
              text={labelAccessMode(UserLevel.READER)}
              title={describeAccessMode(UserLevel.READER)}
              icon={<IconReader size='1rem' className='icon-primary' />}
              onClick={() => handleChangeMode(UserLevel.READER)}
            />
            <DropdownButton
              text={labelAccessMode(UserLevel.EDITOR)}
              title={describeAccessMode(UserLevel.EDITOR)}
              icon={<IconEditor size='1rem' className='icon-primary' />}
              disabled={!model.isOwned && !model.schema?.editors.includes(user.id)}
              onClick={() => handleChangeMode(UserLevel.EDITOR)}
            />
            <DropdownButton
              text={labelAccessMode(UserLevel.OWNER)}
              title={describeAccessMode(UserLevel.OWNER)}
              icon={<IconOwner size='1rem' className='icon-primary' />}
              disabled={!model.isOwned}
              onClick={() => handleChangeMode(UserLevel.OWNER)}
            />
            <DropdownButton
              text={labelAccessMode(UserLevel.ADMIN)}
              title={describeAccessMode(UserLevel.ADMIN)}
              icon={<IconAdmin size='1rem' className='icon-primary' />}
              disabled={!user?.is_staff}
              onClick={() => handleChangeMode(UserLevel.ADMIN)}
            />
          </Dropdown>
        </div>
      ) : null}
      {!user ? (
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

export default MenuOssTabs;
