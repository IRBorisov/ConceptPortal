import Button from '../../components/Common/Button';
import Dropdown from '../../components/Common/Dropdown';
import { EyeIcon, EyeOffIcon, MenuIcon, PenIcon } from '../../components/Icons';
import { useRSForm } from '../../context/RSFormContext';
import useDropdown from '../../hooks/useDropdown';

function TablistTools() {
  const { isEditable, isTracking, toggleTracking } = useRSForm();
  const schemaMenu = useDropdown();
  const editMenu = useDropdown();
  
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
          <p className='whitespace-nowrap'>стать владельцем</p>
          <p>клонировать</p>
          <p>поделиться</p>
          <p>удалить</p>
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
          <p className='whitespace-nowrap'>стать владельцем / уже владелец</p>
          <p>ридонли</p>
          <p>админ оверрайд</p>
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

