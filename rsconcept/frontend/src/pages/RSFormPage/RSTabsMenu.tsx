'use client';

import { BiAnalyse, BiDiamond, BiDownload, BiDuplicate, BiMenu, BiMeteor, BiPlusCircle, BiTrash, BiUpload } from 'react-icons/bi';
import { FiEdit } from 'react-icons/fi';
import { LuCrown, LuGlasses } from 'react-icons/lu';

import Button from '@/components/Common/Button';
import Dropdown from '@/components/Common/Dropdown';
import DropdownButton from '@/components/Common/DropdownButton';
import { ShareIcon } from '@/components/Icons';
import { useAccessMode } from '@/context/AccessModeContext';
import { useAuth } from '@/context/AuthContext';
import { useConceptNavigation } from '@/context/NagivationContext';
import { useRSForm } from '@/context/RSFormContext';
import useDropdown from '@/hooks/useDropdown';
import { UserAccessMode } from '@/models/miscelanious';
import { describeAccessMode, labelAccessMode } from '@/utils/labels';

interface RSTabsMenuProps {
  isMutable: boolean

  showUploadDialog: () => void
  showCloneDialog: () => void
  
  onDestroy: () => void
  onClaim: () => void
  onShare: () => void
  onDownload: () => void
  onReindex: () => void
  onTemplates: () => void
}

function RSTabsMenu({
  isMutable,
  showUploadDialog, showCloneDialog,
  onDestroy, onShare, onDownload,
  onClaim, onReindex, onTemplates
}: RSTabsMenuProps) {
  const router = useConceptNavigation();
  const { user } = useAuth();
  const { isOwned, isClaimable } = useRSForm();

  const { mode, setMode } = useAccessMode();

  const schemaMenu = useDropdown();
  const editMenu = useDropdown();
  const accessMenu = useDropdown();

  function handleClaimOwner() {
    editMenu.hide();
    onClaim();
  }

  function handleDelete() {
    schemaMenu.hide();
    onDestroy();
  }

  function handleDownload () {
    schemaMenu.hide();
    onDownload();
  }

  function handleUpload() {
    schemaMenu.hide();
    showUploadDialog();
  }

  function handleClone() {
    schemaMenu.hide();
    showCloneDialog();
  }

  function handleShare() {
    schemaMenu.hide();
    onShare();
  }

  function handleReindex() {
    editMenu.hide();
    onReindex();
  }

  function handleTemplates() {
    editMenu.hide();
    onTemplates();
  }

  function handleChangeMode(newMode: UserAccessMode) {
    accessMenu.hide();
    setMode(newMode);
  }

  function handleCreateNew() {
    router.push('/rsform-create');
  }

  return (    
  <div className='flex items-stretch h-full w-fit'>
    <div ref={schemaMenu.ref}>
      <Button noBorder dense tabIndex={-1}
        tooltip='Меню'
        icon={<BiMenu size='1.25rem' className='clr-text-controls' />}
        dimensions='h-full w-fit pl-2'
        style={{outlineColor: 'transparent'}}
        onClick={schemaMenu.toggle}
      />
      {schemaMenu.isActive ?
      <Dropdown>
        <DropdownButton
          text={isOwned ? 'Вы — владелец' : 'Стать владельцем'}
          tooltip={!user || !isClaimable ? 'Взять во владение можно общую изменяемую схему' : ''}
          icon={<LuCrown size='1rem' className={isOwned ? 'clr-text-success' : 'clr-text-controls'} />}
          onClick={(!isOwned && user && isClaimable) ? handleClaimOwner : undefined}
        />
        <DropdownButton
          text='Поделиться'
          icon={<ShareIcon size='1rem' className='clr-text-primary' />}
          onClick={handleShare}
        />
        <DropdownButton disabled={!user}
          text='Клонировать'
          icon={<BiDuplicate size='1rem' className='clr-text-primary' />}
          onClick={handleClone}
        />
        <DropdownButton
          text='Выгрузить в Экстеор'
          icon={<BiDownload size='1rem' className='clr-text-primary'/>}
          onClick={handleDownload}
        />
        <DropdownButton disabled={!isMutable}
          text='Загрузить из Экстеора'
          icon={<BiUpload size='1rem' className={isMutable ? 'clr-text-warning' : ''} />}
          onClick={handleUpload}
        />
        <DropdownButton disabled={!isMutable}
          text='Удалить схему'
          icon={<BiTrash size='1rem' className={isMutable ? 'clr-text-warning' : ''} />}
          onClick={handleDelete}
        />
        <DropdownButton
          text='Создать новую схему'
          icon={<BiPlusCircle size='1rem' className='clr-text-url' />}
          onClick={handleCreateNew}
        />
      </Dropdown> : null}
    </div>
    
    <div ref={editMenu.ref}>
      <Button dense noBorder tabIndex={-1}
        tooltip={'Редактирование'}
        dimensions='h-full w-fit'
        style={{outlineColor: 'transparent'}}
        icon={<FiEdit size='1.25rem' className={isMutable ? 'clr-text-success' : 'clr-text-warning'}/>}
        onClick={editMenu.toggle}
      />
      {editMenu.isActive ?
      <Dropdown>
        <DropdownButton disabled={!isMutable}
          text='Сброс имён'
          tooltip='Присвоить порядковые имена и обновить выражения'
          icon={<BiAnalyse size='1rem' className={isMutable ? 'clr-text-primary': ''} />}
          onClick={handleReindex}
        />
        <DropdownButton disabled={!isMutable}
          text='Банк выражений'
          tooltip='Создать конституенту из шаблона'
          icon={<BiDiamond size='1rem' className={isMutable ? 'clr-text-success': ''} />}
          onClick={handleTemplates}
        />
      </Dropdown>: null}
    </div>

    <div ref={accessMenu.ref}>
      <Button dense noBorder tabIndex={-1}
        tooltip={`режим ${labelAccessMode(mode)}`}
        dimensions='h-full w-fit pr-2'
        style={{outlineColor: 'transparent'}}
        icon={
          mode === UserAccessMode.ADMIN ? <BiMeteor size='1.25rem' className='clr-text-primary'/>
          : mode === UserAccessMode.OWNER ? <LuCrown size='1.25rem' className='clr-text-primary'/>
          : <LuGlasses size='1.25rem' className='clr-text-primary'/>
        }
        onClick={accessMenu.toggle}
      />
      {accessMenu.isActive ?
      <Dropdown>
        <DropdownButton
          text={labelAccessMode(UserAccessMode.READER)}
          tooltip={describeAccessMode(UserAccessMode.READER)}
          icon={<LuGlasses size='1rem' className='clr-text-primary' />}
          onClick={() => handleChangeMode(UserAccessMode.READER)}
        />
        <DropdownButton disabled={!isOwned}
          text={labelAccessMode(UserAccessMode.OWNER)}
          tooltip={describeAccessMode(UserAccessMode.OWNER)}
          icon={<LuCrown size='1rem' className={isOwned ? 'clr-text-primary': ''} />}
          onClick={() => handleChangeMode(UserAccessMode.OWNER)}
        />
        <DropdownButton disabled={!user?.is_staff}
          text={labelAccessMode(UserAccessMode.ADMIN)}
          tooltip={describeAccessMode(UserAccessMode.ADMIN)}
          icon={<BiMeteor size='1rem' className={user?.is_staff ? 'clr-text-primary': ''} />}
          onClick={() => handleChangeMode(UserAccessMode.ADMIN)}
        />
      </Dropdown>: null}
    </div>
  </div>);
}

export default RSTabsMenu;