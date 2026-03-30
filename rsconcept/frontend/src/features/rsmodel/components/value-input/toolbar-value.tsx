'use client';

import { useRef } from 'react';
import { toast } from 'react-toastify';

import { MiniButton } from '@/components/control';
import { Dropdown, DropdownButton, useDropdown } from '@/components/dropdown';
import { IconClipboard, IconDownload, IconJSON, IconReset, IconSave, IconUpload } from '@/components/icons';
import { cn } from '@/components/utils';
import { usePreferencesStore } from '@/stores/preferences';
import { prepareTooltip } from '@/utils/format';
import { errorMsg, infoMsg } from '@/utils/labels';
import { isMac } from '@/utils/utils';

import { IconShowDataText } from '../../components/icon-show-data-text';

interface ToolbarValueProps {
  className?: string;
  value: string;
  isModified?: boolean;
  disabled?: boolean;
  onChange?: (newValue: string) => void;
  onReset?: () => void;
  onSubmit?: () => void;
}

export function ToolbarValue({
  className, value, disabled, isModified,
  onChange, onReset, onSubmit
}: ToolbarValueProps) {
  const showDataText = usePreferencesStore(state => state.showDataText);
  const toggleDataText = usePreferencesStore(state => state.toggleShowDataText);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    elementRef: exportMenuRef,
    isOpen: isExportOpen,
    toggle: toggleExport,
    handleBlur: handleExportBlur,
    hide: hideExport
  } = useDropdown();

  const {
    elementRef: importMenuRef,
    isOpen: isImportOpen,
    toggle: toggleImport,
    handleBlur: handleImportBlur,
    hide: hideImport
  } = useDropdown();

  function handleClipboardExport() {
    hideExport();
    void navigator.clipboard.writeText(value);
    toast.success(infoMsg.valueReady);
  }

  function handleJSONExport() {
    hideExport();
    const blob = new Blob([value], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'value.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleClipboardImport() {
    hideImport();
    if (!onChange || disabled) {
      return;
    }
    navigator.clipboard.readText().then(text => {
      onChange(text);
    }).catch(() => {
      toast.error(errorMsg.clipboardRead);
    });
  }

  function handleOpenFile() {
    hideImport();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    fileInputRef.current?.click();
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (!onChange || disabled) {
      return;
    }
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      onChange(result);
      toast.success('Значение загружено из JSON-файла');
    };
    reader.onerror = () => toast.error(errorMsg.fileRead);
    reader.readAsText(file);
  }

  return (
    <div className={cn('cc-icons select-none', className)}>
      {!!value ?
        (<div ref={exportMenuRef} onBlur={handleExportBlur} className='relative'>
          {!disabled && !!onSubmit ? (
            <MiniButton
              titleHtml={prepareTooltip('Сохранить изменения', isMac() ? 'Cmd + S' : 'Ctrl + S')}
              aria-label='Сохранить изменения'
              icon={<IconSave size='1.25rem' className='icon-primary' />}
              onClick={onSubmit}
              disabled={disabled || !isModified}
            />) : null}
          {!disabled && !!onReset ? (
            <MiniButton
              title='Сбросить несохраненные изменения'
              icon={<IconReset size='1.25rem' className='icon-primary' />}
              onClick={onReset}
              disabled={!isModified}
            />
          ) : null}

          <MiniButton
            title='Экспортировать значение'
            hideTitle={isExportOpen}
            icon={<IconDownload size='1.25rem' className='hover:text-primary' />}
            onClick={toggleExport}
          />
          <Dropdown isOpen={isExportOpen} margin='mt-3'>
            <DropdownButton
              text='Скопировать в буфер'
              icon={<IconClipboard size='1rem' className='mr-1 icon-green' />}
              onClick={handleClipboardExport}
            />
            <DropdownButton
              text='Сохранить как JSON'
              icon={<IconJSON size='1rem' className='mr-1 icon-green' />}
              onClick={handleJSONExport}
            />
          </Dropdown>
        </div>) : null}

      {!disabled && !!onChange ?
        (<div ref={importMenuRef} onBlur={handleImportBlur} className='relative'>
          <MiniButton
            title='Импортировать значение'
            hideTitle={isImportOpen}
            icon={<IconUpload size='1.25rem' className='hover:text-primary' />}
            onClick={toggleImport}
          />
          <Dropdown isOpen={isImportOpen} margin='mt-3'>
            <DropdownButton
              text='Загрузить из буфера'
              icon={<IconClipboard size='1rem' className='mr-1 icon-green' />}
              onClick={handleClipboardImport}
            />
            <DropdownButton
              text='Загрузить из JSON'
              icon={<IconJSON size='1rem' className='mr-1 icon-green' />}
              onClick={handleOpenFile}
            />
          </Dropdown>
        </div>) : null}

      <input
        type='file'
        accept='.json,application/json'
        className='hidden'
        ref={fileInputRef}
        onChange={handleFileChange}
        tabIndex={-1}
      />

      <MiniButton
        title='Отображение данных в тексте'
        icon={<IconShowDataText size='1.25rem' className='hover:text-primary' value={showDataText} />}
        onClick={toggleDataText}
      />
    </div>
  );
}
