'use client';

import clsx from 'clsx';

import { SelectorButton } from '@/components/control';
import { Dropdown, DropdownButton, useDropdown } from '@/components/dropdown';
import { type Styling } from '@/components/props';
import { useWindowSize } from '@/hooks/use-window-size';
import { prefixes } from '@/utils/constants';

import { IconDependencyMode } from '../../../components/icon-dependency-mode';
import { describeCstSource, labelCstSource } from '../../../labels';
import { DependencyMode } from '../../../stores/cst-search';

interface SelectGraphFilterProps extends Styling {
  value: DependencyMode;
  onChange: (value: DependencyMode) => void;
  dense?: boolean;
}

export function SelectGraphFilter({ value, dense, className, onChange, ...restProps }: SelectGraphFilterProps) {
  const menu = useDropdown();
  const size = useWindowSize();

  function handleChange(newValue: DependencyMode) {
    menu.hide();
    onChange(newValue);
  }

  return (
    <div ref={menu.ref} className={clsx('relative', className)} {...restProps}>
      <SelectorButton
        transparent
        tabIndex={-1}
        titleHtml='Настройка фильтрации <br/>по графу термов'
        hideTitle={menu.isOpen}
        className='h-full pr-2'
        icon={<IconDependencyMode value={value} size='1rem' />}
        text={!dense && !size.isSmall ? labelCstSource(value) : undefined}
        onClick={menu.toggle}
      />
      <Dropdown stretchLeft isOpen={menu.isOpen} margin='mt-3'>
        {Object.values(DependencyMode)
          .filter(value => !isNaN(Number(value)))
          .map((value, index) => {
            const source = value as DependencyMode;
            return (
              <DropdownButton
                className={!dense ? 'w-72' : undefined}
                key={`${prefixes.cst_source_list}${index}`}
                onClick={() => handleChange(source)}
                icon={<IconDependencyMode value={source} size='1rem' />}
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
