import { IconClone, IconDestroy, IconMoveDown, IconMoveUp, IconNewItem, IconReset, IconSave } from '@/components/Icons';
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
        icon={<IconSave size='1.25rem' className='icon-primary' />}
        disabled={disabled || !modified}
        onClick={onSubmit}
      />
      <MiniButton
        title='Сбросить несохраненные изменения'
        icon={<IconReset size='1.25rem' className='icon-primary' />}
        disabled={disabled || !modified}
        onClick={onReset}
      />
      <MiniButton
        title='Создать конституенту после данной'
        icon={<IconNewItem size={'1.25rem'} className='icon-green' />}
        disabled={disabled}
        onClick={onCreate}
      />
      <MiniButton
        titleHtml={modified ? messages.unsaved : prepareTooltip('Клонировать конституенту', 'Alt + V')}
        icon={<IconClone size='1.25rem' className='icon-green' />}
        disabled={disabled || modified}
        onClick={onClone}
      />
      <MiniButton
        title='Удалить редактируемую конституенту'
        disabled={disabled}
        onClick={onDelete}
        icon={<IconDestroy size='1.25rem' className='icon-red' />}
      />
      <MiniButton
        titleHtml={prepareTooltip('Переместить вверх', 'Alt + вверх')}
        icon={<IconMoveUp size='1.25rem' className='icon-primary' />}
        disabled={disabled || modified}
        onClick={onMoveUp}
      />
      <MiniButton
        titleHtml={prepareTooltip('Переместить вниз', 'Alt + вниз')}
        icon={<IconMoveDown size='1.25rem' className='icon-primary' />}
        disabled={disabled || modified}
        onClick={onMoveDown}
      />
    </Overlay>
  );
}

export default ConstituentaToolbar;
