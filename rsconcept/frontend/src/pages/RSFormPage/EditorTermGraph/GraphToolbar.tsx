'use client';

import { BiCollapse, BiFilterAlt, BiFont, BiFontFamily, BiPlanet, BiPlusCircle, BiTrash } from 'react-icons/bi';

import HelpButton from '@/components/man/HelpButton';
import MiniButton from '@/components/ui/MiniButton';
import Overlay from '@/components/ui/Overlay';
import { HelpTopic } from '@/models/miscellaneous';

import { useRSEdit } from '../RSEditContext';

interface GraphToolbarProps {
  nothingSelected: boolean;
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
  nothingSelected,
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
    <Overlay position='top-1 right-1/2 translate-x-1/2' className='flex'>
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
        icon={<BiCollapse size='1.25rem' className='icon-primary' />}
        title='Восстановить камеру'
        onClick={onResetViewpoint}
      />
      <MiniButton
        icon={<BiPlanet size='1.25rem' className={orbit ? 'icon-green' : 'icon-primary'} />}
        title='Анимация вращения'
        disabled={!is3D}
        onClick={toggleOrbit}
      />
      {controller.isMutable || controller.isProcessing ? (
        <MiniButton
          title='Новая конституента'
          icon={<BiPlusCircle size='1.25rem' className='icon-green' />}
          disabled={!controller.isMutable}
          onClick={onCreate}
        />
      ) : null}
      {controller.isMutable || controller.isProcessing ? (
        <MiniButton
          title='Удалить выбранные'
          icon={<BiTrash size='1.25rem' className='icon-red' />}
          disabled={nothingSelected || !controller.isMutable}
          onClick={onDelete}
        />
      ) : null}
      <HelpButton topic={HelpTopic.GRAPH_TERM} className='max-w-[calc(100vw-4rem)]' offset={4} />
    </Overlay>
  );
}

export default GraphToolbar;
