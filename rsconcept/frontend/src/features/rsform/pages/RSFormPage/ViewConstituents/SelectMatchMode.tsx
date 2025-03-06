'use client';

import clsx from 'clsx';

import { SelectorButton } from '@/components/Control';
import { Dropdown, DropdownButton, useDropdown } from '@/components/Dropdown';
import { type Styling } from '@/components/props';
import { useWindowSize } from '@/hooks/useWindowSize';
import { prefixes } from '@/utils/constants';

import { IconCstMatchMode } from '../../../components/IconCstMatchMode';
import { describeCstMatchMode, labelCstMatchMode } from '../../../labels';
import { CstMatchMode } from '../../../stores/cstSearch';

interface SelectMatchModeProps extends Styling {
  value: CstMatchMode;
  onChange: (value: CstMatchMode) => void;
  dense?: boolean;
}

export function SelectMatchMode({ value, dense, className, onChange, ...restProps }: SelectMatchModeProps) {
  const menu = useDropdown();
  const size = useWindowSize();

  function handleChange(newValue: CstMatchMode) {
    menu.hide();
    onChange(newValue);
  }

  return (
    <div ref={menu.ref} className={clsx('relative', className)} {...restProps}>
      <SelectorButton
        transparent
        titleHtml='Настройка фильтрации <br/>по проверяемым атрибутам'
        hideTitle={menu.isOpen}
        className='h-full pr-2'
        icon={<IconCstMatchMode value={value} size='1rem' />}
        text={dense || size.isSmall ? undefined : labelCstMatchMode(value)}
        onClick={menu.toggle}
      />
      <Dropdown stretchLeft isOpen={menu.isOpen} margin='mt-3'>
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
                  {<IconCstMatchMode value={matchMode} size='1rem' />}
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
