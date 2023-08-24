import { useCallback } from 'react';

import Dropdown from '../../../components/Common/Dropdown';
import DropdownButton from '../../../components/Common/DropdownButton';
import useDropdown from '../../../hooks/useDropdown';
import { DependencyMode } from '../../../utils/models';
import { getDependencyLabel } from '../../../utils/staticUI';

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
  <div ref={pickerMenu.ref} className='h-full min-w-[5.8rem] text-right'>
    <span
      className='text-sm font-semibold underline cursor-pointer select-none whitespace-nowrap'
      tabIndex={-1}
      onClick={pickerMenu.toggle}
    >
      {getDependencyLabel(value)}
    </span>
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
      </Dropdown>
    }
  </div>

  //     case DependencyMode.OUTPUTS: return 'потребители';
  //     case DependencyMode.INPUTS: return 'поставщики';
  //     case DependencyMode.EXPAND_INPUTS: return 'влияющие';
  //     case DependencyMode.EXPAND_OUTPUTS: return 'зависимые';
  //   }
  // }
  
  );
}

export default DependencyModePicker;
