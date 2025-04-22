'use client';

import { useReactFlow } from 'reactflow';

import { HelpTopic } from '@/features/help';
import { BadgeHelp } from '@/features/help/components';
import { useExecuteOperation } from '@/features/oss/backend/use-execute-operation';
import { useUpdateLayout } from '@/features/oss/backend/use-update-layout';

import { MiniButton } from '@/components/control';
import {
  IconAnimation,
  IconAnimationOff,
  IconConceptBlock,
  IconCoordinates,
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
import { cn } from '@/components/utils';
import { useDialogsStore } from '@/stores/dialogs';
import { PARAMETER } from '@/utils/constants';
import { prepareTooltip } from '@/utils/utils';

import { OperationType } from '../../../backend/types';
import { useMutatingOss } from '../../../backend/use-mutating-oss';
import { useOSSGraphStore } from '../../../stores/oss-graph';
import { useOssEdit } from '../oss-edit-context';

import { VIEW_PADDING } from './oss-flow';
import { useGetLayout } from './use-get-layout';

interface ToolbarOssGraphProps extends Styling {
  onCreateOperation: () => void;
  onCreateBlock: () => void;
  onDelete: () => void;
  onResetPositions: () => void;
}

export function ToolbarOssGraph({
  onCreateOperation,
  onCreateBlock,
  onDelete,
  onResetPositions,
  className,
  ...restProps
}: ToolbarOssGraphProps) {
  const { schema, selected, isMutable, canDeleteOperation: canDelete } = useOssEdit();
  const isProcessing = useMutatingOss();
  const { fitView } = useReactFlow();
  const selectedOperation = selected.length !== 1 ? null : schema.operationByID.get(selected[0]) ?? null;
  const selectedBlock = selected.length !== 1 ? null : schema.blockByID.get(-selected[0]) ?? null;
  const getLayout = useGetLayout();

  const showGrid = useOSSGraphStore(state => state.showGrid);
  const showCoordinates = useOSSGraphStore(state => state.showCoordinates);
  const edgeAnimate = useOSSGraphStore(state => state.edgeAnimate);
  const edgeStraight = useOSSGraphStore(state => state.edgeStraight);
  const toggleShowGrid = useOSSGraphStore(state => state.toggleShowGrid);
  const toggleShowCoordinates = useOSSGraphStore(state => state.toggleShowCoordinates);
  const toggleEdgeAnimate = useOSSGraphStore(state => state.toggleEdgeAnimate);
  const toggleEdgeStraight = useOSSGraphStore(state => state.toggleEdgeStraight);

  const { updateLayout } = useUpdateLayout();
  const { executeOperation } = useExecuteOperation();

  const showEditOperation = useDialogsStore(state => state.showEditOperation);
  const showEditBlock = useDialogsStore(state => state.showEditBlock);

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
    void updateLayout({ itemID: schema.id, data: getLayout() });
  }

  function handleOperationExecute() {
    if (!readyForSynthesis || !selectedOperation) {
      return;
    }
    void executeOperation({
      itemID: schema.id, //
      data: { target: selectedOperation.id, layout: getLayout() }
    });
  }

  function handleEditItem() {
    if (selectedOperation) {
      showEditOperation({
        oss: schema,
        target: selectedOperation,
        layout: getLayout()
      });
    } else if (selectedBlock) {
      showEditBlock({
        oss: schema,
        target: selectedBlock,
        layout: getLayout()
      });
    }
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center pt-1',
        'rounded-b-2xl',
        'hover:bg-background backdrop-blur-xs',
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
          title='Сбросить вид'
          icon={<IconFitImage size='1.25rem' className='icon-primary' />}
          onClick={handleFitView}
        />
        <MiniButton
          title={showGrid ? 'Скрыть сетку' : 'Отобразить сетку'}
          aria-label='Переключатель отображения сетки'
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
          aria-label='Переключатель формы связей'
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
          aria-label='Переключатель анимации связей'
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
          title={showCoordinates ? 'Координаты: вкл' : 'Координаты: выкл'}
          aria-label='Переключатель видимости координат (для отладки)'
          icon={<IconCoordinates size='1.25rem' className={showCoordinates ? 'icon-green' : 'icon-primary'} />}
          onClick={toggleShowCoordinates}
        />
        <BadgeHelp topic={HelpTopic.UI_OSS_GRAPH} contentClass='sm:max-w-160' offset={4} />
      </div>
      {isMutable ? (
        <div className='cc-icons'>
          <MiniButton
            titleHtml={prepareTooltip('Сохранить изменения', 'Ctrl + S')}
            aria-label='Сохранить изменения'
            icon={<IconSave size='1.25rem' className='icon-primary' />}
            onClick={handleSavePositions}
            disabled={isProcessing}
          />
          <MiniButton
            titleHtml={prepareTooltip('Новый блок', 'Ctrl + Shift + Q')}
            aria-label='Новый блок'
            icon={<IconConceptBlock size='1.25rem' className='icon-green' />}
            onClick={onCreateBlock}
            disabled={isProcessing}
          />
          <MiniButton
            titleHtml={prepareTooltip('Новая операция', 'Ctrl + Q')}
            aria-label='Новая операция'
            icon={<IconNewItem size='1.25rem' className='icon-green' />}
            onClick={onCreateOperation}
            disabled={isProcessing}
          />
          <MiniButton
            title='Активировать операцию'
            icon={<IconExecute size='1.25rem' className='icon-green' />}
            onClick={handleOperationExecute}
            disabled={isProcessing || selected.length !== 1 || !readyForSynthesis}
          />
          <MiniButton
            titleHtml={prepareTooltip('Редактировать выбранную', 'Двойной клик')}
            aria-label='Редактировать выбранную'
            icon={<IconEdit2 size='1.25rem' className='icon-primary' />}
            onClick={handleEditItem}
            disabled={selected.length !== 1 || isProcessing}
          />
          <MiniButton
            titleHtml={prepareTooltip('Удалить выбранную', 'Delete')}
            aria-label='Удалить выбранную'
            icon={<IconDestroy size='1.25rem' className='icon-red' />}
            onClick={onDelete}
            disabled={
              isProcessing ||
              (!selectedOperation && !selectedBlock) ||
              (!!selectedOperation && !canDelete(selectedOperation))
            }
          />
        </div>
      ) : null}
    </div>
  );
}
