import clsx from 'clsx';

import {
  IconAnimation,
  IconAnimationOff,
  IconDestroy,
  IconFitImage,
  IconGrid,
  IconImage,
  IconLineStraight,
  IconLineWave,
  IconNewItem,
  IconReset,
  IconSave
} from '@/components/Icons';
import BadgeHelp from '@/components/info/BadgeHelp';
import MiniButton from '@/components/ui/MiniButton';
import { HelpTopic } from '@/models/miscellaneous';
import { PARAMETER } from '@/utils/constants';
import { prepareTooltip } from '@/utils/labels';

import { useOssEdit } from '../OssEditContext';

interface ToolbarOssGraphProps {
  isModified: boolean;
  showGrid: boolean;
  edgeAnimate: boolean;
  edgeStraight: boolean;
  onCreate: () => void;
  onDelete: () => void;
  onFitView: () => void;
  onSaveImage: () => void;
  onSavePositions: () => void;
  onResetPositions: () => void;
  toggleShowGrid: () => void;
  toggleEdgeAnimate: () => void;
  toggleEdgeStraight: () => void;
}

function ToolbarOssGraph({
  isModified,
  showGrid,
  edgeAnimate,
  edgeStraight,
  onCreate,
  onDelete,
  onFitView,
  onSaveImage,
  onSavePositions,
  onResetPositions,
  toggleShowGrid,
  toggleEdgeAnimate,
  toggleEdgeStraight
}: ToolbarOssGraphProps) {
  const controller = useOssEdit();

  return (
    <div className='flex flex-col items-center'>
      <div className='cc-icons'>
        <MiniButton
          icon={<IconFitImage size='1.25rem' className='icon-primary' />}
          title='Сбросить вид'
          onClick={onFitView}
        />
        <MiniButton
          title={showGrid ? 'Скрыть сетку' : 'Отобразить сетку'}
          icon={
            showGrid ? (
              <IconGrid size='1.25rem' className='icon-green' />
            ) : (
              <IconGrid size='1.25rem' className='icon-primary' />
            )
          }
          onClick={toggleShowGrid}
        />
        <MiniButton
          title={edgeStraight ? 'Связи: прямые' : 'Связи: безье'}
          icon={
            edgeStraight ? (
              <IconLineStraight size='1.25rem' className='icon-primary' />
            ) : (
              <IconLineWave size='1.25rem' className='icon-primary' />
            )
          }
          onClick={toggleEdgeStraight}
        />
        <MiniButton
          title={edgeAnimate ? 'Анимация: вкл' : 'Анимация: выкл'}
          icon={
            edgeAnimate ? (
              <IconAnimation size='1.25rem' className='icon-primary' />
            ) : (
              <IconAnimationOff size='1.25rem' className='icon-primary' />
            )
          }
          onClick={toggleEdgeAnimate}
        />
        <MiniButton
          icon={<IconImage size='1.25rem' className='icon-primary' />}
          title='Сохранить изображение'
          onClick={onSaveImage}
        />
        <BadgeHelp
          topic={HelpTopic.UI_OSS_GRAPH}
          className={clsx(PARAMETER.TOOLTIP_WIDTH, 'sm:max-w-[40rem]')}
          offset={4}
        />
      </div>
      {controller.isMutable ? (
        <div className='cc-icons'>
          {' '}
          <MiniButton
            titleHtml={prepareTooltip('Сохранить изменения', 'Ctrl + S')}
            icon={<IconSave size='1.25rem' className='icon-primary' />}
            disabled={controller.isProcessing || !isModified}
            onClick={onSavePositions}
          />
          <MiniButton
            title='Сбросить изменения'
            icon={<IconReset size='1.25rem' className='icon-primary' />}
            disabled={!isModified}
            onClick={onResetPositions}
          />
          <MiniButton
            title='Новая операция'
            icon={<IconNewItem size='1.25rem' className='icon-green' />}
            disabled={controller.isProcessing}
            onClick={onCreate}
          />
          <MiniButton
            title='Удалить выбранную'
            icon={<IconDestroy size='1.25rem' className='icon-red' />}
            disabled={controller.selected.length !== 1 || controller.isProcessing}
            onClick={onDelete}
          />
        </div>
      ) : null}
    </div>
  );
}

export default ToolbarOssGraph;
