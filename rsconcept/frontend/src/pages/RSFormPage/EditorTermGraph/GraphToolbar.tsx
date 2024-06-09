import clsx from 'clsx';

import {
  IconClustering,
  IconClusteringOff,
  IconDestroy,
  IconFilter,
  IconFitImage,
  IconImage,
  IconNewItem,
  IconRotate3D,
  IconText,
  IconTextOff
} from '@/components/Icons';
import BadgeHelp from '@/components/info/BadgeHelp';
import MiniButton from '@/components/ui/MiniButton';
import { HelpTopic } from '@/models/miscellaneous';
import { PARAMETER } from '@/utils/constants';

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
  onSaveImage: () => void;

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
  onResetViewpoint,
  onSaveImage
}: GraphToolbarProps) {
  const controller = useRSEdit();

  return (
    <div className='cc-icons'>
      <MiniButton
        title='Настройки фильтрации узлов и связей'
        icon={<IconFilter size='1.25rem' className='icon-primary' />}
        onClick={showParamsDialog}
      />
      <MiniButton
        icon={<IconFitImage size='1.25rem' className='icon-primary' />}
        title='Граф целиком'
        onClick={onResetViewpoint}
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
        title={!foldDerived ? 'Скрыть порожденные' : 'Отобразить порожденные'}
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
      <MiniButton
        icon={<IconImage size='1.25rem' className='icon-primary' />}
        title='Сохранить изображение'
        onClick={onSaveImage}
      />
      <BadgeHelp
        topic={HelpTopic.UI_GRAPH_TERM}
        className={clsx(PARAMETER.TOOLTIP_WIDTH, 'sm:max-w-[40rem]')}
        offset={4}
      />
    </div>
  );
}

export default GraphToolbar;
