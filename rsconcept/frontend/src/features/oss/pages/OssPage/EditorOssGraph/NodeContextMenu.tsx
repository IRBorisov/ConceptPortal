'use client';

import { useRef } from 'react';

import { Dropdown, DropdownButton } from '@/components/Dropdown';
import {
  IconChild,
  IconConnect,
  IconDestroy,
  IconEdit2,
  IconExecute,
  IconNewRSForm,
  IconRSForm
} from '@/components/Icons';
import { useClickedOutside } from '@/hooks/useClickedOutside';
import { prepareTooltip } from '@/utils/utils';

import { OperationType } from '../../../backend/types';
import { useMutatingOss } from '../../../backend/useMutatingOss';
import { type IOperation } from '../../../models/oss';
import { useOssEdit } from '../OssEditContext';

// pixels - size of OSS context menu
const MENU_WIDTH = 200;
const MENU_HEIGHT = 200;

export interface ContextMenuData {
  operation: IOperation;
  cursorX: number;
  cursorY: number;
}

interface NodeContextMenuProps extends ContextMenuData {
  isOpen: boolean;
  onHide: () => void;
  onDelete: (target: number) => void;
  onCreateInput: (target: number) => void;
  onEditSchema: (target: number) => void;
  onEditOperation: (target: number) => void;
  onExecuteOperation: (target: number) => void;
  onRelocateConstituents: (target: number) => void;
}

export function NodeContextMenu({
  isOpen,
  operation,
  cursorX,
  cursorY,
  onHide,
  onDelete,
  onCreateInput,
  onEditSchema,
  onEditOperation,
  onExecuteOperation,
  onRelocateConstituents
}: NodeContextMenuProps) {
  const isProcessing = useMutatingOss();
  const { schema, navigateOperationSchema, isMutable, canDelete } = useOssEdit();

  const ref = useRef<HTMLDivElement>(null);
  const readyForSynthesis = (() => {
    if (operation.operation_type !== OperationType.SYNTHESIS) {
      return false;
    }
    if (operation.result) {
      return false;
    }

    const argumentIDs = schema.graph.expandInputs([operation.id]);
    if (!argumentIDs || argumentIDs.length < 1) {
      return false;
    }

    const argumentOperations = argumentIDs.map(id => schema.operationByID.get(id)!);
    if (argumentOperations.some(item => item.result === null)) {
      return false;
    }

    return true;
  })();

  useClickedOutside(isOpen, ref, onHide);

  function handleOpenSchema() {
    navigateOperationSchema(operation.id);
  }

  function handleEditSchema() {
    onHide();
    onEditSchema(operation.id);
  }

  function handleEditOperation() {
    onHide();
    onEditOperation(operation.id);
  }

  function handleDeleteOperation() {
    onHide();
    onDelete(operation.id);
  }

  function handleCreateSchema() {
    onHide();
    onCreateInput(operation.id);
  }

  function handleRunSynthesis() {
    onHide();
    onExecuteOperation(operation.id);
  }

  function handleRelocateConstituents() {
    onHide();
    onRelocateConstituents(operation.id);
  }

  return (
    <div ref={ref} className='absolute select-none' style={{ top: cursorY, left: cursorX }}>
      <Dropdown
        isOpen={isOpen}
        stretchLeft={cursorX >= window.innerWidth - MENU_WIDTH}
        stretchTop={cursorY >= window.innerHeight - MENU_HEIGHT}
      >
        <DropdownButton
          text='Редактировать'
          title='Редактировать операцию'
          icon={<IconEdit2 size='1rem' className='icon-primary' />}
          disabled={!isMutable || isProcessing}
          onClick={handleEditOperation}
        />

        {operation?.result ? (
          <DropdownButton
            text='Открыть схему'
            titleHtml={prepareTooltip('Открыть привязанную КС', 'Двойной клик')}
            icon={<IconRSForm size='1rem' className='icon-green' />}
            disabled={isProcessing}
            onClick={handleOpenSchema}
          />
        ) : null}
        {isMutable && !operation?.result && operation?.operation_type === OperationType.INPUT ? (
          <DropdownButton
            text='Создать схему'
            title='Создать пустую схему для загрузки'
            icon={<IconNewRSForm size='1rem' className='icon-green' />}
            disabled={isProcessing}
            onClick={handleCreateSchema}
          />
        ) : null}
        {isMutable && operation?.operation_type === OperationType.INPUT ? (
          <DropdownButton
            text={!operation?.result ? 'Загрузить схему' : 'Изменить схему'}
            title='Выбрать схему для загрузки'
            icon={<IconConnect size='1rem' className='icon-primary' />}
            disabled={isProcessing}
            onClick={handleEditSchema}
          />
        ) : null}
        {isMutable && !operation?.result && operation?.operation_type === OperationType.SYNTHESIS ? (
          <DropdownButton
            text='Активировать синтез'
            titleHtml={
              readyForSynthesis
                ? 'Активировать операцию<br/>и получить синтезированную КС'
                : 'Необходимо предоставить все аргументы'
            }
            icon={<IconExecute size='1rem' className='icon-green' />}
            disabled={isProcessing || !readyForSynthesis}
            onClick={handleRunSynthesis}
          />
        ) : null}

        {isMutable && operation?.result ? (
          <DropdownButton
            text='Конституенты'
            titleHtml='Перенос конституент</br>между схемами'
            icon={<IconChild size='1rem' className='icon-green' />}
            disabled={isProcessing}
            onClick={handleRelocateConstituents}
          />
        ) : null}

        <DropdownButton
          text='Удалить операцию'
          icon={<IconDestroy size='1rem' className='icon-red' />}
          disabled={!isMutable || isProcessing || !operation || !canDelete(operation.id)}
          onClick={handleDeleteOperation}
        />
      </Dropdown>
    </div>
  );
}
