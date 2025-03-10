import clsx from 'clsx';

import { MiniButton } from '@/components/Control';
import { IconEdit } from '@/components/Icons';
import { useDialogsStore } from '@/stores/dialogs';
import { useModificationStore } from '@/stores/modification';
import { tooltipText } from '@/utils/labels';

import { useMutatingRSForm } from '../../../backend/useMutatingRSForm';
import { type IConstituenta } from '../../../models/rsform';
import { useRSEdit } from '../RSEditContext';

interface EditorControlsProps {
  constituenta: IConstituenta;
  disabled: boolean;
  onEditTerm: () => void;
}

export function EditorControls({ constituenta, disabled, onEditTerm }: EditorControlsProps) {
  const schema = useRSEdit().schema;
  const { isModified } = useModificationStore();
  const isProcessing = useMutatingRSForm();

  const showRenameCst = useDialogsStore(state => state.showRenameCst);

  function handleRenameCst() {
    showRenameCst({ schema: schema, target: constituenta });
  }

  return (
    <div className='absolute z-pop top-0 left-19 flex select-none'>
      {!disabled || isProcessing ? (
        <MiniButton
          title={isModified ? tooltipText.unsaved : `Редактировать словоформы термина`}
          noHover
          onClick={onEditTerm}
          icon={<IconEdit size='1rem' className='icon-primary' />}
          disabled={isModified}
        />
      ) : null}
      <div
        className={clsx(
          'pt-1 sm:pl-5 pl-1',
          'text-sm font-medium whitespace-nowrap',
          'select-text cursor-default',
          disabled && !isProcessing && 'pl-6 sm:pl-11'
        )}
      >
        <span>Имя </span>
        <span className='ml-1'>{constituenta?.alias ?? ''}</span>
      </div>
      {!disabled || isProcessing ? (
        <MiniButton
          noHover
          title={isModified ? tooltipText.unsaved : 'Переименовать конституенту'}
          onClick={handleRenameCst}
          icon={<IconEdit size='1rem' className='icon-primary' />}
          disabled={isModified}
        />
      ) : null}
    </div>
  );
}
