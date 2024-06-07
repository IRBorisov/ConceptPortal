'use client';

import { useCallback } from 'react';

import Dropdown from '@/components/ui/Dropdown';
import SelectorButton from '@/components/ui/SelectorButton';
import useDropdown from '@/hooks/useDropdown';
import useWindowSize from '@/hooks/useWindowSize';
import { CstMatchMode } from '@/models/miscellaneous';
import { prefixes } from '@/utils/constants';
import { describeCstMatchMode, labelCstMatchMode } from '@/utils/labels';

import { MatchModeIcon } from '../DomainIcons';
import DropdownButton from '../ui/DropdownButton';

interface SelectMatchModeProps {
  value: CstMatchMode;
  dense?: boolean;
  onChange: (value: CstMatchMode) => void;
}

function SelectMatchMode({ value, dense, onChange }: SelectMatchModeProps) {
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
        titleHtml='Настройка фильтрации <br/>по проверяемым атрибутам'
        hideTitle={menu.isOpen}
        className='h-full pr-2'
        icon={<MatchModeIcon value={value} size='1rem' />}
        text={dense || size.isSmall ? undefined : labelCstMatchMode(value)}
        onClick={menu.toggle}
      />
      <Dropdown stretchLeft isOpen={menu.isOpen}>
        {Object.values(CstMatchMode)
          .filter(value => !isNaN(Number(value)))
          .map((value, index) => {
            const matchMode = value as CstMatchMode;
            return (
              <DropdownButton
                className={!dense ? 'w-[20rem]' : undefined}
                key={`${prefixes.cst_source_list}${index}`}
                onClick={() => handleChange(matchMode)}
              >
                <div className='inline-flex items-center gap-1'>
                  {<MatchModeIcon value={matchMode} size='1rem' />}
                  {!dense ? (
                    <span>
                      <b>{labelCstMatchMode(matchMode)}:</b> {describeCstMatchMode(matchMode)}
                    </span>
                  ) : null}
                </div>
              </DropdownButton>
            );
          })}
      </Dropdown>
    </div>
  );
}

export default SelectMatchMode;
