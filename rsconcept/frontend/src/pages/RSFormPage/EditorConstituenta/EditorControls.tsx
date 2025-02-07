import clsx from 'clsx';

import { useMutatingRSForm } from '@/backend/rsform/useMutatingRSForm';
import { IconEdit } from '@/components/Icons';
import { Overlay } from '@/components/ui/Container';
import { MiniButton } from '@/components/ui/Control';
import { IConstituenta } from '@/models/rsform';
import { useDialogsStore } from '@/stores/dialogs';
import { useModificationStore } from '@/stores/modification';
import { tooltips } from '@/utils/labels';

import { useRSEdit } from '../RSEditContext';

interface EditorControlsProps {
  constituenta: IConstituenta;
  disabled: boolean;
  onEditTerm: () => void;
}

function EditorControls({ constituenta, disabled, onEditTerm }: EditorControlsProps) {
  const { schema } = useRSEdit();
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
          title={isModified ? tooltips.unsaved : `Редактировать словоформы термина`}
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
          title={isModified ? tooltips.unsaved : 'Переименовать конституенту'}
          onClick={handleRenameCst}
          icon={<IconEdit size='1rem' className='icon-primary' />}
          disabled={isModified}
        />
      ) : null}
    </Overlay>
  );
}

export default EditorControls;
