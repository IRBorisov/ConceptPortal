'use client';

import { BiCollapse, BiFilterAlt, BiFont, BiFontFamily, BiPlanet, BiPlusCircle, BiTrash } from 'react-icons/bi';

import HelpButton from '@/components/Help/HelpButton';
import MiniButton from '@/components/ui/MiniButton';
import Overlay from '@/components/ui/Overlay';
import { HelpTopic } from '@/models/miscellaneous';

interface GraphToolbarProps {
  isMutable: boolean;
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
  isMutable,
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
  return (
    <Overlay position='top-1 right-1/2 translate-x-1/2' className='flex'>
      <MiniButton
        title='Настройки фильтрации узлов и связей'
        icon={<BiFilterAlt size='1.25rem' className='clr-text-primary' />}
        onClick={showParamsDialog}
      />
      <MiniButton
        title={!noText ? 'Скрыть текст' : 'Отобразить текст'}
        icon={
          !noText ? (
            <BiFontFamily size='1.25rem' className='clr-text-success' />
          ) : (
            <BiFont size='1.25rem' className='clr-text-primary' />
          )
        }
        onClick={toggleNoText}
      />
      <MiniButton
        icon={<BiCollapse size='1.25rem' className='clr-text-primary' />}
        title='Восстановить камеру'
        onClick={onResetViewpoint}
      />
      <MiniButton
        icon={<BiPlanet size='1.25rem' className={!is3D ? '' : orbit ? 'clr-text-success' : 'clr-text-primary'} />}
        title='Анимация вращения'
        disabled={!is3D}
        onClick={toggleOrbit}
      />
      <MiniButton
        title='Новая конституента'
        icon={<BiPlusCircle size='1.25rem' className={isMutable ? 'clr-text-success' : ''} />}
        disabled={!isMutable}
        onClick={onCreate}
      />
      <MiniButton
        title='Удалить выбранные'
        icon={<BiTrash size='1.25rem' className={isMutable && !nothingSelected ? 'clr-text-warning' : ''} />}
        disabled={!isMutable || nothingSelected}
        onClick={onDelete}
      />
      <HelpButton topic={HelpTopic.GRAPH_TERM} className='max-w-[calc(100vw-4rem)]' offset={4} />
    </Overlay>
  );
}

export default GraphToolbar;
