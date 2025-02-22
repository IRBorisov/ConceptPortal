'use client';

import fileDownload from 'js-file-download';

import { urls, useConceptNavigation } from '@/app';
import { useAuthSuspense } from '@/features/auth';
import { AccessPolicy } from '@/features/library';
import { LocationHead } from '@/features/library/models/library';
import { useRoleStore, UserRole } from '@/features/users';
import { describeUserRole, labelUserRole } from '@/features/users/labels';

import { Divider } from '@/components/Container';
import { Button } from '@/components/Control';
import { Dropdown, DropdownButton, useDropdown } from '@/components/Dropdown';
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
import { useDialogsStore } from '@/stores/dialogs';
import { useModificationStore } from '@/stores/modification';
import { EXTEOR_TRS_FILE } from '@/utils/constants';
import { tooltipText } from '@/utils/labels';
import { generatePageQR, promptUnsaved, sharePage } from '@/utils/utils';

import { useDownloadRSForm } from '../../backend/useDownloadRSForm';
import { useMutatingRSForm } from '../../backend/useMutatingRSForm';
import { useProduceStructure } from '../../backend/useProduceStructure';
import { useResetAliases } from '../../backend/useResetAliases';
import { useRestoreOrder } from '../../backend/useRestoreOrder';
import { canProduceStructure } from '../../models/rsformAPI';

import { useRSEdit } from './RSEditContext';

export function MenuRSTabs() {
  const router = useConceptNavigation();
  const { user, isAnonymous } = useAuthSuspense();
  const {
    activeCst,
    schema,
    selected,
    setSelected,
    deleteSchema,
    promptTemplate,
    deselectAll,
    isArchive,
    isMutable,
    isContentEditable,
    isOwned
  } = useRSEdit();

  const role = useRoleStore(state => state.role);
  const setRole = useRoleStore(state => state.setRole);
  const { isModified } = useModificationStore();
  const isProcessing = useMutatingRSForm();

  const { resetAliases } = useResetAliases();
  const { restoreOrder } = useRestoreOrder();
  const { produceStructure } = useProduceStructure();
  const { download } = useDownloadRSForm();

  const showInlineSynthesis = useDialogsStore(state => state.showInlineSynthesis);
  const showQR = useDialogsStore(state => state.showQR);
  const showSubstituteCst = useDialogsStore(state => state.showSubstituteCst);
  const showClone = useDialogsStore(state => state.showCloneLibraryItem);
  const showUpload = useDialogsStore(state => state.showUploadRSForm);

  const schemaMenu = useDropdown();
  const editMenu = useDropdown();
  const accessMenu = useDropdown();

  const structureEnabled = !!activeCst && canProduceStructure(activeCst);

  function calculateCloneLocation() {
    const location = schema.location;
    const head = location.substring(0, 2) as LocationHead;
    if (head === LocationHead.LIBRARY) {
      return user.is_staff ? location : LocationHead.USER;
    }
    if (schema.owner === user.id) {
      return location;
    }
    return head === LocationHead.USER ? LocationHead.USER : location;
  }

  function handleDelete() {
    schemaMenu.hide();
    deleteSchema();
  }

  function handleDownload() {
    schemaMenu.hide();
    if (isModified && !promptUnsaved()) {
      return;
    }
    const fileName = (schema.alias ?? 'Schema') + EXTEOR_TRS_FILE;
    void download({
      itemID: schema.id,
      version: schema.version === 'latest' ? undefined : schema.version
    }).then((data: Blob) => {
      try {
        fileDownload(data, fileName);
      } catch (error) {
        console.error(error);
      }
    });
  }

  function handleUpload() {
    schemaMenu.hide();
    showUpload({ itemID: schema.id });
  }

  function handleClone() {
    schemaMenu.hide();
    if (isModified && !promptUnsaved()) {
      return;
    }
    showClone({
      base: schema,
      initialLocation: calculateCloneLocation(),
      selected: selected,
      totalCount: schema.items.length
    });
  }

  function handleShare() {
    schemaMenu.hide();
    sharePage();
  }

  function handleShowQR() {
    schemaMenu.hide();
    showQR({ target: generatePageQR() });
  }

  function handleReindex() {
    editMenu.hide();
    void resetAliases({ itemID: schema.id });
  }

  function handleRestoreOrder() {
    editMenu.hide();
    void restoreOrder({ itemID: schema.id });
  }

  function handleSubstituteCst() {
    editMenu.hide();
    if (isModified && !promptUnsaved()) {
      return;
    }
    showSubstituteCst({
      schema: schema,
      onSubstitute: data => setSelected(prev => prev.filter(id => !data.substitutions.find(sub => sub.original === id)))
    });
  }

  function handleTemplates() {
    editMenu.hide();
    promptTemplate();
  }

  function handleProduceStructure() {
    editMenu.hide();
    if (!activeCst) {
      return;
    }
    if (isModified && !promptUnsaved()) {
      return;
    }
    void produceStructure({
      itemID: schema.id,
      cstID: activeCst.id
    }).then(cstList => {
      if (cstList.length !== 0) {
        setSelected(cstList);
      }
    });
  }

  function handleInlineSynthesis() {
    editMenu.hide();
    if (isModified && !promptUnsaved()) {
      return;
    }
    showInlineSynthesis({
      receiver: schema,
      onSynthesis: () => deselectAll()
    });
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
    <div className='flex border-r-2'>
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
            titleHtml={tooltipText.shareItem(schema.access_policy === AccessPolicy.PUBLIC)}
            icon={<IconShare size='1rem' className='icon-primary' />}
            onClick={handleShare}
            disabled={schema.access_policy !== AccessPolicy.PUBLIC}
          />
          <DropdownButton
            text='QR-код'
            title='Показать QR-код схемы'
            icon={<IconQR size='1rem' className='icon-primary' />}
            onClick={handleShowQR}
          />
          {!isAnonymous ? (
            <DropdownButton
              text='Клонировать'
              icon={<IconClone size='1rem' className='icon-green' />}
              disabled={isArchive}
              onClick={handleClone}
            />
          ) : null}
          <DropdownButton
            text='Выгрузить в Экстеор'
            icon={<IconDownload size='1rem' className='icon-primary' />}
            onClick={handleDownload}
          />
          {isContentEditable ? (
            <DropdownButton
              text='Загрузить из Экстеор'
              icon={<IconUpload size='1rem' className='icon-red' />}
              disabled={isProcessing || schema.oss.length !== 0}
              onClick={handleUpload}
            />
          ) : null}
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
          {schema.oss.length > 0 ? (
            <DropdownButton
              text='Перейти к ОСС'
              icon={<IconOSS size='1rem' className='icon-primary' />}
              onClick={() => router.push(urls.oss(schema.oss[0].id))}
            />
          ) : null}
          <DropdownButton
            text='Библиотека'
            icon={<IconLibrary size='1rem' className='icon-primary' />}
            onClick={() => router.push(urls.library)}
          />
        </Dropdown>
      </div>
      {!isArchive && !isAnonymous ? (
        <div ref={editMenu.ref}>
          <Button
            dense
            noBorder
            noOutline
            tabIndex={-1}
            title='Редактирование'
            hideTitle={editMenu.isOpen}
            className='h-full px-2'
            icon={<IconEdit2 size='1.25rem' className={isContentEditable ? 'icon-green' : 'icon-red'} />}
            onClick={editMenu.toggle}
          />
          <Dropdown isOpen={editMenu.isOpen}>
            <DropdownButton
              text='Шаблоны'
              title='Создать конституенту из шаблона'
              icon={<IconTemplates size='1rem' className='icon-green' />}
              disabled={!isContentEditable || isProcessing}
              onClick={handleTemplates}
            />
            <DropdownButton
              text='Встраивание'
              titleHtml='Импортировать совокупность <br/>конституент из другой схемы'
              icon={<IconInlineSynthesis size='1rem' className='icon-green' />}
              disabled={!isContentEditable || isProcessing}
              onClick={handleInlineSynthesis}
            />

            <Divider margins='mx-3 my-1' />

            <DropdownButton
              text='Упорядочить список'
              titleHtml='Упорядочить список, исходя из <br/>логики типов и связей конституент'
              icon={<IconSortList size='1rem' className='icon-primary' />}
              disabled={!isContentEditable || isProcessing}
              onClick={handleRestoreOrder}
            />
            <DropdownButton
              text='Порядковые имена'
              titleHtml='Присвоить порядковые имена <br/>и обновить выражения'
              icon={<IconGenerateNames size='1rem' className='icon-primary' />}
              disabled={!isContentEditable || isProcessing}
              onClick={handleReindex}
            />
            <DropdownButton
              text='Порождение структуры'
              titleHtml='Раскрыть структуру типизации <br/>выделенной конституенты'
              icon={<IconGenerateStructure size='1rem' className='icon-primary' />}
              disabled={!isContentEditable || !structureEnabled || isProcessing}
              onClick={handleProduceStructure}
            />
            <DropdownButton
              text='Отождествление'
              titleHtml='Заменить вхождения <br/>одной конституенты на другую'
              icon={<IconReplace size='1rem' className='icon-red' />}
              onClick={handleSubstituteCst}
              disabled={!isContentEditable || isProcessing}
            />
          </Dropdown>
        </div>
      ) : null}
      {isArchive && !isAnonymous ? (
        <Button
          dense
          noBorder
          noOutline
          tabIndex={-1}
          titleHtml='<b>Архив</b>: Редактирование запрещено<br />Перейти к актуальной версии'
          hideTitle={accessMenu.isOpen}
          className='h-full px-2'
          icon={<IconArchive size='1.25rem' className='icon-primary' />}
          onClick={event => router.push(urls.schema(schema.id), event.ctrlKey || event.metaKey)}
        />
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
              onClick={() => handleChangeMode(UserRole.READER)}
            />
            <DropdownButton
              text={labelUserRole(UserRole.EDITOR)}
              title={describeUserRole(UserRole.EDITOR)}
              icon={<IconEditor size='1rem' className='icon-primary' />}
              disabled={!isOwned && (!user.id || !schema.editors.includes(user.id))}
              onClick={() => handleChangeMode(UserRole.EDITOR)}
            />
            <DropdownButton
              text={labelUserRole(UserRole.OWNER)}
              title={describeUserRole(UserRole.OWNER)}
              icon={<IconOwner size='1rem' className='icon-primary' />}
              disabled={!isOwned}
              onClick={() => handleChangeMode(UserRole.OWNER)}
            />
            <DropdownButton
              text={labelUserRole(UserRole.ADMIN)}
              title={describeUserRole(UserRole.ADMIN)}
              icon={<IconAdmin size='1rem' className='icon-primary' />}
              disabled={!user.is_staff}
              onClick={() => handleChangeMode(UserRole.ADMIN)}
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
