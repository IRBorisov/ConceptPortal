'use client';

import clsx from 'clsx';
import { useMemo } from 'react';

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
  onEdit: () => void;
  onExecute: () => void;
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
  onEdit,
  onExecute,
  onFitView,
  onSaveImage,
  onSavePositions,
  onResetPositions,
  toggleShowGrid,
  toggleEdgeAnimate,
  toggleEdgeStraight
}: ToolbarOssGraphProps) {
  const controller = useOssEdit();
  const selectedOperation = useMemo(
    () => controller.schema?.operationByID.get(controller.selected[0]),
    [controller.selected, controller.schema]
  );
  const readyForSynthesis = useMemo(() => {
    if (!selectedOperation || selectedOperation.operation_type !== OperationType.SYNTHESIS) {
      return false;
    }
    if (!controller.schema || selectedOperation.result) {
      return false;
    }

    const argumentIDs = controller.schema.graph.expandInputs([selectedOperation.id]);
    if (!argumentIDs || argumentIDs.length < 2) {
      return false;
    }

    const argumentOperations = argumentIDs.map(id => controller.schema!.operationByID.get(id)!);
    if (argumentOperations.some(item => item.result === null)) {
      return false;
    }

    return true;
  }, [selectedOperation, controller.schema]);

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
            disabled={controller.isProcessing || !isModified}
            onClick={onSavePositions}
          />
          <MiniButton
            titleHtml={prepareTooltip('Новая операция', 'Ctrl + Q')}
            icon={<IconNewItem size='1.25rem' className='icon-green' />}
            disabled={controller.isProcessing}
            onClick={onCreate}
          />
          <MiniButton
            title='Выполнить операцию'
            icon={<IconExecute size='1.25rem' className='icon-green' />}
            disabled={controller.isProcessing || controller.selected.length !== 1 || !readyForSynthesis}
            onClick={onExecute}
          />
          <MiniButton
            titleHtml={prepareTooltip('Редактировать выбранную', 'Двойной клик')}
            icon={<IconEdit2 size='1.25rem' className='icon-primary' />}
            disabled={controller.selected.length !== 1 || controller.isProcessing}
            onClick={onEdit}
          />
          <MiniButton
            titleHtml={prepareTooltip('Удалить выбранную', 'Delete')}
            icon={<IconDestroy size='1.25rem' className='icon-red' />}
            disabled={
              controller.selected.length !== 1 ||
              controller.isProcessing ||
              !controller.canDelete(controller.selected[0])
            }
            onClick={onDelete}
          />
        </div>
      ) : null}
    </div>
  );
}
//IconExecute
export default ToolbarOssGraph;
