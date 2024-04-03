'use client';

import {
  BiFilterAlt,
  BiFont,
  BiFontFamily,
  BiGitBranch,
  BiGitMerge,
  BiPlanet,
  BiPlusCircle,
  BiReset,
  BiTrash
} from 'react-icons/bi';
import { LuExpand, LuImage, LuMaximize, LuMinimize } from 'react-icons/lu';

import BadgeHelp from '@/components/man/BadgeHelp';
import MiniButton from '@/components/ui/MiniButton';
import Overlay from '@/components/ui/Overlay';
import { HelpTopic } from '@/models/miscellaneous';

import { useRSEdit } from '../RSEditContext';

interface GraphToolbarProps {
  is3D: boolean;

  orbit: boolean;
  noText: boolean;

  showParamsDialog: () => void;
  onCreate: () => void;
  onDelete: () => void;
  onResetViewpoint: () => void;

  toggleNoText: () => void;
  toggleOrbit: () => void;
}

function GraphToolbar({
  is3D,
  noText,
  toggleNoText,
  orbit,
  toggleOrbit,
  showParamsDialog,
  onCreate,
  onDelete,
  onResetViewpoint
}: GraphToolbarProps) {
  const controller = useRSEdit();

  return (
    <Overlay
      position='top-0 pt-1 right-1/2 translate-x-1/2'
      className='flex flex-col items-center bg-opacity-10 clr-app'
    >
      <div className='cc-icons'>
        <MiniButton
          title='Настройки фильтрации узлов и связей'
          icon={<BiFilterAlt size='1.25rem' className='icon-primary' />}
          onClick={showParamsDialog}
        />
        <MiniButton
          title={!noText ? 'Скрыть текст' : 'Отобразить текст'}
          icon={
            !noText ? (
              <BiFontFamily size='1.25rem' className='icon-green' />
            ) : (
              <BiFont size='1.25rem' className='icon-primary' />
            )
          }
          onClick={toggleNoText}
        />
        <MiniButton
          icon={<LuImage size='1.25rem' className='icon-primary' />}
          title='Восстановить камеру'
          onClick={onResetViewpoint}
        />
        <MiniButton
          icon={<BiPlanet size='1.25rem' className={orbit ? 'icon-green' : 'icon-primary'} />}
          title='Анимация вращения'
          disabled={!is3D}
          onClick={toggleOrbit}
        />
        {controller.isContentEditable ? (
          <MiniButton
            title='Новая конституента'
            icon={<BiPlusCircle size='1.25rem' className='icon-green' />}
            disabled={controller.isProcessing}
            onClick={onCreate}
          />
        ) : null}
        {controller.isContentEditable ? (
          <MiniButton
            title='Удалить выбранные'
            icon={<BiTrash size='1.25rem' className='icon-red' />}
            disabled={controller.nothingSelected || controller.isProcessing}
            onClick={onDelete}
          />
        ) : null}
        <BadgeHelp topic={HelpTopic.GRAPH_TERM} className='max-w-[calc(100vw-4rem)]' offset={4} />
      </div>
      <div className='cc-icons'>
        <MiniButton
          titleHtml='<b>[ESC]</b><br/>Сбросить выделение'
          icon={<BiReset size='1.25rem' className='icon-primary' />}
          onClick={controller.deselectAll}
        />
        <MiniButton
          titleHtml='<b>Замыкание</b> - дополнение выделения влияющими конституентами'
          icon={<LuMinimize size='1.25rem' className='icon-primary' />}
          disabled={controller.nothingSelected}
          onClick={controller.selectAllInputs}
        />
        <MiniButton
          titleHtml='<b>Максимизация</b> - дополнение выделения конституентами, зависимыми только от выделенных'
          icon={<LuMaximize size='1.25rem' className='icon-primary' />}
          disabled={controller.nothingSelected}
          onClick={controller.selectMax}
        />
        <MiniButton
          titleHtml='Выделить все зависимые'
          icon={<LuExpand size='1.25rem' className='icon-primary' />}
          disabled={controller.nothingSelected}
          onClick={controller.selectAllOutputs}
        />
        <MiniButton
          titleHtml='Выделить поставщиков'
          icon={<BiGitBranch size='1.25rem' className='icon-primary' />}
          disabled={controller.nothingSelected}
          onClick={controller.selectInputs}
        />
        <MiniButton
          titleHtml='Выделить потребителей'
          icon={<BiGitMerge size='1.25rem' className='icon-primary' />}
          disabled={controller.nothingSelected}
          onClick={controller.selectOutputs}
        />
      </div>
    </Overlay>
  );
}

export default GraphToolbar;
