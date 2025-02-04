'use client';

import { DependencyIcon } from '@/components/DomainIcons';
import { CProps } from '@/components/props';
import Dropdown from '@/components/ui/Dropdown';
import DropdownButton from '@/components/ui/DropdownButton';
import SelectorButton from '@/components/ui/SelectorButton';
import useDropdown from '@/hooks/useDropdown';
import useWindowSize from '@/hooks/useWindowSize';
import { DependencyMode } from '@/models/miscellaneous';
import { prefixes } from '@/utils/constants';
import { describeCstSource, labelCstSource } from '@/utils/labels';

interface SelectGraphFilterProps extends CProps.Styling {
  value: DependencyMode;
  onChange: (value: DependencyMode) => void;
  dense?: boolean;
}

function SelectGraphFilter({ value, dense, onChange, ...restProps }: SelectGraphFilterProps) {
  const menu = useDropdown();
  const size = useWindowSize();

  function handleChange(newValue: DependencyMode) {
    menu.hide();
    onChange(newValue);
  }

  return (
    <div ref={menu.ref} {...restProps}>
      <SelectorButton
        transparent
        tabIndex={-1}
        titleHtml='Настройка фильтрации <br/>по графу термов'
        hideTitle={menu.isOpen}
        className='h-full pr-2'
        icon={<DependencyIcon value={value} size='1rem' />}
        text={dense || size.isSmall ? undefined : labelCstSource(value)}
        onClick={menu.toggle}
      />
      <Dropdown stretchLeft isOpen={menu.isOpen}>
        {Object.values(DependencyMode)
          .filter(value => !isNaN(Number(value)))
          .map((value, index) => {
            const source = value as DependencyMode;
            return (
              <DropdownButton
                className={!dense ? 'w-[18rem]' : undefined}
                key={`${prefixes.cst_source_list}${index}`}
                onClick={() => handleChange(source)}
              >
                <div className='inline-flex items-center gap-1'>
                  {<DependencyIcon value={source} size='1rem' />}
                  {!dense ? (
                    <span>
                      <b>{labelCstSource(source)}:</b> {describeCstSource(source)}
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

export default SelectGraphFilter;
