'use client';

import fileDownload from 'js-file-download';

import { urls, useConceptNavigation } from '@/app';
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
import { useAuthSuspense } from '@/features/auth/backend/useAuth';
import { AccessPolicy, LocationHead } from '@/features/library/models/library';
import { OssTabID } from '@/features/oss/pages/OssPage/OssEditContext';
import { useRoleStore } from '@/features/users';
import { UserRole } from '@/features/users/models/user';
import { useDialogsStore } from '@/stores/dialogs';
import { useModificationStore } from '@/stores/modification';
import { EXTEOR_TRS_FILE } from '@/utils/constants';
import { describeAccessMode, labelAccessMode, tooltipText } from '@/utils/labels';
import { generatePageQR, promptUnsaved, sharePage } from '@/utils/utils';

import { useDownloadRSForm } from '../../backend/useDownloadRSForm';
import { useMutatingRSForm } from '../../backend/useMutatingRSForm';
import { useProduceStructure } from '../../backend/useProduceStructure';
import { useResetAliases } from '../../backend/useResetAliases';
import { useRestoreOrder } from '../../backend/useRestoreOrder';
import { CstType } from '../../models/rsform';
import { useRSEdit } from './RSEditContext';

function MenuRSTabs() {
  const controller = useRSEdit();
  const router = useConceptNavigation();
  const { user, isAnonymous } = useAuthSuspense();

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

  // TODO: move into separate function
  const canProduceStructure =
    !!controller.activeCst &&
    !!controller.activeCst.parse.typification &&
    controller.activeCst.cst_type !== CstType.BASE &&
    controller.activeCst.cst_type !== CstType.CONSTANT;

  function calculateCloneLocation() {
    const location = controller.schema.location;
    const head = location.substring(0, 2) as LocationHead;
    if (head === LocationHead.LIBRARY) {
      return user.is_staff ? location : LocationHead.USER;
    }
    if (controller.schema.owner === user.id) {
      return location;
    }
    return head === LocationHead.USER ? LocationHead.USER : location;
  }

  function handleDelete() {
    schemaMenu.hide();
    controller.deleteSchema();
  }

  function handleDownload() {
    schemaMenu.hide();
    if (isModified && !promptUnsaved()) {
      return;
    }
    const fileName = (controller.schema.alias ?? 'Schema') + EXTEOR_TRS_FILE;
    void download({
      itemID: controller.schema.id,
      version: controller.schema.version
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
    showUpload({ itemID: controller.schema.id });
  }

  function handleClone() {
    schemaMenu.hide();
    if (isModified && !promptUnsaved()) {
      return;
    }
    showClone({
      base: controller.schema,
      initialLocation: calculateCloneLocation(),
      selected: controller.selected,
      totalCount: controller.schema.items.length
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
    void resetAliases({ itemID: controller.schema.id });
  }

  function handleRestoreOrder() {
    editMenu.hide();
    void restoreOrder({ itemID: controller.schema.id });
  }

  function handleSubstituteCst() {
    editMenu.hide();
    if (isModified && !promptUnsaved()) {
      return;
    }
    showSubstituteCst({
      schema: controller.schema,
      onSubstitute: data =>
        controller.setSelected(prev => prev.filter(id => !data.substitutions.find(sub => sub.original === id)))
    });
  }

  function handleTemplates() {
    editMenu.hide();
    controller.promptTemplate();
  }

  function handleProduceStructure() {
    editMenu.hide();
    if (!controller.activeCst) {
      return;
    }
    if (isModified && !promptUnsaved()) {
      return;
    }
    void produceStructure({
      itemID: controller.schema.id,
      data: { target: controller.activeCst.id }
    }).then(cstList => {
      if (cstList.length !== 0) {
        controller.setSelected(cstList);
      }
    });
  }

  function handleInlineSynthesis() {
    editMenu.hide();
    if (isModified && !promptUnsaved()) {
      return;
    }
    showInlineSynthesis({
      receiver: controller.schema,
      onSynthesis: () => controller.deselectAll()
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
            titleHtml={tooltipText.shareItem(controller.schema.access_policy)}
            icon={<IconShare size='1rem' className='icon-primary' />}
            onClick={handleShare}
            disabled={controller.schema.access_policy !== AccessPolicy.PUBLIC}
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
              disabled={controller.isArchive}
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
              text='Загрузить из Экстеор'
              icon={<IconUpload size='1rem' className='icon-red' />}
              disabled={isProcessing || controller.schema.oss.length !== 0}
              onClick={handleUpload}
            />
          ) : null}
          {controller.isMutable ? (
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
          {controller.schema.oss.length > 0 ? (
            <DropdownButton
              text='Перейти к ОСС'
              icon={<IconOSS size='1rem' className='icon-primary' />}
              onClick={() => router.push(urls.oss(controller.schema.oss[0].id, OssTabID.GRAPH))}
            />
          ) : null}
          <DropdownButton
            text='Библиотека'
            icon={<IconLibrary size='1rem' className='icon-primary' />}
            onClick={() => router.push(urls.library)}
          />
        </Dropdown>
      </div>
      {!controller.isArchive && !isAnonymous ? (
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
              disabled={!controller.isContentEditable || isProcessing}
              onClick={handleTemplates}
            />
            <DropdownButton
              text='Встраивание'
              titleHtml='Импортировать совокупность <br/>конституент из другой схемы'
              icon={<IconInlineSynthesis size='1rem' className='icon-green' />}
              disabled={!controller.isContentEditable || isProcessing}
              onClick={handleInlineSynthesis}
            />

            <Divider margins='mx-3 my-1' />

            <DropdownButton
              text='Упорядочить список'
              titleHtml='Упорядочить список, исходя из <br/>логики типов и связей конституент'
              icon={<IconSortList size='1rem' className='icon-primary' />}
              disabled={!controller.isContentEditable || isProcessing}
              onClick={handleRestoreOrder}
            />
            <DropdownButton
              text='Порядковые имена'
              titleHtml='Присвоить порядковые имена <br/>и обновить выражения'
              icon={<IconGenerateNames size='1rem' className='icon-primary' />}
              disabled={!controller.isContentEditable || isProcessing}
              onClick={handleReindex}
            />
            <DropdownButton
              text='Порождение структуры'
              titleHtml='Раскрыть структуру типизации <br/>выделенной конституенты'
              icon={<IconGenerateStructure size='1rem' className='icon-primary' />}
              disabled={!controller.isContentEditable || !canProduceStructure || isProcessing}
              onClick={handleProduceStructure}
            />
            <DropdownButton
              text='Отождествление'
              titleHtml='Заменить вхождения <br/>одной конституенты на другую'
              icon={<IconReplace size='1rem' className='icon-red' />}
              onClick={handleSubstituteCst}
              disabled={!controller.isContentEditable || isProcessing}
            />
          </Dropdown>
        </div>
      ) : null}
      {controller.isArchive && !isAnonymous ? (
        <Button
          dense
          noBorder
          noOutline
          tabIndex={-1}
          titleHtml='<b>Архив</b>: Редактирование запрещено<br />Перейти к актуальной версии'
          hideTitle={accessMenu.isOpen}
          className='h-full px-2'
          icon={<IconArchive size='1.25rem' className='icon-primary' />}
          onClick={event => router.push(urls.schema(controller.schema.id), event.ctrlKey || event.metaKey)}
        />
      ) : null}
      {!isAnonymous ? (
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
              disabled={!controller.isOwned && (!user.id || !controller.schema.editors.includes(user.id))}
              onClick={() => handleChangeMode(UserRole.EDITOR)}
            />
            <DropdownButton
              text={labelAccessMode(UserRole.OWNER)}
              title={describeAccessMode(UserRole.OWNER)}
              icon={<IconOwner size='1rem' className='icon-primary' />}
              disabled={!controller.isOwned}
              onClick={() => handleChangeMode(UserRole.OWNER)}
            />
            <DropdownButton
              text={labelAccessMode(UserRole.ADMIN)}
              title={describeAccessMode(UserRole.ADMIN)}
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

export default MenuRSTabs;
