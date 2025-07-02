'use client';

import { SelectorButton } from '@/components/control';
import { Dropdown, DropdownButton, useDropdown } from '@/components/dropdown';
import { type Styling } from '@/components/props';
import { cn } from '@/components/utils';
import { prefixes } from '@/utils/constants';

import { describeCstSource, labelCstSource } from '../../labels';
import { DependencyMode } from '../../stores/cst-search';
import { IconDependencyMode } from '../icon-dependency-mode';

interface SelectGraphFilterProps extends Styling {
  value: DependencyMode;
  onChange: (value: DependencyMode) => void;
  dense?: boolean;
}

export function SelectGraphFilter({ value, dense, className, onChange, ...restProps }: SelectGraphFilterProps) {
  const menu = useDropdown();

  function handleChange(newValue: DependencyMode) {
    menu.hide();
    onChange(newValue);
  }

  return (
    <div ref={menu.ref} onBlur={menu.handleBlur} className={cn('relative', className)} {...restProps}>
      <SelectorButton
        tabIndex={-1}
        titleHtml='Настройка фильтрации <br/>по графу термов'
        hideTitle={menu.isOpen}
        className='h-full pr-2'
        icon={<IconDependencyMode value={value} size='1rem' />}
        text={!dense ? labelCstSource(value) : undefined}
        onClick={menu.toggle}
      />
      <Dropdown stretchLeft isOpen={menu.isOpen} margin='mt-3'>
        {Object.values(DependencyMode)
          .filter(value => !isNaN(Number(value)))
          .map((value, index) => {
            const source = value as DependencyMode;
            return (
              <DropdownButton
                key={`${prefixes.cst_source_list}${index}`}
                className={!dense ? 'w-72' : undefined}
                icon={<IconDependencyMode value={source} size='1rem' />}
                onClick={() => handleChange(source)}
              >
                {!dense ? (
                  <span>
                    <b>{labelCstSource(source)}:</b> {describeCstSource(source)}
                  </span>
                ) : null}
              </DropdownButton>
            );
          })}
      </Dropdown>
    </div>
  );
}
