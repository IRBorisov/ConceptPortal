'use client';

import {
  BiAnalyse,
  BiDiamond,
  BiDownload,
  BiDuplicate,
  BiMenu,
  BiMeteor,
  BiPlusCircle,
  BiShareAlt,
  BiTrash,
  BiUpload
} from 'react-icons/bi';
import { FiEdit } from 'react-icons/fi';
import { LuCrown, LuGlasses, LuReplace } from 'react-icons/lu';
import { VscLibrary } from 'react-icons/vsc';

import Button from '@/components/ui/Button';
import Divider from '@/components/ui/Divider';
import Dropdown from '@/components/ui/Dropdown';
import DropdownButton from '@/components/ui/DropdownButton';
import { useAccessMode } from '@/context/AccessModeContext';
import { useAuth } from '@/context/AuthContext';
import { useConceptNavigation } from '@/context/NavigationContext';
import { useRSForm } from '@/context/RSFormContext';
import useDropdown from '@/hooks/useDropdown';
import { UserAccessMode } from '@/models/miscellaneous';
import { describeAccessMode, labelAccessMode } from '@/utils/labels';

import { useRSEdit } from './RSEditContext';

interface RSTabsMenuProps {
  onDestroy: () => void;
}

function RSTabsMenu({ onDestroy }: RSTabsMenuProps) {
  const controller = useRSEdit();
  const router = useConceptNavigation();
  const { user } = useAuth();
  const { isOwned, isClaimable } = useRSForm();

  const { mode, setMode } = useAccessMode();

  const schemaMenu = useDropdown();
  const editMenu = useDropdown();
  const accessMenu = useDropdown();

  function handleClaimOwner() {
    editMenu.hide();
    controller.claim();
  }

  function handleDelete() {
    schemaMenu.hide();
    onDestroy();
  }

  function handleDownload() {
    schemaMenu.hide();
    controller.download();
  }

  function handleUpload() {
    schemaMenu.hide();
    controller.promptUpload();
  }

  function handleClone() {
    schemaMenu.hide();
    controller.promptClone();
  }

  function handleShare() {
    schemaMenu.hide();
    controller.share();
  }

  function handleReindex() {
    editMenu.hide();
    controller.reindex();
  }

  function handleSubstituteCst() {
    editMenu.hide();
    controller.substitute();
  }

  function handleTemplates() {
    editMenu.hide();
    controller.promptTemplate();
  }

  function handleChangeMode(newMode: UserAccessMode) {
    accessMenu.hide();
    setMode(newMode);
  }

  function handleCreateNew() {
    router.push('/library/create');
  }

  return (
    <div className='flex'>
      <div ref={schemaMenu.ref}>
        <Button
          noBorder
          dense
          tabIndex={-1}
          title='Меню'
          hideTitle={schemaMenu.isOpen}
          icon={<BiMenu size='1.25rem' className='clr-text-controls' />}
          className='h-full pl-2'
          style={{ outlineColor: 'transparent' }}
          onClick={schemaMenu.toggle}
        />
        <Dropdown isOpen={schemaMenu.isOpen}>
          <DropdownButton
            disabled={(!user || !isClaimable) && !isOwned}
            text={isOwned ? 'Вы — владелец' : 'Стать владельцем'}
            icon={<LuCrown size='1rem' className={isOwned ? 'clr-text-success' : ''} />}
            onClick={!isOwned && user && isClaimable ? handleClaimOwner : undefined}
          />
          <DropdownButton
            text='Поделиться'
            icon={<BiShareAlt size='1rem' className='clr-text-primary' />}
            onClick={handleShare}
          />
          <DropdownButton
            disabled={!user}
            text='Клонировать'
            icon={<BiDuplicate size='1rem' className='clr-text-primary' />}
            onClick={handleClone}
          />
          <DropdownButton
            text='Выгрузить в Экстеор'
            icon={<BiDownload size='1rem' className='clr-text-primary' />}
            onClick={handleDownload}
          />
          <DropdownButton
            disabled={!controller.isMutable}
            text='Загрузить из Экстеора'
            icon={<BiUpload size='1rem' className={controller.isMutable ? 'clr-text-warning' : ''} />}
            onClick={handleUpload}
          />
          <DropdownButton
            disabled={!controller.isMutable}
            text='Удалить схему'
            icon={<BiTrash size='1rem' className={controller.isMutable ? 'clr-text-warning' : ''} />}
            onClick={handleDelete}
          />

          <Divider />

          <DropdownButton
            text='Создать новую схему'
            icon={<BiPlusCircle size='1rem' className='clr-text-url' />}
            onClick={handleCreateNew}
          />
          <DropdownButton
            text='Библиотека'
            icon={<VscLibrary size='1rem' className='clr-text-url' />}
            onClick={() => router.push('/library')}
          />
        </Dropdown>
      </div>

      <div ref={editMenu.ref}>
        <Button
          dense
          noBorder
          tabIndex={-1}
          title={'Редактирование'}
          hideTitle={editMenu.isOpen}
          className='h-full'
          style={{ outlineColor: 'transparent' }}
          icon={<FiEdit size='1.25rem' className={controller.isMutable ? 'clr-text-success' : 'clr-text-warning'} />}
          onClick={editMenu.toggle}
        />
        <Dropdown isOpen={editMenu.isOpen}>
          <DropdownButton
            disabled={!controller.isMutable}
            text='Сброс имён'
            title='Присвоить порядковые имена и обновить выражения'
            icon={<BiAnalyse size='1rem' className={controller.isMutable ? 'clr-text-primary' : ''} />}
            onClick={handleReindex}
          />
          <DropdownButton
            disabled={!controller.isMutable}
            text='Банк выражений'
            title='Создать конституенту из шаблона'
            icon={<BiDiamond size='1rem' className={controller.isMutable ? 'clr-text-success' : ''} />}
            onClick={handleTemplates}
          />
          <DropdownButton
            disabled={!controller.isMutable}
            text='Отождествление'
            title='Заменить вхождения одной конституенты на другую'
            icon={<LuReplace size='1rem' className={controller.isMutable ? 'clr-text-primary' : ''} />}
            onClick={handleSubstituteCst}
          />
        </Dropdown>
      </div>

      <div ref={accessMenu.ref}>
        <Button
          dense
          noBorder
          tabIndex={-1}
          title={`Режим ${labelAccessMode(mode)}`}
          hideTitle={accessMenu.isOpen}
          className='h-full pr-2'
          style={{ outlineColor: 'transparent' }}
          icon={
            mode === UserAccessMode.ADMIN ? (
              <BiMeteor size='1.25rem' className='clr-text-primary' />
            ) : mode === UserAccessMode.OWNER ? (
              <LuCrown size='1.25rem' className='clr-text-primary' />
            ) : (
              <LuGlasses size='1.25rem' className='clr-text-primary' />
            )
          }
          onClick={accessMenu.toggle}
        />
        <Dropdown isOpen={accessMenu.isOpen}>
          <DropdownButton
            text={labelAccessMode(UserAccessMode.READER)}
            title={describeAccessMode(UserAccessMode.READER)}
            icon={<LuGlasses size='1rem' className='clr-text-primary' />}
            onClick={() => handleChangeMode(UserAccessMode.READER)}
          />
          <DropdownButton
            disabled={!isOwned}
            text={labelAccessMode(UserAccessMode.OWNER)}
            title={describeAccessMode(UserAccessMode.OWNER)}
            icon={<LuCrown size='1rem' className={isOwned ? 'clr-text-primary' : ''} />}
            onClick={() => handleChangeMode(UserAccessMode.OWNER)}
          />
          <DropdownButton
            disabled={!user?.is_staff}
            text={labelAccessMode(UserAccessMode.ADMIN)}
            title={describeAccessMode(UserAccessMode.ADMIN)}
            icon={<BiMeteor size='1rem' className={user?.is_staff ? 'clr-text-primary' : ''} />}
            onClick={() => handleChangeMode(UserAccessMode.ADMIN)}
          />
        </Dropdown>
      </div>
    </div>
  );
}

export default RSTabsMenu;
