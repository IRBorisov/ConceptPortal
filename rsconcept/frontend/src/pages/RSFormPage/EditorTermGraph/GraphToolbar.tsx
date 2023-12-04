import ConceptTooltip from '../../../components/Common/ConceptTooltip'
import MiniButton from '../../../components/Common/MiniButton'
import HelpTermGraph from '../../../components/Help/HelpTermGraph'
import { ArrowsFocusIcon, DumpBinIcon, FilterIcon, HelpIcon, LetterAIcon, LetterALinesIcon, PlanetIcon, SmallPlusIcon } from '../../../components/Icons'

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
  <div className='relative w-full z-pop'>
  <div className='absolute right-0 flex items-start justify-center w-full top-1'>
    <MiniButton
      tooltip='Настройки фильтрации узлов и связей'
      icon={<FilterIcon color='text-primary' size={5} />}
      onClick={showParamsDialog}
    />
    <MiniButton
      tooltip={!noText ? 'Скрыть текст' : 'Отобразить текст'}
      icon={
        !noText
        ? <LetterALinesIcon color='text-success' size={5} />
        : <LetterAIcon color='text-primary' size={5} />
      }
      onClick={toggleNoText}
    />
    <MiniButton
      tooltip='Новая конституента'
      icon={<SmallPlusIcon color={isMutable ? 'text-success' : ''} size={5} />}
      disabled={!isMutable}
      onClick={onCreate}
    />
    <MiniButton
      tooltip='Удалить выбранные'
      icon={<DumpBinIcon color={isMutable && !nothingSelected ? 'text-warning' : ''} size={5} />}
      disabled={!isMutable || nothingSelected}
      onClick={onDelete}
    />
    <MiniButton
      icon={<ArrowsFocusIcon color='text-primary' size={5} />}
      tooltip='Восстановить камеру'
      onClick={onResetViewpoint}
    />
    <MiniButton
      icon={<PlanetIcon color={!is3D ? '' : orbit ? 'text-success' : 'text-primary'} size={5} />}
      tooltip='Анимация вращения'
      disabled={!is3D}
      onClick={toggleOrbit}
    />
    <div className='px-1 py-1' id='items-graph-help'>
      <HelpIcon color='text-primary' size={5} />
    </div>
    <ConceptTooltip anchorSelect='#items-graph-help' offset={4}>
      <div className='text-sm max-w-[calc(100vw-20rem)]'>
        <HelpTermGraph />
      </div>
    </ConceptTooltip>
  </div>
  </div>);
}

export default GraphToolbar;