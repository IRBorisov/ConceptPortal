'use client';

import {
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
import {
  LuAlertTriangle,
  LuArchive,
  LuBookCopy,
  LuCrown,
  LuGlasses,
  LuNetwork,
  LuReplace,
  LuWand2
} from 'react-icons/lu';
import { VscLibrary } from 'react-icons/vsc';

import Button from '@/components/ui/Button';
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
  const model = useRSForm();

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

  function handleProduceStructure() {
    editMenu.hide();
    controller.produceStructure();
  }

  function handleInlineSynthesis() {
    editMenu.hide();
    controller.inlineSynthesis();
  }

  function handleChangeMode(newMode: UserAccessMode) {
    accessMenu.hide();
    setMode(newMode);
  }

  function handleCreateNew() {
    router.push('/library/create');
  }

  function handleLogin() {
    router.push('/login');
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
          icon={<BiMenu size='1.25rem' className='clr-text-controls' />}
          className='h-full pl-2'
          onClick={schemaMenu.toggle}
        />
        <Dropdown isOpen={schemaMenu.isOpen}>
          {user ? (
            <DropdownButton
              disabled={!model.isClaimable && !model.isOwned}
              text={model.isOwned ? 'Вы — владелец' : 'Стать владельцем'}
              icon={<LuCrown size='1rem' className='icon-green' />}
              onClick={!model.isOwned && model.isClaimable ? handleClaimOwner : undefined}
            />
          ) : null}
          <DropdownButton
            text='Поделиться'
            icon={<BiShareAlt size='1rem' className='icon-primary' />}
            onClick={handleShare}
          />
          {user ? (
            <DropdownButton
              disabled={model.isArchive}
              text='Клонировать'
              icon={<BiDuplicate size='1rem' className='icon-primary' />}
              onClick={handleClone}
            />
          ) : null}
          <DropdownButton
            text='Выгрузить в Экстеор'
            icon={<BiDownload size='1rem' className='icon-primary' />}
            onClick={handleDownload}
          />
          {user ? (
            <DropdownButton
              disabled={!controller.isContentEditable}
              text='Загрузить из Экстеора'
              icon={<BiUpload size='1rem' className='icon-red' />}
              onClick={handleUpload}
            />
          ) : null}
          {controller.isMutable ? (
            <DropdownButton
              text='Удалить схему'
              icon={<BiTrash size='1rem' className='icon-red' />}
              onClick={handleDelete}
            />
          ) : null}
          {user ? (
            <DropdownButton
              className='border-t-2'
              text='Создать новую схему'
              icon={<BiPlusCircle size='1rem' className='icon-primary' />}
              onClick={handleCreateNew}
            />
          ) : null}
          <DropdownButton
            text='Библиотека'
            icon={<VscLibrary size='1rem' className='icon-primary' />}
            onClick={() => router.push('/library')}
          />
        </Dropdown>
      </div>

      {!model.isArchive && user ? (
        <div ref={editMenu.ref}>
          <Button
            dense
            noBorder
            noOutline
            tabIndex={-1}
            title={'Редактирование'}
            hideTitle={editMenu.isOpen}
            className='h-full'
            icon={<FiEdit size='1.25rem' className={controller.isContentEditable ? 'icon-green' : 'icon-red'} />}
            onClick={editMenu.toggle}
          />
          <Dropdown isOpen={editMenu.isOpen}>
            <DropdownButton
              disabled={!controller.isContentEditable}
              text='Банк выражений'
              title='Создать конституенту из шаблона'
              icon={<BiDiamond size='1rem' className='icon-green' />}
              onClick={handleTemplates}
            />
            <DropdownButton
              disabled={!controller.isContentEditable || !user.is_staff}
              text='Применить конструкт'
              title='Импортировать совокупность конституент из другой схемы'
              icon={<LuBookCopy size='1rem' className='icon-green' />}
              onClick={handleInlineSynthesis}
            />
            <DropdownButton
              disabled={!controller.isContentEditable}
              className='border-t-2'
              text='Сброс имён'
              title='Присвоить порядковые имена и обновить выражения'
              icon={<LuWand2 size='1rem' className='icon-primary' />}
              onClick={handleReindex}
            />
            <DropdownButton
              disabled={!controller.isContentEditable || !controller.canProduceStructure}
              text='Порождение структуры'
              title='Раскрыть структуру типизации выделенной конституенты'
              icon={<LuNetwork size='1rem' className='icon-primary' />}
              onClick={handleProduceStructure}
            />
            <DropdownButton
              disabled={!controller.isContentEditable}
              text='Отождествление'
              title='Заменить вхождения одной конституенты на другую'
              icon={<LuReplace size='1rem' className='icon-red' />}
              onClick={handleSubstituteCst}
            />
          </Dropdown>
        </div>
      ) : null}
      {model.isArchive && user ? (
        <Button
          dense
          noBorder
          noOutline
          tabIndex={-1}
          titleHtml='<b>Архив</b>: Редактирование запрещено<br />Перейти к актуальной версии'
          hideTitle={accessMenu.isOpen}
          className='h-full'
          icon={<LuArchive size='1.25rem' className='icon-primary' />}
          onClick={() => controller.viewVersion(undefined)}
        />
      ) : null}

      {user ? (
        <div ref={accessMenu.ref}>
          <Button
            dense
            noBorder
            noOutline
            tabIndex={-1}
            title={`Режим ${labelAccessMode(mode)}`}
            hideTitle={accessMenu.isOpen}
            className='h-full pr-2'
            icon={
              mode === UserAccessMode.ADMIN ? (
                <BiMeteor size='1.25rem' className='icon-primary' />
              ) : mode === UserAccessMode.OWNER ? (
                <LuCrown size='1.25rem' className='icon-primary' />
              ) : (
                <LuGlasses size='1.25rem' className='icon-primary' />
              )
            }
            onClick={accessMenu.toggle}
          />
          <Dropdown isOpen={accessMenu.isOpen}>
            <DropdownButton
              text={labelAccessMode(UserAccessMode.READER)}
              title={describeAccessMode(UserAccessMode.READER)}
              icon={<LuGlasses size='1rem' className='icon-primary' />}
              onClick={() => handleChangeMode(UserAccessMode.READER)}
            />
            <DropdownButton
              disabled={!model.isOwned}
              text={labelAccessMode(UserAccessMode.OWNER)}
              title={describeAccessMode(UserAccessMode.OWNER)}
              icon={<LuCrown size='1rem' className='icon-primary' />}
              onClick={() => handleChangeMode(UserAccessMode.OWNER)}
            />
            <DropdownButton
              disabled={!user?.is_staff}
              text={labelAccessMode(UserAccessMode.ADMIN)}
              title={describeAccessMode(UserAccessMode.ADMIN)}
              icon={<BiMeteor size='1rem' className='icon-primary' />}
              onClick={() => handleChangeMode(UserAccessMode.ADMIN)}
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
          icon={<LuAlertTriangle size='1.25rem' className='icon-red' />}
          onClick={handleLogin}
        />
      ) : null}
    </div>
  );
}

export default RSTabsMenu;
