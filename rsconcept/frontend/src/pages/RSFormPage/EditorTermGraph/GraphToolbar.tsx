'use client';

import MiniButton from '@/components/Common/MiniButton';
import Overlay from '@/components/Common/Overlay';
import HelpButton from '@/components/Help/HelpButton';
import { ArrowsFocusIcon, DumpBinIcon, FilterIcon, LetterAIcon, LetterALinesIcon, PlanetIcon, SmallPlusIcon } from '@/components/Icons';
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
      icon={<FilterIcon color='clr-text-primary' size={5} />}
      onClick={showParamsDialog}
    />
    <MiniButton
      tooltip={!noText ? 'Скрыть текст' : 'Отобразить текст'}
      icon={
        !noText
        ? <LetterALinesIcon color='clr-text-success' size={5} />
        : <LetterAIcon color='clr-text-primary' size={5} />
      }
      onClick={toggleNoText}
    />
    <MiniButton
      tooltip='Новая конституента'
      icon={<SmallPlusIcon color={isMutable ? 'clr-text-success' : ''} size={5} />}
      disabled={!isMutable}
      onClick={onCreate}
    />
    <MiniButton
      tooltip='Удалить выбранные'
      icon={<DumpBinIcon color={isMutable && !nothingSelected ? 'clr-text-warning' : ''} size={5} />}
      disabled={!isMutable || nothingSelected}
      onClick={onDelete}
    />
    <MiniButton
      icon={<ArrowsFocusIcon color='clr-text-primary' size={5} />}
      tooltip='Восстановить камеру'
      onClick={onResetViewpoint}
    />
    <MiniButton
      icon={<PlanetIcon color={!is3D ? '' : orbit ? 'clr-text-success' : 'clr-text-primary'} size={5} />}
      tooltip='Анимация вращения'
      disabled={!is3D}
      onClick={toggleOrbit}
    />
    <HelpButton topic={HelpTopic.GRAPH_TERM} dimensions='max-w-[calc(100vw-20rem)]' offset={4} />
  </Overlay>);
}

export default GraphToolbar;