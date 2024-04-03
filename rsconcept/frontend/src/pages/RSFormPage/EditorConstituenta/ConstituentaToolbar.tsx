import { BiDownvote, BiDuplicate, BiPlusCircle, BiReset, BiTrash, BiUpvote } from 'react-icons/bi';
import { FiSave } from 'react-icons/fi';

import MiniButton from '@/components/ui/MiniButton';
import Overlay from '@/components/ui/Overlay';
import { messages, prepareTooltip } from '@/utils/labels';

interface ConstituentaToolbarProps {
  disabled: boolean;
  modified: boolean;

  onSubmit: () => void;
  onReset: () => void;

  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onClone: () => void;
  onCreate: () => void;
}

function ConstituentaToolbar({
  disabled,
  modified,
  onSubmit,
  onReset,
  onMoveUp,
  onMoveDown,
  onDelete,
  onClone,
  onCreate
}: ConstituentaToolbarProps) {
  return (
    <Overlay position='top-1 right-4 sm:right-1/2 sm:translate-x-1/2' className='cc-icons'>
      <MiniButton
        titleHtml={prepareTooltip('Сохранить изменения', 'Ctrl + S')}
        icon={<FiSave size='1.25rem' className='icon-primary' />}
        disabled={disabled || !modified}
        onClick={onSubmit}
      />
      <MiniButton
        title='Сбросить несохраненные изменения'
        icon={<BiReset size='1.25rem' className='icon-primary' />}
        disabled={disabled || !modified}
        onClick={onReset}
      />
      <MiniButton
        title='Создать конституенту после данной'
        icon={<BiPlusCircle size={'1.25rem'} className='icon-green' />}
        disabled={disabled}
        onClick={onCreate}
      />
      <MiniButton
        titleHtml={modified ? messages.unsaved : prepareTooltip('Клонировать конституенту', 'Alt + V')}
        icon={<BiDuplicate size='1.25rem' className='icon-green' />}
        disabled={disabled || modified}
        onClick={onClone}
      />
      <MiniButton
        title='Удалить редактируемую конституенту'
        disabled={disabled}
        onClick={onDelete}
        icon={<BiTrash size='1.25rem' className='icon-red' />}
      />
      <MiniButton
        titleHtml={prepareTooltip('Переместить вверх', 'Alt + вверх')}
        icon={<BiUpvote size='1.25rem' className='icon-primary' />}
        disabled={disabled || modified}
        onClick={onMoveUp}
      />
      <MiniButton
        titleHtml={prepareTooltip('Переместить вниз', 'Alt + вниз')}
        icon={<BiDownvote size='1.25rem' className='icon-primary' />}
        disabled={disabled || modified}
        onClick={onMoveDown}
      />
    </Overlay>
  );
}

export default ConstituentaToolbar;
