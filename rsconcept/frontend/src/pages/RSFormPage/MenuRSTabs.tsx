'use client';

import { urls } from '@/app/urls';
import {
  IconAdmin,
  IconAlert,
  IconArchive,
  IconClone,
  IconDestroy,
  IconDownload,
  IconEdit2,
  IconEditor,
  IconGenerateNames,
  IconGenerateStructure,
  IconInlineSynthesis,
  IconLibrary,
  IconMenu,
  IconNewItem,
  IconNewVersion,
  IconOSS,
  IconOwner,
  IconQR,
  IconReader,
  IconReplace,
  IconShare,
  IconSortList,
  IconTemplates,
  IconUpload
} from '@/components/Icons';
import Button from '@/components/ui/Button';
import Divider from '@/components/ui/Divider';
import Dropdown from '@/components/ui/Dropdown';
import DropdownButton from '@/components/ui/DropdownButton';
import { useAuth } from '@/context/AuthContext';
import { useGlobalOss } from '@/context/GlobalOssContext';
import { useConceptNavigation } from '@/context/NavigationContext';
import { useRSForm } from '@/context/RSFormContext';
import useDropdown from '@/hooks/useDropdown';
import { AccessPolicy } from '@/models/library';
import { UserRole } from '@/models/user';
import { useRoleStore } from '@/stores/role';
import { describeAccessMode, labelAccessMode, tooltips } from '@/utils/labels';

import { OssTabID } from '../OssPage/OssTabs';
import { useRSEdit } from './RSEditContext';

interface MenuRSTabsProps {
  onDestroy: () => void;
}

function MenuRSTabs({ onDestroy }: MenuRSTabsProps) {
  const controller = useRSEdit();
  const router = useConceptNavigation();
  const { user } = useAuth();
  const model = useRSForm();
  const oss = useGlobalOss();

  const role = useRoleStore(state => state.role);
  const setRole = useRoleStore(state => state.setRole);

  const schemaMenu = useDropdown();
  const editMenu = useDropdown();
  const accessMenu = useDropdown();

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

  function handleShowQR() {
    schemaMenu.hide();
    controller.showQR();
  }

  function handleCreateVersion() {
    schemaMenu.hide();
    controller.createVersion();
  }

  function handleReindex() {
    editMenu.hide();
    controller.reindex();
  }

  function handleRestoreOrder() {
    editMenu.hide();
    controller.reorder();
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

  function handleChangeMode(newMode: UserRole) {
    accessMenu.hide();
    setRole(newMode);
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
            titleHtml={tooltips.shareItem(controller.schema?.access_policy)}
            icon={<IconShare size='1rem' className='icon-primary' />}
            onClick={handleShare}
            disabled={controller.schema?.access_policy !== AccessPolicy.PUBLIC}
          />
          <DropdownButton
            text='QR-код'
            title='Показать QR-код схемы'
            icon={<IconQR size='1rem' className='icon-primary' />}
            onClick={handleShowQR}
          />
          {user ? (
            <DropdownButton
              text='Клонировать'
              icon={<IconClone size='1rem' className='icon-green' />}
              disabled={model.isArchive}
              onClick={handleClone}
            />
          ) : null}
          <DropdownButton
            text='Сохранить версию'
            disabled={!controller.isContentEditable}
            onClick={handleCreateVersion}
            icon={<IconNewVersion size='1rem' className='icon-green' />}
          />
          <DropdownButton
            text='Выгрузить в Экстеор'
            icon={<IconDownload size='1rem' className='icon-primary' />}
            onClick={handleDownload}
          />
          {controller.isContentEditable ? (
            <DropdownButton
              text='Загрузить из Экстеор'
              icon={<IconUpload size='1rem' className='icon-red' />}
              disabled={controller.isProcessing || controller.schema?.oss.length !== 0}
              onClick={handleUpload}
            />
          ) : null}
          {controller.isMutable ? (
            <DropdownButton
              text='Удалить схему'
              icon={<IconDestroy size='1rem' className='icon-red' />}
              disabled={controller.isProcessing || role < UserRole.OWNER}
              onClick={handleDelete}
            />
          ) : null}

          <Divider margins='mx-3 my-1' />

          {user ? (
            <DropdownButton
              text='Создать новую схему'
              icon={<IconNewItem size='1rem' className='icon-primary' />}
              onClick={handleCreateNew}
            />
          ) : null}
          {oss.schema ? (
            <DropdownButton
              text='Перейти к ОСС'
              icon={<IconOSS size='1rem' className='icon-primary' />}
              onClick={() => router.push(urls.oss(oss.schema!.id, OssTabID.GRAPH))}
            />
          ) : null}
          <DropdownButton
            text='Библиотека'
            icon={<IconLibrary size='1rem' className='icon-primary' />}
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
            title='Редактирование'
            hideTitle={editMenu.isOpen}
            className='h-full px-2'
            icon={<IconEdit2 size='1.25rem' className={controller.isContentEditable ? 'icon-green' : 'icon-red'} />}
            onClick={editMenu.toggle}
          />
          <Dropdown isOpen={editMenu.isOpen}>
            <DropdownButton
              text='Шаблоны'
              title='Создать конституенту из шаблона'
              icon={<IconTemplates size='1rem' className='icon-green' />}
              disabled={!controller.isContentEditable || controller.isProcessing}
              onClick={handleTemplates}
            />
            <DropdownButton
              text='Встраивание'
              titleHtml='Импортировать совокупность <br/>конституент из другой схемы'
              icon={<IconInlineSynthesis size='1rem' className='icon-green' />}
              disabled={!controller.isContentEditable || controller.isProcessing}
              onClick={handleInlineSynthesis}
            />

            <Divider margins='mx-3 my-1' />

            <DropdownButton
              text='Упорядочить список'
              titleHtml='Упорядочить список, исходя из <br/>логики типов и связей конституент'
              icon={<IconSortList size='1rem' className='icon-primary' />}
              disabled={!controller.isContentEditable || controller.isProcessing}
              onClick={handleRestoreOrder}
            />
            <DropdownButton
              text='Порядковые имена'
              titleHtml='Присвоить порядковые имена <br/>и обновить выражения'
              icon={<IconGenerateNames size='1rem' className='icon-primary' />}
              disabled={!controller.isContentEditable || controller.isProcessing}
              onClick={handleReindex}
            />
            <DropdownButton
              text='Порождение структуры'
              titleHtml='Раскрыть структуру типизации <br/>выделенной конституенты'
              icon={<IconGenerateStructure size='1rem' className='icon-primary' />}
              disabled={!controller.isContentEditable || !controller.canProduceStructure || controller.isProcessing}
              onClick={handleProduceStructure}
            />
            <DropdownButton
              text='Отождествление'
              titleHtml='Заменить вхождения <br/>одной конституенты на другую'
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
          className='h-full px-2'
          icon={<IconArchive size='1.25rem' className='icon-primary' />}
          onClick={event => controller.viewVersion(undefined, event.ctrlKey || event.metaKey)}
        />
      ) : null}

      {user ? (
        <div ref={accessMenu.ref}>
          <Button
            dense
            noBorder
            noOutline
            tabIndex={-1}
            title={`Режим ${labelAccessMode(role)}`}
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
              text={labelAccessMode(UserRole.READER)}
              title={describeAccessMode(UserRole.READER)}
              icon={<IconReader size='1rem' className='icon-primary' />}
              onClick={() => handleChangeMode(UserRole.READER)}
            />
            <DropdownButton
              text={labelAccessMode(UserRole.EDITOR)}
              title={describeAccessMode(UserRole.EDITOR)}
              icon={<IconEditor size='1rem' className='icon-primary' />}
              disabled={!model.isOwned && !model.schema?.editors.includes(user.id)}
              onClick={() => handleChangeMode(UserRole.EDITOR)}
            />
            <DropdownButton
              text={labelAccessMode(UserRole.OWNER)}
              title={describeAccessMode(UserRole.OWNER)}
              icon={<IconOwner size='1rem' className='icon-primary' />}
              disabled={!model.isOwned}
              onClick={() => handleChangeMode(UserRole.OWNER)}
            />
            <DropdownButton
              text={labelAccessMode(UserRole.ADMIN)}
              title={describeAccessMode(UserRole.ADMIN)}
              icon={<IconAdmin size='1rem' className='icon-primary' />}
              disabled={!user?.is_staff}
              onClick={() => handleChangeMode(UserRole.ADMIN)}
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

export default MenuRSTabs;
