import {
  IconClone,
  IconDestroy,
  IconList,
  IconListOff,
  IconMoveDown,
  IconMoveUp,
  IconNewItem,
  IconReset,
  IconSave
} from '@/components/Icons';
import BadgeHelp from '@/components/info/BadgeHelp';
import MiniButton from '@/components/ui/MiniButton';
import Overlay from '@/components/ui/Overlay';
import { HelpTopic } from '@/models/miscellaneous';
import { PARAMETER } from '@/utils/constants';
import { prepareTooltip, tooltips } from '@/utils/labels';

interface ToolbarConstituentaProps {
  disabled: boolean;
  modified: boolean;
  showList: boolean;

  onSubmit: () => void;
  onReset: () => void;

  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onClone: () => void;
  onCreate: () => void;
  onToggleList: () => void;
}

function ToolbarConstituenta({
  disabled,
  modified,
  showList,

  onSubmit,
  onReset,
  onMoveUp,
  onMoveDown,
  onDelete,
  onClone,
  onCreate,
  onToggleList
}: ToolbarConstituentaProps) {
  return (
    <Overlay position='top-1 right-4' className='cc-icons sm:right-1/2 sm:translate-x-1/2'>
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
        titleHtml={modified ? tooltips.unsaved : prepareTooltip('Клонировать конституенту', 'Alt + V')}
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
        title='Отображение списка конституент'
        icon={showList ? <IconList size='1.25rem' className='icon-primary' /> : <IconListOff size='1.25rem' />}
        onClick={onToggleList}
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
      <BadgeHelp topic={HelpTopic.UI_RS_EDITOR} offset={4} className={PARAMETER.TOOLTIP_WIDTH} />
    </Overlay>
  );
}

export default ToolbarConstituenta;
