'use client';

import { BiDiamond, BiMenu } from 'react-icons/bi';
import { FiEdit } from 'react-icons/fi';
import { LuAlertTriangle, LuArchive, LuBookCopy, LuNetwork, LuWand2 } from 'react-icons/lu';
import { VscLibrary } from 'react-icons/vsc';

import { urls } from '@/app/urls';
import {
  IconAdmin,
  IconClone,
  IconDestroy,
  IconDownload,
  IconNewItem,
  IconOwner,
  IconReader,
  IconReplace,
  IconShare,
  IconUpload
} from '@/components/Icons';
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
          icon={<BiMenu size='1.25rem' className='clr-text-controls' />}
          className='h-full pl-2'
          onClick={schemaMenu.toggle}
        />
        <Dropdown isOpen={schemaMenu.isOpen}>
          {user ? (
            <DropdownButton
              text={model.isOwned ? 'Вы — владелец' : 'Стать владельцем'}
              icon={<IconOwner size='1rem' className='icon-green' />}
              disabled={!model.isClaimable && !model.isOwned}
              onClick={!model.isOwned && model.isClaimable ? handleClaimOwner : undefined}
            />
          ) : null}
          <DropdownButton
            text='Поделиться'
            icon={<IconShare size='1rem' className='icon-primary' />}
            onClick={handleShare}
          />
          {user ? (
            <DropdownButton
              text='Клонировать'
              icon={<IconClone size='1rem' className='icon-primary' />}
              disabled={model.isArchive}
              onClick={handleClone}
            />
          ) : null}
          <DropdownButton
            text='Выгрузить в Экстеор'
            icon={<IconDownload size='1rem' className='icon-primary' />}
            onClick={handleDownload}
          />
          {controller.isContentEditable ? (
            <DropdownButton
              text='Загрузить из Экстеора'
              icon={<IconUpload size='1rem' className='icon-red' />}
              disabled={controller.isProcessing}
              onClick={handleUpload}
            />
          ) : null}
          {controller.isMutable ? (
            <DropdownButton
              text='Удалить схему'
              icon={<IconDestroy size='1rem' className='icon-red' />}
              disabled={controller.isProcessing}
              onClick={handleDelete}
            />
          ) : null}
          {user ? (
            <DropdownButton
              className='border-t-2'
              text='Создать новую схему'
              icon={<IconNewItem size='1rem' className='icon-primary' />}
              onClick={handleCreateNew}
            />
          ) : null}
          <DropdownButton
            text='Библиотека'
            icon={<VscLibrary size='1rem' className='icon-primary' />}
            onClick={() => router.push(urls.library)}
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
            className='h-full px-2'
            icon={<FiEdit size='1.25rem' className={controller.isContentEditable ? 'icon-green' : 'icon-red'} />}
            onClick={editMenu.toggle}
          />
          <Dropdown isOpen={editMenu.isOpen}>
            <DropdownButton
              text='Шаблоны'
              title='Создать конституенту из шаблона'
              icon={<BiDiamond size='1rem' className='icon-green' />}
              disabled={!controller.isContentEditable || controller.isProcessing}
              onClick={handleTemplates}
            />
            <DropdownButton
              text='Встраивание'
              title='Импортировать совокупность конституент из другой схемы'
              icon={<LuBookCopy size='1rem' className='icon-green' />}
              disabled={!controller.isContentEditable || controller.isProcessing}
              onClick={handleInlineSynthesis}
            />
            <DropdownButton
              className='border-t-2'
              text='Порядковые имена'
              title='Присвоить порядковые имена и обновить выражения'
              icon={<LuWand2 size='1rem' className='icon-primary' />}
              disabled={!controller.isContentEditable || controller.isProcessing}
              onClick={handleReindex}
            />
            <DropdownButton
              text='Порождение структуры'
              title='Раскрыть структуру типизации выделенной конституенты'
              icon={<LuNetwork size='1rem' className='icon-primary' />}
              disabled={!controller.isContentEditable || !controller.canProduceStructure}
              onClick={handleProduceStructure}
            />
            <DropdownButton
              text='Отождествление'
              title='Заменить вхождения одной конституенты на другую'
              icon={<IconReplace size='1rem' className='icon-red' />}
              onClick={handleSubstituteCst}
              disabled={!controller.isContentEditable || controller.isProcessing}
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
                <IconAdmin size='1.25rem' className='icon-primary' />
              ) : mode === UserAccessMode.OWNER ? (
                <IconOwner size='1.25rem' className='icon-primary' />
              ) : (
                <IconReader size='1.25rem' className='icon-primary' />
              )
            }
            onClick={accessMenu.toggle}
          />
          <Dropdown isOpen={accessMenu.isOpen}>
            <DropdownButton
              text={labelAccessMode(UserAccessMode.READER)}
              title={describeAccessMode(UserAccessMode.READER)}
              icon={<IconReader size='1rem' className='icon-primary' />}
              onClick={() => handleChangeMode(UserAccessMode.READER)}
            />
            <DropdownButton
              text={labelAccessMode(UserAccessMode.OWNER)}
              title={describeAccessMode(UserAccessMode.OWNER)}
              icon={<IconOwner size='1rem' className='icon-primary' />}
              disabled={!model.isOwned}
              onClick={() => handleChangeMode(UserAccessMode.OWNER)}
            />
            <DropdownButton
              text={labelAccessMode(UserAccessMode.ADMIN)}
              title={describeAccessMode(UserAccessMode.ADMIN)}
              icon={<IconAdmin size='1rem' className='icon-primary' />}
              disabled={!user?.is_staff}
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
