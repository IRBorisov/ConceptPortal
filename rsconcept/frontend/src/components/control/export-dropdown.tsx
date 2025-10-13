'use client';

import { toast } from 'react-toastify';
import fileDownload from 'js-file-download';

import { infoMsg } from '@/utils/labels';
import { convertToCSV, convertToJSON } from '@/utils/utils';

import { Dropdown, DropdownButton, useDropdown } from '../dropdown';
import { IconCSV, IconDownload, IconJSON } from '../icons';
import { cn } from '../utils';

import { MiniButton } from './mini-button';

interface ExportDropdownProps<T extends object = object> {
  /** Disabled state */
  disabled?: boolean;

  /** Data to export (can be readonly or mutable array of objects) */
  data: readonly Readonly<T>[];

  /** Optional filename (without extension) */

  filename?: string;
  /** Optional button className */

  className?: string;
}

export function ExportDropdown<T extends object = object>({
  disabled,
  data,
  filename = 'export',
  className
}: ExportDropdownProps<T>) {
  const { elementRef: ref, isOpen, toggle, handleBlur, hide } = useDropdown();

  function handleExport(format: 'csv' | 'json') {
    if (!data || data.length === 0) {
      toast.error(infoMsg.noDataToExport);
      return;
    }
    try {
      if (format === 'csv') {
        const blob = convertToCSV(data);
        fileDownload(blob, `${filename}.csv`, 'text/csv;charset=utf-8;');
      } else {
        const blob = convertToJSON(data);
        fileDownload(blob, `${filename}.json`, 'application/json;charset=utf-8;');
      }
    } catch (error) {
      console.error(error);
    }
    hide();
  }

  return (
    <div className={cn('relative inline-block', className)} tabIndex={0} onBlur={handleBlur}>
      <MiniButton
        title='Экспортировать данные'
        hideTitle={isOpen}
        className='text-muted-foreground enabled:hover:text-primary'
        icon={<IconDownload size='1.25rem' />}
        onClick={toggle}
        disabled={disabled}
      />
      <Dropdown ref={ref} isOpen={isOpen} stretchLeft margin='mt-1' className='z-tooltip'>
        <DropdownButton
          icon={<IconCSV size='1rem' className='mr-1 icon-green' />}
          text='CSV'
          onClick={() => handleExport('csv')}
          className='w-full justify-start'
        />
        <DropdownButton
          icon={<IconJSON size='1rem' className='mr-1 icon-green' />}
          text='JSON'
          onClick={() => handleExport('json')}
          className='w-full justify-start'
        />
      </Dropdown>
    </div>
  );
}
