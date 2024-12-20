'use client';

import clsx from 'clsx';

import {
  IconClone,
  IconDestroy,
  IconList,
  IconListOff,
  IconMoveDown,
  IconMoveUp,
  IconNewItem,
  IconPredecessor,
  IconReset,
  IconSave
} from '@/components/Icons';
import BadgeHelp from '@/components/info/BadgeHelp';
import MiniSelectorOSS from '@/components/select/MiniSelectorOSS';
import MiniButton from '@/components/ui/MiniButton';
import Overlay from '@/components/ui/Overlay';
import { HelpTopic } from '@/models/miscellaneous';
import { IConstituenta } from '@/models/rsform';
import { PARAMETER } from '@/utils/constants';
import { prepareTooltip, tooltips } from '@/utils/labels';

import { useRSEdit } from '../RSEditContext';

interface ToolbarConstituentaProps {
  activeCst?: IConstituenta;
  disabled: boolean;
  modified: boolean;
  showList: boolean;

  onSubmit: () => void;
  onReset: () => void;
  onToggleList: () => void;
}

function ToolbarConstituenta({
  activeCst,
  disabled,
  modified,
  showList,

  onSubmit,
  onReset,
  onToggleList
}: ToolbarConstituentaProps) {
  const controller = useRSEdit();

  return (
    <Overlay
      position='cc-tab-tools right-1/2 translate-x-1/2 xs:right-4 xs:translate-x-0 md:right-1/2 md:translate-x-1/2'
      className='cc-icons cc-animate-position outline-none cc-blur px-1 rounded-b-2xl'
    >
      {controller.schema && controller.schema?.oss.length > 0 ? (
        <MiniSelectorOSS
          items={controller.schema.oss}
          onSelect={(event, value) => controller.viewOSS(value.id, event.ctrlKey || event.metaKey)}
        />
      ) : null}
      {activeCst?.is_inherited ? (
        <MiniButton
          title='Перейти к исходной конституенте в ОСС'
          onClick={() => controller.viewPredecessor(activeCst.id)}
          icon={<IconPredecessor size='1.25rem' className='icon-primary' />}
        />
      ) : null}
      {controller.isContentEditable ? (
        <>
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
            icon={<IconNewItem size='1.25rem' className='icon-green' />}
            disabled={!controller.isContentEditable || controller.isProcessing}
            onClick={() => controller.createCst(activeCst?.cst_type, false)}
          />
          <MiniButton
            titleHtml={modified ? tooltips.unsaved : prepareTooltip('Клонировать конституенту', 'Alt + V')}
            icon={<IconClone size='1.25rem' className='icon-green' />}
            disabled={disabled || modified}
            onClick={controller.cloneCst}
          />
          <MiniButton
            title='Удалить редактируемую конституенту'
            disabled={disabled || !controller.canDeleteSelected}
            onClick={controller.promptDeleteCst}
            icon={<IconDestroy size='1.25rem' className='icon-red' />}
          />
        </>
      ) : null}

      <MiniButton
        title='Отображение списка конституент'
        icon={showList ? <IconList size='1.25rem' className='icon-primary' /> : <IconListOff size='1.25rem' />}
        onClick={onToggleList}
      />

      {controller.isContentEditable ? (
        <>
          <MiniButton
            titleHtml={prepareTooltip('Переместить вверх', 'Alt + вверх')}
            icon={<IconMoveUp size='1.25rem' className='icon-primary' />}
            disabled={disabled || modified || (controller.schema && controller.schema?.items.length < 2)}
            onClick={controller.moveUp}
          />
          <MiniButton
            titleHtml={prepareTooltip('Переместить вниз', 'Alt + вниз')}
            icon={<IconMoveDown size='1.25rem' className='icon-primary' />}
            disabled={disabled || modified || (controller.schema && controller.schema?.items.length < 2)}
            onClick={controller.moveDown}
          />
        </>
      ) : null}
      <BadgeHelp
        topic={HelpTopic.UI_RS_EDITOR}
        offset={4}
        className={clsx(PARAMETER.TOOLTIP_WIDTH, 'sm:max-w-[40rem]')}
      />
    </Overlay>
  );
}

export default ToolbarConstituenta;
