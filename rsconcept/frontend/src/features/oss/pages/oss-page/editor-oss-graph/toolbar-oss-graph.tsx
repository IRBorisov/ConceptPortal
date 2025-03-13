'use client';

import { useReactFlow } from 'reactflow';
import clsx from 'clsx';

import { HelpTopic } from '@/features/help';
import { BadgeHelp } from '@/features/help/components';
import { useOperationExecute } from '@/features/oss/backend/use-operation-execute';
import { useUpdatePositions } from '@/features/oss/backend/use-update-positions';

import { MiniButton } from '@/components/control';
import {
  IconAnimation,
  IconAnimationOff,
  IconDestroy,
  IconEdit2,
  IconExecute,
  IconFitImage,
  IconGrid,
  IconLineStraight,
  IconLineWave,
  IconNewItem,
  IconReset,
  IconSave
} from '@/components/icons';
import { type Styling } from '@/components/props';
import { useDialogsStore } from '@/stores/dialogs';
import { PARAMETER } from '@/utils/constants';
import { prepareTooltip } from '@/utils/utils';

import { OperationType } from '../../../backend/types';
import { useMutatingOss } from '../../../backend/use-mutating-oss';
import { useOSSGraphStore } from '../../../stores/oss-graph';
import { useOssEdit } from '../oss-edit-context';

import { VIEW_PADDING } from './oss-flow';
import { useGetPositions } from './use-get-positions';

interface ToolbarOssGraphProps extends Styling {
  onCreate: () => void;
  onDelete: () => void;
  onResetPositions: () => void;
}

export function ToolbarOssGraph({
  onCreate,
  onDelete,
  onResetPositions,
  className,
  ...restProps
}: ToolbarOssGraphProps) {
  const { schema, selected, isMutable, canDeleteOperation: canDelete } = useOssEdit();
  const isProcessing = useMutatingOss();
  const { fitView } = useReactFlow();
  const selectedOperation = schema.operationByID.get(selected[0]);
  const getPositions = useGetPositions();

  const showGrid = useOSSGraphStore(state => state.showGrid);
  const edgeAnimate = useOSSGraphStore(state => state.edgeAnimate);
  const edgeStraight = useOSSGraphStore(state => state.edgeStraight);
  const toggleShowGrid = useOSSGraphStore(state => state.toggleShowGrid);
  const toggleEdgeAnimate = useOSSGraphStore(state => state.toggleEdgeAnimate);
  const toggleEdgeStraight = useOSSGraphStore(state => state.toggleEdgeStraight);

  const { updatePositions } = useUpdatePositions();
  const { operationExecute } = useOperationExecute();

  const showEditOperation = useDialogsStore(state => state.showEditOperation);

  const readyForSynthesis = (() => {
    if (!selectedOperation || selectedOperation.operation_type !== OperationType.SYNTHESIS) {
      return false;
    }
    if (selectedOperation.result) {
      return false;
    }

    const argumentIDs = schema.graph.expandInputs([selectedOperation.id]);
    if (!argumentIDs || argumentIDs.length < 1) {
      return false;
    }

    const argumentOperations = argumentIDs.map(id => schema.operationByID.get(id)!);
    if (argumentOperations.some(item => item.result === null)) {
      return false;
    }

    return true;
  })();

  function handleFitView() {
    fitView({ duration: PARAMETER.zoomDuration, padding: VIEW_PADDING });
  }

  function handleSavePositions() {
    const positions = getPositions();
    void updatePositions({ itemID: schema.id, positions: positions }).then(() => {
      positions.forEach(item => {
        const operation = schema.operationByID.get(item.id);
        if (operation) {
          operation.position_x = item.position_x;
          operation.position_y = item.position_y;
        }
      });
    });
  }

  function handleOperationExecute() {
    if (selected.length !== 1 || !readyForSynthesis || !selectedOperation) {
      return;
    }
    void operationExecute({
      itemID: schema.id, //
      data: { target: selectedOperation.id, positions: getPositions() }
    });
  }

  function handleEditOperation() {
    if (selected.length !== 1 || !selectedOperation) {
      return;
    }
    showEditOperation({
      oss: schema,
      target: selectedOperation,
      positions: getPositions()
    });
  }

  return (
    <div
      className={clsx(
        'flex flex-col items-center pt-1',
        'rounded-b-2xl',
        'hover:bg-prim-100 hover:bg-opacity-50 backdrop-blur-xs',
        className
      )}
      {...restProps}
    >
      <div className='cc-icons'>
        <MiniButton
          title='Сбросить изменения'
          icon={<IconReset size='1.25rem' className='icon-primary' />}
          onClick={onResetPositions}
        />
        <MiniButton
          icon={<IconFitImage size='1.25rem' className='icon-primary' />}
          title='Сбросить вид'
          onClick={handleFitView}
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
        <BadgeHelp topic={HelpTopic.UI_OSS_GRAPH} contentClass='sm:max-w-160' offset={4} />
      </div>
      {isMutable ? (
        <div className='cc-icons'>
          <MiniButton
            titleHtml={prepareTooltip('Сохранить изменения', 'Ctrl + S')}
            icon={<IconSave size='1.25rem' className='icon-primary' />}
            disabled={isProcessing}
            onClick={handleSavePositions}
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
            disabled={isProcessing || selected.length !== 1 || !readyForSynthesis}
            onClick={handleOperationExecute}
          />
          <MiniButton
            titleHtml={prepareTooltip('Редактировать выбранную', 'Двойной клик')}
            icon={<IconEdit2 size='1.25rem' className='icon-primary' />}
            disabled={selected.length !== 1 || isProcessing}
            onClick={handleEditOperation}
          />
          <MiniButton
            titleHtml={prepareTooltip('Удалить выбранную', 'Delete')}
            icon={<IconDestroy size='1.25rem' className='icon-red' />}
            disabled={selected.length !== 1 || isProcessing || !selectedOperation || !canDelete(selectedOperation)}
            onClick={onDelete}
          />
        </div>
      ) : null}
    </div>
  );
}
