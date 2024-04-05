'use client';

import {
  IconClustering,
  IconClusteringOff,
  IconDestroy,
  IconFilter,
  IconFitImage,
  IconNewItem,
  IconRotate3D,
  IconText,
  IconTextOff
} from '@/components/Icons';
import BadgeHelp from '@/components/man/BadgeHelp';
import SelectGraphToolbar from '@/components/select/SelectGraphToolbar';
import MiniButton from '@/components/ui/MiniButton';
import Overlay from '@/components/ui/Overlay';
import { HelpTopic } from '@/models/miscellaneous';

import { useRSEdit } from '../RSEditContext';

interface GraphToolbarProps {
  is3D: boolean;

  orbit: boolean;
  noText: boolean;
  foldDerived: boolean;

  showParamsDialog: () => void;
  onCreate: () => void;
  onDelete: () => void;
  onResetViewpoint: () => void;

  toggleFoldDerived: () => void;
  toggleNoText: () => void;
  toggleOrbit: () => void;
}

function GraphToolbar({
  is3D,
  noText,
  foldDerived,
  toggleNoText,
  toggleFoldDerived,
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
      className='flex flex-col items-center rounded-b-2xl cc-blur'
    >
      <div className='cc-icons'>
        <MiniButton
          title='Настройки фильтрации узлов и связей'
          icon={<IconFilter size='1.25rem' className='icon-primary' />}
          onClick={showParamsDialog}
        />
        <MiniButton
          title={!noText ? 'Скрыть текст' : 'Отобразить текст'}
          icon={
            !noText ? (
              <IconText size='1.25rem' className='icon-green' />
            ) : (
              <IconTextOff size='1.25rem' className='icon-primary' />
            )
          }
          onClick={toggleNoText}
        />
        <MiniButton
          title={!foldDerived ? 'Скрыть производные' : 'Отображать производные'}
          icon={
            !foldDerived ? (
              <IconClustering size='1.25rem' className='icon-green' />
            ) : (
              <IconClusteringOff size='1.25rem' className='icon-primary' />
            )
          }
          onClick={toggleFoldDerived}
        />
        <MiniButton
          icon={<IconFitImage size='1.25rem' className='icon-primary' />}
          title='Граф целиком'
          onClick={onResetViewpoint}
        />
        <MiniButton
          icon={<IconRotate3D size='1.25rem' className={orbit ? 'icon-green' : 'icon-primary'} />}
          title='Анимация вращения'
          disabled={!is3D}
          onClick={toggleOrbit}
        />
        {controller.isContentEditable ? (
          <MiniButton
            title='Новая конституента'
            icon={<IconNewItem size='1.25rem' className='icon-green' />}
            disabled={controller.isProcessing}
            onClick={onCreate}
          />
        ) : null}
        {controller.isContentEditable ? (
          <MiniButton
            title='Удалить выбранные'
            icon={<IconDestroy size='1.25rem' className='icon-red' />}
            disabled={controller.nothingSelected || controller.isProcessing}
            onClick={onDelete}
          />
        ) : null}
        <BadgeHelp topic={HelpTopic.GRAPH_TERM} className='max-w-[calc(100vw-4rem)]' offset={4} />
      </div>
      <SelectGraphToolbar graph={controller.schema!.graph} setSelected={controller.setSelected} />
    </Overlay>
  );
}

export default GraphToolbar;
