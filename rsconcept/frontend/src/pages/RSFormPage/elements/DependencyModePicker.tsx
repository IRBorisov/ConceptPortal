import { useCallback } from 'react';

import Dropdown from '../../../components/Common/Dropdown';
import DropdownButton from '../../../components/Common/DropdownButton';
import { CogIcon } from '../../../components/Icons';
import useDropdown from '../../../hooks/useDropdown';
import { DependencyMode } from '../../../models/miscelanious';
import { labelDependencyMode } from '../../../utils/labels';

interface DependencyModePickerProps {
  value: DependencyMode
  onChange: (value: DependencyMode) => void
}

function DependencyModePicker({ value, onChange }: DependencyModePickerProps) {
  const pickerMenu = useDropdown();

  const handleChange = useCallback(
  (newValue: DependencyMode) => {
    pickerMenu.hide();
    onChange(newValue);
  }, [pickerMenu, onChange]);

  return (
  <div ref={pickerMenu.ref} className='h-full'>
    <button
      className='h-full w-[7.5rem] px-1 py-1 border clr-input clr-hover clr-btn-default text-btn inline-flex align-middle gap-1'
      title='Настройка фильтрации по графу термов'
      tabIndex={-1}
      onClick={pickerMenu.toggle}
    >
      <CogIcon color='text-controls' size={5} />
      <span className='text-sm font-semibold whitespace-nowrap'>{labelDependencyMode(value)}</span>
    </button>
    { pickerMenu.isActive &&
    <Dropdown stretchLeft >
      <DropdownButton onClick={() => handleChange(DependencyMode.ALL)}>
        <p><b>вся схема:</b> список всех конституент схемы</p>
      </DropdownButton>
      <DropdownButton onClick={() => handleChange(DependencyMode.EXPRESSION)}>
        <p><b>выражение:</b> список идентификаторов из выражения</p>
      </DropdownButton>
      <DropdownButton onClick={() => handleChange(DependencyMode.OUTPUTS)}>
        <p><b>потребители:</b> конституенты, ссылающиеся на данную</p>
      </DropdownButton>
      <DropdownButton onClick={() => handleChange(DependencyMode.INPUTS)}>
        <p><b>поставщики:</b> конституенты, на которые ссылается данная</p>
      </DropdownButton>
      <DropdownButton onClick={() => handleChange(DependencyMode.EXPAND_OUTPUTS)}>
        <p><b>зависимые:</b> конституенты, зависящие по цепочке</p>
      </DropdownButton>
      <DropdownButton onClick={() => handleChange(DependencyMode.EXPAND_INPUTS)}>
        <p><b>влияющие:</b> конституенты, влияющие на данную (цепочка)</p>
      </DropdownButton>
    </Dropdown>}
  </div>
  );
}

export default DependencyModePicker;
