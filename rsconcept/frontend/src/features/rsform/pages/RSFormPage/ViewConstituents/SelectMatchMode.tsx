'use client';

import { SelectorButton } from '@/components/Control';
import { MatchModeIcon } from '@/components/DomainIcons';
import { Dropdown, DropdownButton, useDropdown } from '@/components/Dropdown';
import { CProps } from '@/components/props';
import useWindowSize from '@/hooks/useWindowSize';
import { prefixes } from '@/utils/constants';

import { describeCstMatchMode, labelCstMatchMode } from '../../../labels';
import { CstMatchMode } from '../../../stores/cstSearch';

interface SelectMatchModeProps extends CProps.Styling {
  value: CstMatchMode;
  onChange: (value: CstMatchMode) => void;
  dense?: boolean;
}

function SelectMatchMode({ value, dense, onChange, ...restProps }: SelectMatchModeProps) {
  const menu = useDropdown();
  const size = useWindowSize();

  function handleChange(newValue: CstMatchMode) {
    menu.hide();
    onChange(newValue);
  }

  return (
    <div ref={menu.ref} {...restProps}>
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
