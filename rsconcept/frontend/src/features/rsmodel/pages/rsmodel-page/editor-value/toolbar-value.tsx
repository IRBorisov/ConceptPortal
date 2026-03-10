'use client';

import { toast } from 'react-toastify';

import { IconShowDataText } from '@/features/rsmodel/components/icon-show-data-text';

import { MiniButton } from '@/components/control';
import { IconClipboard } from '@/components/icons';
import { cn } from '@/components/utils';
import { usePreferencesStore } from '@/stores/preferences';
import { infoMsg } from '@/utils/labels';

interface ToolbarValueProps {
  className?: string;
  value: string;
}

export function ToolbarValue({ className, value }: ToolbarValueProps) {
  const showDataText = usePreferencesStore(state => state.showDataText);
  const toggleDataText = usePreferencesStore(state => state.toggleShowDataText);

  function handleClipboard() {
    void navigator.clipboard.writeText(value);
    toast.success(infoMsg.valueReady);
  }

  return (
    <div className={cn('cc-icons select-none', className)}>
      <MiniButton
        title='Скопировать значение в буфер обмена'
        icon={<IconClipboard size='1.25rem' />}
        onClick={handleClipboard}
      />
      <MiniButton
        title='Отображение данных в тексте'
        icon={<IconShowDataText size='1.25rem' value={showDataText} />}
        onClick={toggleDataText}
      />
    </div>
  );
}
