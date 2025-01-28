'use client';

import clsx from 'clsx';

import { useIsProcessingOss } from '@/backend/oss/useIsProcessingOss';
import {
  IconAnimation,
  IconAnimationOff,
  IconDestroy,
  IconEdit2,
  IconExecute,
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
import { OperationType } from '@/models/oss';
import { useModificationStore } from '@/stores/modification';
import { useOSSGraphStore } from '@/stores/ossGraph';
import { PARAMETER } from '@/utils/constants';
import { prepareTooltip } from '@/utils/labels';

import { useOssEdit } from '../OssEditContext';

interface ToolbarOssGraphProps {
  onCreate: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onExecute: () => void;
  onFitView: () => void;
  onSaveImage: () => void;
  onSavePositions: () => void;
  onResetPositions: () => void;
}

function ToolbarOssGraph({
  onCreate,
  onDelete,
  onEdit,
  onExecute,
  onFitView,
  onSaveImage,
  onSavePositions,
  onResetPositions
}: ToolbarOssGraphProps) {
  const controller = useOssEdit();
  const { isModified } = useModificationStore();
  const isProcessing = useIsProcessingOss();
  const selectedOperation = controller.schema.operationByID.get(controller.selected[0]);

  const showGrid = useOSSGraphStore(state => state.showGrid);
  const edgeAnimate = useOSSGraphStore(state => state.edgeAnimate);
  const edgeStraight = useOSSGraphStore(state => state.edgeStraight);
  const toggleShowGrid = useOSSGraphStore(state => state.toggleShowGrid);
  const toggleEdgeAnimate = useOSSGraphStore(state => state.toggleEdgeAnimate);
  const toggleEdgeStraight = useOSSGraphStore(state => state.toggleEdgeStraight);

  const readyForSynthesis = (() => {
    if (!selectedOperation || selectedOperation.operation_type !== OperationType.SYNTHESIS) {
      return false;
    }
    if (selectedOperation.result) {
      return false;
    }

    const argumentIDs = controller.schema.graph.expandInputs([selectedOperation.id]);
    if (!argumentIDs || argumentIDs.length < 1) {
      return false;
    }

    const argumentOperations = argumentIDs.map(id => controller.schema.operationByID.get(id)!);
    if (argumentOperations.some(item => item.result === null)) {
      return false;
    }

    return true;
  })();

  return (
    <div className='flex flex-col items-center'>
      <div className='cc-icons'>
        <MiniButton
          title='Сбросить изменения'
          icon={<IconReset size='1.25rem' className='icon-primary' />}
          disabled={!isModified}
          onClick={onResetPositions}
        />
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
          <MiniButton
            titleHtml={prepareTooltip('Сохранить изменения', 'Ctrl + S')}
            icon={<IconSave size='1.25rem' className='icon-primary' />}
            disabled={isProcessing || !isModified}
            onClick={onSavePositions}
          />
          <MiniButton
            titleHtml={prepareTooltip('Новая операция', 'Ctrl + Q')}
            icon={<IconNewItem size='1.25rem' className='icon-green' />}
            disabled={isProcessing}
            onClick={onCreate}
          />
          <MiniButton
            title='Активировать операцию'
            icon={<IconExecute size='1.25rem' className='icon-green' />}
            disabled={isProcessing || controller.selected.length !== 1 || !readyForSynthesis}
            onClick={onExecute}
          />
          <MiniButton
            titleHtml={prepareTooltip('Редактировать выбранную', 'Двойной клик')}
            icon={<IconEdit2 size='1.25rem' className='icon-primary' />}
            disabled={controller.selected.length !== 1 || isProcessing}
            onClick={onEdit}
          />
          <MiniButton
            titleHtml={prepareTooltip('Удалить выбранную', 'Delete')}
            icon={<IconDestroy size='1.25rem' className='icon-red' />}
            disabled={controller.selected.length !== 1 || isProcessing || !controller.canDelete(controller.selected[0])}
            onClick={onDelete}
          />
        </div>
      ) : null}
    </div>
  );
}
//IconExecute
export default ToolbarOssGraph;
