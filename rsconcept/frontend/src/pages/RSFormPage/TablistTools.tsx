import { useCallback } from 'react';
import Button from '../../components/Common/Button';
import Dropdown from '../../components/Common/Dropdown';
import { CrownIcon, DumpBinIcon, EyeIcon, EyeOffIcon, MenuIcon, PenIcon } from '../../components/Icons';
import { useRSForm } from '../../context/RSFormContext';
import useDropdown from '../../hooks/useDropdown';
import DropdownButton from '../../components/Common/DropdownButton';
import Checkbox from '../../components/Common/Checkbox';
import { useAuth } from '../../context/AuthContext';
import { claimOwnershipProc, deleteRSFormProc } from '../../utils/procedures';
import { useNavigate } from 'react-router-dom';

function TablistTools() {
  const navigate = useNavigate();
  const {user} = useAuth();
  const { 
    isOwned, isEditable, isTracking, readonly, forceAdmin,
    toggleTracking, toggleForceAdmin, toggleReadonly,
    claim, reload, destroy
  } = useRSForm();
  const schemaMenu = useDropdown();
  const editMenu = useDropdown();

  const handleClaimOwner = useCallback(() => {
    claimOwnershipProc(claim, reload)
  }, [claim, reload]);

  const handleDelete = 
    useCallback(() => deleteRSFormProc(destroy, navigate), [destroy, navigate]);
  
  return (
    <div className='flex items-center w-fit'>
      <div ref={schemaMenu.ref}>
        <Button
          tooltip='Действия'
          icon={<MenuIcon size={5}/>}
          borderClass=''
          dense
          onClick={schemaMenu.toggle} 
        />
        { schemaMenu.isActive &&
        <Dropdown>
          <p>клонировать</p>
          <p>поделиться</p>
          <DropdownButton disabled={isEditable} onClick={handleDelete}>
            <div className='inline-flex items-center gap-1 justify-normal'>
              <span className={isOwned ? 'text-red' : ''}><DumpBinIcon size={4} /></span>
              <p>Удалить схему</p>
            </div>
          </DropdownButton>
        </Dropdown>}
      </div>
      <div ref={editMenu.ref}>
        <Button
          tooltip={'измнение ' + (isEditable ? 'доступно': 'запрещено')}
          colorClass={ isEditable ? 'text-green': 'text-red'}
          borderClass=''
          icon={<PenIcon size={5}/>}
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
          <DropdownButton onClick={toggleReadonly}>
            <Checkbox value={readonly} label='только чтение'/>
          </DropdownButton>
          {user?.is_staff &&
          <DropdownButton onClick={toggleForceAdmin}>
            <Checkbox value={forceAdmin} label='режим администратора'/>
          </DropdownButton>}
        </Dropdown>}
      </div>
      <div>
        <Button
          tooltip={'отслеживание: ' + (isTracking ? 'включено': 'выключено')}
          icon={isTracking ? <EyeIcon size={5}/> : <EyeOffIcon size={5}/>}
          borderClass=''
          colorClass={isTracking ? 'text-primary': ''}
          dense
          onClick={toggleTracking} 
          />
      </div>
    </div>
  );
}

export default TablistTools

