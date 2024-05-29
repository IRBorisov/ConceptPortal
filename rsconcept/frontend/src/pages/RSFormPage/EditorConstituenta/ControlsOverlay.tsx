import clsx from 'clsx';

import { IconEdit } from '@/components/Icons';
import MiniButton from '@/components/ui/MiniButton';
import Overlay from '@/components/ui/Overlay';
import { IConstituenta } from '@/models/rsform';
import { messages } from '@/utils/labels';

interface ControlsOverlayProps {
  constituenta?: IConstituenta;
  disabled: boolean;
  modified: boolean;
  processing: boolean;

  onRename: () => void;
  onEditTerm: () => void;
}

function ControlsOverlay({ constituenta, disabled, modified, processing, onRename, onEditTerm }: ControlsOverlayProps) {
  return (
    <Overlay position='top-1 left-[4.7rem]' className='flex select-none'>
      {!disabled || processing ? (
        <MiniButton
          title={modified ? messages.unsaved : `Редактировать словоформы термина`}
          noHover
          onClick={onEditTerm}
          icon={<IconEdit size='1rem' className='icon-primary' />}
          disabled={modified}
        />
      ) : null}
      <div
        className={clsx(
          'pt-1 pl-[1.375rem]', // prettier: split lines
          'text-sm font-medium whitespace-nowrap',
          'select-text cursor-default',
          disabled && !processing && 'pl-[2.8rem]'
        )}
      >
        <span>Имя </span>
        <span className='ml-1'>{constituenta?.alias ?? ''}</span>
      </div>
      {!disabled || processing ? (
        <MiniButton
          noHover
          title={modified ? messages.unsaved : 'Переименовать конституенту'}
          onClick={onRename}
          icon={<IconEdit size='1rem' className='icon-primary' />}
          disabled={modified}
        />
      ) : null}
    </Overlay>
  );
}

export default ControlsOverlay;
