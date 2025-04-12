'use client';

import { SelectorButton } from '@/components/control';
import { Dropdown, DropdownButton, useDropdown } from '@/components/dropdown';
import { type Styling } from '@/components/props';
import { cn } from '@/components/utils';
import { useWindowSize } from '@/hooks/use-window-size';
import { prefixes } from '@/utils/constants';

import { IconCstMatchMode } from '../../../components/icon-cst-match-mode';
import { describeCstMatchMode, labelCstMatchMode } from '../../../labels';
import { CstMatchMode } from '../../../stores/cst-search';

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
    <div ref={menu.ref} onBlur={menu.handleBlur} className={cn('relative', className)} {...restProps}>
      <SelectorButton
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
                key={`${prefixes.cst_source_list}${index}`}
                className={!dense ? 'w-80' : undefined}
                icon={<IconCstMatchMode value={matchMode} size='1rem' />}
                onClick={() => handleChange(matchMode)}
              >
                {!dense ? (
                  <span>
                    <b>{labelCstMatchMode(matchMode)}:</b> {describeCstMatchMode(matchMode)}
                  </span>
                ) : null}
              </DropdownButton>
            );
          })}
      </Dropdown>
    </div>
  );
}
