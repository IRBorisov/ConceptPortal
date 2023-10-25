import { useNavigate } from 'react-router-dom';

import Button from '../../../components/Common/Button';
import Dropdown from '../../../components/Common/Dropdown';
import DropdownButton from '../../../components/Common/DropdownButton';
import DropdownCheckbox from '../../../components/Common/DropdownCheckbox';
import {
  CloneIcon, DiamondIcon, DownloadIcon, DumpBinIcon, EditIcon, MenuIcon, NotSubscribedIcon,
OwnerIcon, ShareIcon, SmallPlusIcon, SubscribedIcon,   UploadIcon
} from '../../../components/Icons';
import { useAuth } from '../../../context/AuthContext';
import { useRSForm } from '../../../context/RSFormContext';
import useDropdown from '../../../hooks/useDropdown';

interface RSTabsMenuProps {
  showUploadDialog: () => void
  showCloneDialog: () => void
  onDestroy: () => void
  onClaim: () => void
  onShare: () => void
  onDownload: () => void
  onToggleSubscribe: () => void
  onTemplates: () => void
}

function RSTabsMenu({
  showUploadDialog, showCloneDialog,
  onDestroy, onShare, onDownload, onClaim, onToggleSubscribe, onTemplates
}: RSTabsMenuProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    isOwned, isEditable, isTracking, isReadonly, isClaimable, isForceAdmin,
    toggleForceAdmin, toggleReadonly, processing
  } = useRSForm();
  const schemaMenu = useDropdown();
  const editMenu = useDropdown();

  function handleClaimOwner() {
    editMenu.hide();
    onClaim();
  }

  function handleDelete() {
    schemaMenu.hide();
    onDestroy();
  }
  
  function handleTemplates() {
    schemaMenu.hide();
    onTemplates();
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

  function handleCreateNew() {
    navigate('/rsform-create');
  }

  return (    
  <div className='flex items-stretch h-full w-fit'>
    <div ref={schemaMenu.ref}>
      <Button
        tooltip='Действия'
        icon={<MenuIcon color='text-controls' size={5}/>}
        borderClass=''
        dimensions='h-full w-fit pl-2'
        style={{outlineColor: 'transparent'}}
        dense
        onClick={schemaMenu.toggle}
        tabIndex={-1}
      />
      { schemaMenu.isActive &&
      <Dropdown>
        <DropdownButton onClick={handleShare}>
          <div className='inline-flex items-center justify-start gap-2'>
            <ShareIcon color='text-primary' size={4}/>
            <p>Поделиться</p>
          </div>
        </DropdownButton>
        <DropdownButton onClick={handleClone} disabled={!user} >
          <div className='inline-flex items-center justify-start gap-2'>
            <CloneIcon color='text-primary' size={4}/>
            <p>Клонировать</p>
          </div>
        </DropdownButton>
        <DropdownButton onClick={handleTemplates} disabled={!isEditable} >
          <div className='inline-flex items-center justify-start gap-2'>
            <DiamondIcon color={isEditable ? 'text-success' : ''} size={4}/>
            <p>Банк выражений</p>
          </div>
        </DropdownButton>
        <DropdownButton onClick={handleDownload}>
          <div className='inline-flex items-center justify-start gap-2'>
            <DownloadIcon color='text-primary' size={4}/>
            <p>Выгрузить в Экстеор</p>
          </div>
        </DropdownButton>
        <DropdownButton disabled={!isEditable} onClick={handleUpload}>
          <div className='inline-flex items-center justify-start gap-2'>
            <UploadIcon color={isEditable ? 'text-warning' : ''} size={4}/>
            <p>Загрузить из Экстеора</p>
          </div>
        </DropdownButton>
        <DropdownButton disabled={!isEditable} onClick={handleDelete}>
          <span className='inline-flex items-center justify-start gap-2'>
            <DumpBinIcon color={isEditable ? 'text-warning' : ''} size={4} />
            <p>Удалить схему</p>
          </span>
        </DropdownButton>
        <DropdownButton onClick={handleCreateNew}>
          <span className='inline-flex items-center justify-start gap-2'>
            <SmallPlusIcon color='text-url' size={4} />
            <p>Создать новую схему</p>
          </span>
        </DropdownButton>
      </Dropdown>}
    </div>
    <div ref={editMenu.ref}>
      <Button
        tooltip={'измнение: ' + (isEditable ? '[доступно]' : '[запрещено]')}
        borderClass=''
        dimensions='h-full w-fit'
        style={{outlineColor: 'transparent'}}
        icon={<EditIcon size={5} color={isEditable ? 'text-success' : 'text-warning'}/>}
        dense
        onClick={editMenu.toggle}
        tabIndex={-1}
      />
      { editMenu.isActive &&
      <Dropdown>
        <DropdownButton 
          disabled={!user || !isClaimable}
          onClick={!isOwned ? handleClaimOwner : undefined}
          tooltip={!user || !isClaimable ? 'Стать владельцем можно только для общей изменяемой схемы' : ''}
        >
          <div className='flex items-center gap-2 pl-1'>
            <span><OwnerIcon size={5} color={isOwned ? 'text-success' : 'text-controls'} /></span>
            <p>
              { isOwned && <b>Владелец схемы</b> }
              { !isOwned && <b>Стать владельцем</b> }
            </p>
          </div>
        </DropdownButton>
        {(isOwned || user?.is_staff) &&
        <DropdownCheckbox
          value={isReadonly}
          setValue={toggleReadonly}
          label='Я — читатель!'
          tooltip='Режим чтения'
        />}
        {user?.is_staff &&
        <DropdownCheckbox
          value={isForceAdmin}
          setValue={toggleForceAdmin}
          label='Я — администратор!'
          tooltip='Режим редактирования для администраторов'
        />}
      </Dropdown>}
    </div>
    <div>
      <Button
        tooltip={'отслеживание: ' + (isTracking ? '[включено]' : '[выключено]')}
        disabled={processing}
        icon={isTracking
          ? <SubscribedIcon color='text-primary' size={5}/>
          : <NotSubscribedIcon color='text-controls' size={5}/>
        }
        dimensions='h-full w-fit pr-2'
        borderClass=''
        style={{outlineColor: 'transparent'}}
        dense
        onClick={onToggleSubscribe}
        tabIndex={-1}
        />
    </div>
  </div>);
}

export default RSTabsMenu;