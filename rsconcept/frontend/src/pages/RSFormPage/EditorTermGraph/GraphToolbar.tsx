'use client';

import { BiCollapse, BiFilterAlt, BiPlanet, BiPlusCircle, BiTrash } from 'react-icons/bi';

import MiniButton from '@/components/Common/MiniButton';
import Overlay from '@/components/Common/Overlay';
import HelpButton from '@/components/Help/HelpButton';
import { LetterAIcon, LetterALinesIcon } from '@/components/Icons';
import { HelpTopic } from '@/models/miscelanious';

interface GraphToolbarProps {
  isMutable: boolean
  nothingSelected: boolean
  is3D: boolean

  orbit: boolean
  noText: boolean
  
  showParamsDialog: () => void
  onCreate: () => void
  onDelete: () => void
  onResetViewpoint: () => void

  toggleNoText: () => void
  toggleOrbit: () => void
}

function GraphToolbar({
  isMutable, nothingSelected, is3D,
  noText, toggleNoText,
  orbit, toggleOrbit,
  showParamsDialog,
  onCreate, onDelete, onResetViewpoint
} : GraphToolbarProps) {
  return (
  <Overlay position='w-full top-1 right-0 flex items-start justify-center'>
    <MiniButton
      tooltip='Настройки фильтрации узлов и связей'
      icon={<BiFilterAlt size='1.25rem' className='clr-text-primary' />}
      onClick={showParamsDialog}
    />
    <MiniButton
      tooltip={!noText ? 'Скрыть текст' : 'Отобразить текст'}
      icon={
        !noText
        ? <LetterALinesIcon size='1.25rem' className='clr-text-success' />
        : <LetterAIcon size='1.25rem' className='clr-text-primary' />
      }
      onClick={toggleNoText}
    />
    <MiniButton
      tooltip='Новая конституента'
      icon={<BiPlusCircle size='1.25rem' className={isMutable ? 'clr-text-success' : ''} />}
      disabled={!isMutable}
      onClick={onCreate}
    />
    <MiniButton
      tooltip='Удалить выбранные'
      icon={<BiTrash size='1.25rem' className={isMutable && !nothingSelected ? 'clr-text-warning' : ''} />}
      disabled={!isMutable || nothingSelected}
      onClick={onDelete}
    />
    <MiniButton
      icon={<BiCollapse size='1.25rem' className='clr-text-primary' />}
      tooltip='Восстановить камеру'
      onClick={onResetViewpoint}
    />
    <MiniButton
      icon={<BiPlanet size='1.25rem' className={!is3D ? '' : orbit ? 'clr-text-success' : 'clr-text-primary'} />}
      tooltip='Анимация вращения'
      disabled={!is3D}
      onClick={toggleOrbit}
    />
    <HelpButton topic={HelpTopic.GRAPH_TERM} dimensions='max-w-[calc(100vw-20rem)]' offset={4} />
  </Overlay>);
}

export default GraphToolbar;