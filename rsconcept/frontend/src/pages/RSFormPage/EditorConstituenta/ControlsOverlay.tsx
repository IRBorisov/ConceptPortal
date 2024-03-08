import clsx from 'clsx';
import { LiaEdit } from 'react-icons/lia';

import MiniButton from '@/components/ui/MiniButton';
import Overlay from '@/components/ui/Overlay';
import { IConstituenta } from '@/models/rsform';

interface ControlsOverlayProps {
  constituenta?: IConstituenta;
  isMutable?: boolean;

  onRename: () => void;
  onEditTerm: () => void;
}

function ControlsOverlay({ constituenta, isMutable, onRename, onEditTerm }: ControlsOverlayProps) {
  return (
    <Overlay position='top-1 left-[4.1rem]' className='flex select-none'>
      {isMutable ? (
        <MiniButton
          title={`Редактировать словоформы термина: ${constituenta?.term_forms.length ?? 0}`}
          noHover
          onClick={onEditTerm}
          icon={<LiaEdit size='1rem' className='icon-primary' />}
        />
      ) : null}
      <div
        className={clsx(
          'pt-1 pl-[1.375rem]', // prettier: split lines
          'text-sm font-medium whitespace-nowrap',
          !isMutable && 'pl-[2.8rem]'
        )}
      >
        <span>Имя </span>
        <span className='ml-1'>{constituenta?.alias ?? ''}</span>
      </div>
      {isMutable ? (
        <MiniButton
          noHover
          title='Переименовать конституенту'
          onClick={onRename}
          icon={<LiaEdit size='1rem' className='icon-primary' />}
        />
      ) : null}
    </Overlay>
  );
}

export default ControlsOverlay;
