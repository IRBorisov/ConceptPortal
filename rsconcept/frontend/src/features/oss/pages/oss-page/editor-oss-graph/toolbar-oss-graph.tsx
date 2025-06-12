'use client';

import { HelpTopic } from '@/features/help';
import { BadgeHelp } from '@/features/help/components';

import { MiniButton } from '@/components/control';
import {
  IconConceptBlock,
  IconDestroy,
  IconEdit2,
  IconExecute,
  IconFitImage,
  IconNewItem,
  IconReset,
  IconSave,
  IconSettings
} from '@/components/icons';
import { type Styling } from '@/components/props';
import { cn } from '@/components/utils';
import { useDialogsStore } from '@/stores/dialogs';
import { prepareTooltip } from '@/utils/utils';

import { OperationType } from '../../../backend/types';
import { useExecuteOperation } from '../../../backend/use-execute-operation';
import { useMutatingOss } from '../../../backend/use-mutating-oss';
import { useUpdateLayout } from '../../../backend/use-update-layout';
import { NodeType } from '../../../models/oss';
import { LayoutManager } from '../../../models/oss-layout-api';
import { useOssEdit } from '../oss-edit-context';

import { useOssFlow } from './oss-flow-context';
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
  const { schema, selectedItems, isMutable, canDeleteOperation: canDelete } = useOssEdit();
  const isProcessing = useMutatingOss();
  const { resetView } = useOssFlow();
  const selectedOperation =
    selectedItems.length === 1 && selectedItems[0].nodeType === NodeType.OPERATION ? selectedItems[0] : null;
  const selectedBlock =
    selectedItems.length === 1 && selectedItems[0].nodeType === NodeType.BLOCK ? selectedItems[0] : null;
  const getLayout = useGetLayout();

  const { updateLayout } = useUpdateLayout();
  const { executeOperation } = useExecuteOperation();

  const showEditOperation = useDialogsStore(state => state.showEditOperation);
  const showEditBlock = useDialogsStore(state => state.showEditBlock);
  const showOssOptions = useDialogsStore(state => state.showOssOptions);

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

  function handleShowOptions() {
    showOssOptions();
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
        manager: new LayoutManager(schema, getLayout()),
        target: selectedOperation
      });
    } else if (selectedBlock) {
      showEditBlock({
        manager: new LayoutManager(schema, getLayout()),
        target: selectedBlock
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
          onClick={resetView}
        />
        <MiniButton
          title='Настройки отображения'
          icon={<IconSettings size='1.25rem' className='icon-primary' />}
          onClick={handleShowOptions}
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
            disabled={isProcessing || selectedItems.length !== 1 || !readyForSynthesis}
          />
          <MiniButton
            titleHtml={prepareTooltip('Редактировать выбранную', 'Двойной клик')}
            aria-label='Редактировать выбранную'
            icon={<IconEdit2 size='1.25rem' className='icon-primary' />}
            onClick={handleEditItem}
            disabled={selectedItems.length !== 1 || isProcessing}
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
