import { useCallback } from 'react';

import Dropdown from '../../../components/Common/Dropdown';
import DropdownButton from '../../../components/Common/DropdownButton';
import useDropdown from '../../../hooks/useDropdown';
import { CstMatchMode } from '../../../models/miscelanious';
import { labelCstMathchMode } from '../../../utils/labels';

interface MatchModePickerProps {
  value: CstMatchMode
  onChange: (value: CstMatchMode) => void
}

function MatchModePicker({ value, onChange }: MatchModePickerProps) {
  const pickerMenu = useDropdown();

  const handleChange = useCallback(
  (newValue: CstMatchMode) => {
    pickerMenu.hide();
    onChange(newValue);
  }, [pickerMenu, onChange]);

  return (
  <div ref={pickerMenu.ref} className='h-full min-w-[3.4rem]'>
    <span
      className='text-sm font-semibold underline cursor-pointer select-none whitespace-nowrap'
      tabIndex={-1}
      onClick={pickerMenu.toggle}
    >
      {labelCstMathchMode(value)}
    </span>
    { pickerMenu.isActive &&
      <Dropdown>
        <DropdownButton onClick={() => handleChange(CstMatchMode.ALL)}>
          <p><b>везде:</b> искать во всех атрибутах</p>
        </DropdownButton>
        <DropdownButton onClick={() => handleChange(CstMatchMode.EXPR)}>
          <p><b>выраж:</b> искать в формальных выражениях</p>
        </DropdownButton>
        <DropdownButton onClick={() => handleChange(CstMatchMode.TERM)}>
          <p><b>термин:</b> искать в терминах</p>
        </DropdownButton>
        <DropdownButton onClick={() => handleChange(CstMatchMode.TEXT)}>
          <p><b>текст:</b> искать в определениях и конвенциях</p>
        </DropdownButton>
        <DropdownButton onClick={() => handleChange(CstMatchMode.NAME)}>
          <p><b>имя:</b> искать в идентификаторах конституент</p>
        </DropdownButton>
      </Dropdown>
    }
  </div>
  );
}

export default MatchModePicker;
