import { LiaEdit } from 'react-icons/lia';

import MiniButton from '@/components/ui/MiniButton';
import Overlay from '@/components/ui/Overlay';
import { IConstituenta } from '@/models/rsform';

interface ControlsOverlayProps {
  disabled?: boolean;
  constituenta?: IConstituenta;

  onRename: () => void;
  onEditTerm: () => void;
}

function ControlsOverlay({ disabled, constituenta, onRename, onEditTerm }: ControlsOverlayProps) {
  return (
    <Overlay position='top-1 left-[4.1rem]' className='flex select-none'>
      <MiniButton
        title={`Редактировать словоформы термина: ${constituenta?.term_forms.length ?? 0}`}
        disabled={disabled}
        noHover
        onClick={onEditTerm}
        icon={<LiaEdit size='1rem' className={!disabled ? 'clr-text-primary' : ''} />}
      />
      <div className='pt-1 pl-[1.375rem] text-sm font-medium whitespace-nowrap'>
        <span>Имя </span>
        <span className='ml-1'>{constituenta?.alias ?? ''}</span>
      </div>
      <MiniButton
        noHover
        title='Переименовать конституенту'
        disabled={disabled}
        onClick={onRename}
        icon={<LiaEdit size='1rem' className={!disabled ? 'clr-text-primary' : ''} />}
      />
    </Overlay>
  );
}

export default ControlsOverlay;
