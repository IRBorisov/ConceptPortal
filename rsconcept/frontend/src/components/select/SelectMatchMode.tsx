'use client';

import { useCallback } from 'react';

import Dropdown from '@/components/ui/Dropdown';
import SelectorButton from '@/components/ui/SelectorButton';
import useDropdown from '@/hooks/useDropdown';
import useWindowSize from '@/hooks/useWindowSize';
import { CstMatchMode } from '@/models/miscellaneous';
import { prefixes } from '@/utils/constants';
import { describeCstMatchMode, labelCstMatchMode } from '@/utils/labels';

import { IconAlias, IconTerm, IconFilter, IconFormula, IconText } from '../Icons';
import DropdownButton from '../ui/DropdownButton';

function MatchModeIcon(mode: CstMatchMode, size: string, color?: string) {
  switch (mode) {
    case CstMatchMode.ALL:
      return <IconFilter size={size} className={color} />;
    case CstMatchMode.TEXT:
      return <IconText size={size} className={color} />;
    case CstMatchMode.EXPR:
      return <IconFormula size={size} className={color} />;
    case CstMatchMode.TERM:
      return <IconTerm size={size} className={color} />;
    case CstMatchMode.NAME:
      return <IconAlias size={size} className={color} />;
  }
}
interface SelectMatchModeProps {
  value: CstMatchMode;
  onChange: (value: CstMatchMode) => void;
}

function SelectMatchMode({ value, onChange }: SelectMatchModeProps) {
  const menu = useDropdown();
  const size = useWindowSize();

  const handleChange = useCallback(
    (newValue: CstMatchMode) => {
      menu.hide();
      onChange(newValue);
    },
    [menu, onChange]
  );

  return (
    <div ref={menu.ref}>
      <SelectorButton
        transparent
        tabIndex={-1}
        title='Настройка фильтрации по проверяемым атрибутам'
        hideTitle={menu.isOpen}
        className='h-full pr-2'
        icon={MatchModeIcon(value, '1rem', value !== CstMatchMode.ALL ? 'icon-primary' : '')}
        text={size.isSmall ? undefined : labelCstMatchMode(value)}
        onClick={menu.toggle}
      />
      <Dropdown stretchLeft isOpen={menu.isOpen}>
        {Object.values(CstMatchMode)
          .filter(value => !isNaN(Number(value)))
          .map((value, index) => {
            const matchMode = value as CstMatchMode;
            return (
              <DropdownButton
                className='w-[20rem]'
                key={`${prefixes.cst_source_list}${index}`}
                onClick={() => handleChange(matchMode)}
              >
                <div className='inline-flex items-center gap-1'>
                  {MatchModeIcon(matchMode, '1rem')}
                  <b>{labelCstMatchMode(matchMode)}:</b> {describeCstMatchMode(matchMode)}
                </div>
              </DropdownButton>
            );
          })}
      </Dropdown>
    </div>
  );
}

export default SelectMatchMode;
