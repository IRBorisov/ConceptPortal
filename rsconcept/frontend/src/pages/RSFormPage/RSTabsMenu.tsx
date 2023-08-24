import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import Button from '../../components/Common/Button';
import Checkbox from '../../components/Common/Checkbox';
import Dropdown from '../../components/Common/Dropdown';
import DropdownButton from '../../components/Common/DropdownButton';
import { CloneIcon, CrownIcon, DownloadIcon, DumpBinIcon, EyeIcon, EyeOffIcon, MenuIcon, PenIcon, PlusIcon, ShareIcon, UploadIcon } from '../../components/Icons';
import { useAuth } from '../../context/AuthContext';
import { useRSForm } from '../../context/RSFormContext';
import useDropdown from '../../hooks/useDropdown';
import { claimOwnershipProc, downloadRSFormProc, shareCurrentURLProc } from '../../utils/procedures';

interface RSTabsMenuProps {
  showUploadDialog: () => void
  showCloneDialog: () => void
  onDestroy: () => void
}

function RSTabsMenu({showUploadDialog, showCloneDialog, onDestroy}: RSTabsMenuProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    schema,
    isOwned, isEditable, isTracking, isReadonly: readonly, isForceAdmin: forceAdmin,
    toggleTracking, toggleForceAdmin, toggleReadonly,
    claim, download
  } = useRSForm();
  const schemaMenu = useDropdown();
  const editMenu = useDropdown();

  const handleClaimOwner = useCallback(() => {
    editMenu.hide();
    claimOwnershipProc(claim)
  }, [claim, editMenu]);

  const handleDelete = useCallback(() => {
    schemaMenu.hide();
    onDestroy();
  }, [onDestroy, schemaMenu]);

  const handleDownload = useCallback(() => {
    schemaMenu.hide();
    const fileName = (schema?.alias ?? 'Schema') + '.trs';
    downloadRSFormProc(download, fileName);
  }, [schemaMenu, download, schema?.alias]);

  const handleUpload = useCallback(() => {
    schemaMenu.hide();
    showUploadDialog();
  }, [schemaMenu, showUploadDialog]);

  const handleClone = useCallback(() => {
    schemaMenu.hide();
    showCloneDialog();
  }, [schemaMenu, showCloneDialog]);

  function handleShare() {
    schemaMenu.hide();
    shareCurrentURLProc();
  }

  function handleCreateNew() {
    navigate('/rsform-create');
  }

  return (    
    <div className='flex items-stretch w-fit'>
      <div ref={schemaMenu.ref}>
        <Button
          tooltip='Действия'
          icon={<MenuIcon size={5}/>}
          borderClass=''
          widthClass='h-full w-fit'
          dense
          onClick={schemaMenu.toggle}
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
          <DropdownButton onClick={handleDownload}>
            <div className='inline-flex items-center justify-start gap-2'>
              <DownloadIcon color='text-primary' size={4}/>
              <p>Выгрузить в Экстеор</p>
            </div>
          </DropdownButton>
          <DropdownButton disabled={!isEditable} onClick={handleUpload}>
            <div className='inline-flex items-center justify-start gap-2'>
              <UploadIcon color={isEditable ? 'text-red' : ''} size={4}/>
              <p>Загрузить из Экстеора</p>
            </div>
          </DropdownButton>
          <DropdownButton disabled={!isEditable} onClick={handleDelete}>
            <span className='inline-flex items-center justify-start gap-2'>
              <DumpBinIcon color={isEditable ? 'text-red' : ''} size={4} />
              <p>Удалить схему</p>
            </span>
          </DropdownButton>
          <DropdownButton onClick={handleCreateNew}>
            <span className='inline-flex items-center justify-start gap-2'>
              <PlusIcon color='text-url' size={4} />
              <p>Создать новую схему</p>
            </span>
          </DropdownButton>
        </Dropdown>}
      </div>
      <div ref={editMenu.ref}>
        <Button
          tooltip={'измнение: ' + (isEditable ? '[доступно]' : '[запрещено]')}
          borderClass=''
          widthClass='h-full w-fit'
          icon={<PenIcon size={5} color={isEditable ? 'text-green' : 'text-red'}/>}
          dense
          onClick={editMenu.toggle}
        />
        { editMenu.isActive &&
        <Dropdown>
          <DropdownButton disabled={!user} onClick={!isOwned ? handleClaimOwner : undefined}>
            <div className='inline-flex items-center gap-1 justify-normal'>
              <span className={isOwned ? 'text-green' : ''}><CrownIcon size={4} /></span>
              <p>
                { isOwned && <b>Владелец схемы</b> }
                { !isOwned && <b>Стать владельцем</b> }
              </p>
            </div>
          </DropdownButton>
          {(isOwned || user?.is_staff) &&
          <DropdownButton onClick={toggleReadonly}>
            <Checkbox 
              value={readonly}
              label='Я — читатель!'
              tooltip='Режим чтения'
            />
          </DropdownButton>}
          {user?.is_staff &&
          <DropdownButton onClick={toggleForceAdmin}>
            <Checkbox value={forceAdmin} label='режим администратора'/>
          </DropdownButton>}
        </Dropdown>}
      </div>
      <div>
        <Button
          tooltip={'отслеживание: ' + (isTracking ? '[включено]' : '[выключено]')}
          icon={isTracking
            ? <EyeIcon color='text-primary' size={5}/>
            : <EyeOffIcon size={5}/>
          }
          widthClass='h-full w-fit'
          borderClass=''
          dense
          onClick={toggleTracking}
          />
      </div>
    </div>
  );
}

export default RSTabsMenu
