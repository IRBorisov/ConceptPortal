'use client';

import clsx from 'clsx';

import { IconFolderTree } from '@/components/Icons';
import { CProps } from '@/components/props';
import Dropdown from '@/components/ui/Dropdown';
import MiniButton from '@/components/ui/MiniButton';
import useDropdown from '@/hooks/useDropdown';
import { prefixes } from '@/utils/constants';

import SelectLocation from './SelectLocation';

interface SelectLocationContextProps extends CProps.Styling {
  value: string;
  onChange: (newValue: string) => void;
  title?: string;
  stretchTop?: boolean;
}

function SelectLocationContext({
  value,
  title = 'Проводник...',
  onChange,
  className,
  style
}: SelectLocationContextProps) {
  const menu = useDropdown();

  function handleClick(event: CProps.EventMouse, newValue: string) {
    event.preventDefault();
    event.stopPropagation();
    menu.hide();
    onChange(newValue);
  }

  return (
    <div ref={menu.ref} className='h-full text-right self-start mt-[-0.25rem] ml-[-1.5rem]'>
      <MiniButton
        title={title}
        hideTitle={menu.isOpen}
        icon={<IconFolderTree size='1.25rem' className='icon-green' />}
        onClick={() => menu.toggle()}
      />
      <Dropdown
        isOpen={menu.isOpen}
        className={clsx('w-[20rem] h-[12.5rem] z-modalTooltip mt-[-0.25rem]', className)}
        style={style}
      >
        <SelectLocation
          value={value}
          prefix={prefixes.folders_list}
          dense
          onClick={(event, target) => handleClick(event, target.getPath())}
        />
      </Dropdown>
    </div>
  );
}

export default SelectLocationContext;
