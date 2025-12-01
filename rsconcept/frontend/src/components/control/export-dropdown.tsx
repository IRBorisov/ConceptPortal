'use client';

import { toast } from 'react-toastify';
import fileDownload from 'js-file-download';

import { errorMsg, infoMsg } from '@/utils/labels';
import { convertToCSV, convertToJSON } from '@/utils/utils';

import { Dropdown, DropdownButton, useDropdown } from '../dropdown';
import { IconCSV, IconDownload, IconJSON, IconPDF } from '../icons';
import { cn } from '../utils';

import { MiniButton } from './mini-button';

/** Represents export type. */
export const ExportType = {
  CSV: 'csv',
  JSON: 'json',
  PDF: 'pdf'
} as const;
export type ExportType = (typeof ExportType)[keyof typeof ExportType];

interface ExportDropdownProps<T extends object = object> {
  /** Disabled state */
  disabled?: boolean;

  /** Data to export (can be readonly or mutable array of objects) */
  data: readonly Readonly<T>[];

  /** Optional filename (without extension) */

  filename?: string;
  /** Optional button className */

  className?: string;

  csvConverter?: (data: readonly Readonly<T>[]) => Blob;
  jsonConverter?: (data: readonly Readonly<T>[]) => Blob;
  pdfConverter?: (data: readonly Readonly<T>[]) => Promise<Blob>;
}

export function ExportDropdown<T extends object = object>({
  disabled,
  data,
  filename = 'export',
  className,
  csvConverter = convertToCSV,
  jsonConverter = convertToJSON,
  pdfConverter
}: ExportDropdownProps<T>) {
  const { elementRef: ref, isOpen, toggle, handleBlur, hide } = useDropdown();

  function handleExport(format: ExportType) {
    if (!data?.length) {
      toast.error(infoMsg.noDataToExport);
      return;
    }
    try {
      if (format === ExportType.CSV) {
        const blob = csvConverter(data);
        fileDownload(blob, `${filename}.csv`, 'text/csv;charset=utf-8;');
      } else if (format === ExportType.JSON) {
        const blob = jsonConverter(data);
        fileDownload(blob, `${filename}.json`, 'application/json;charset=utf-8;');
      } else {
        if (!pdfConverter) {
          throw new Error('PDF converter is not defined');
        }
        void pdfConverter(data)
          .then(blob => fileDownload(blob, `${filename}.pdf`, 'application/pdf;charset=utf-8;'))
          .catch(error => {
            toast.error(errorMsg.pdfError);
            throw error;
          });
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
          onClick={() => handleExport(ExportType.CSV)}
          className='w-full justify-start'
        />
        <DropdownButton
          icon={<IconJSON size='1rem' className='mr-1 icon-green' />}
          text='JSON'
          onClick={() => handleExport(ExportType.JSON)}
          className='w-full justify-start'
        />
        {pdfConverter ? (
          <DropdownButton
            icon={<IconPDF size='1rem' className='mr-1 icon-green' />}
            text='PDF'
            onClick={() => handleExport(ExportType.PDF)}
            className='w-full justify-start'
          />
        ) : null}
      </Dropdown>
    </div>
  );
}
