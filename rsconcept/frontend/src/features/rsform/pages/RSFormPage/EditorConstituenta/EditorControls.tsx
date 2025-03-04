import clsx from 'clsx';

import { Overlay } from '@/components/Container';
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
    <Overlay position='top-1 left-[4.7rem]' className='flex select-none'>
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
          'pt-1 sm:pl-[1.375rem] pl-1', //
          'text-sm font-medium whitespace-nowrap',
          'select-text cursor-default',
          disabled && !isProcessing && 'pl-[1.6rem] sm:pl-[2.8rem]'
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
    </Overlay>
  );
}
