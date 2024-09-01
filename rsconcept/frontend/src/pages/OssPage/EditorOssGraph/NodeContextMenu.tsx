'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { IconConnect, IconDestroy, IconEdit2, IconExecute, IconNewRSForm, IconRSForm } from '@/components/Icons';
import Dropdown from '@/components/ui/Dropdown';
import DropdownButton from '@/components/ui/DropdownButton';
import useClickedOutside from '@/hooks/useClickedOutside';
import { IOperation, OperationID, OperationType } from '@/models/oss';
import { PARAMETER } from '@/utils/constants';
import { prepareTooltip } from '@/utils/labels';

import { useOssEdit } from '../OssEditContext';

export interface ContextMenuData {
  operation: IOperation;
  cursorX: number;
  cursorY: number;
}

interface NodeContextMenuProps extends ContextMenuData {
  onHide: () => void;
  onDelete: (target: OperationID) => void;
  onCreateInput: (target: OperationID) => void;
  onEditSchema: (target: OperationID) => void;
  onEditOperation: (target: OperationID) => void;
  onExecuteOperation: (target: OperationID) => void;
}

function NodeContextMenu({
  operation,
  cursorX,
  cursorY,
  onHide,
  onDelete,
  onCreateInput,
  onEditSchema,
  onEditOperation,
  onExecuteOperation
}: NodeContextMenuProps) {
  const controller = useOssEdit();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  const readyForSynthesis = useMemo(() => {
    if (operation.operation_type !== OperationType.SYNTHESIS) {
      return false;
    }
    if (!controller.schema || operation.result) {
      return false;
    }

    const argumentIDs = controller.schema.graph.expandInputs([operation.id]);
    if (!argumentIDs || argumentIDs.length < 2) {
      return false;
    }

    const argumentOperations = argumentIDs.map(id => controller.schema!.operationByID.get(id)!);
    if (argumentOperations.some(item => item.result === null)) {
      return false;
    }

    return true;
  }, [operation, controller.schema]);

  const handleHide = useCallback(() => {
    setIsOpen(false);
    onHide();
  }, [onHide]);

  useClickedOutside({ ref, callback: handleHide });

  useEffect(() => setIsOpen(true), []);

  const handleOpenSchema = () => {
    controller.openOperationSchema(operation.id);
  };

  const handleEditSchema = () => {
    handleHide();
    onEditSchema(operation.id);
  };

  const handleEditOperation = () => {
    handleHide();
    onEditOperation(operation.id);
  };

  const handleDeleteOperation = () => {
    handleHide();
    onDelete(operation.id);
  };

  const handleCreateSchema = () => {
    handleHide();
    onCreateInput(operation.id);
  };

  const handleRunSynthesis = () => {
    handleHide();
    onExecuteOperation(operation.id);
  };

  return (
    <div ref={ref} className='absolute select-none' style={{ top: cursorY, left: cursorX }}>
      <Dropdown
        isOpen={isOpen}
        stretchLeft={cursorX >= window.innerWidth - PARAMETER.ossContextMenuWidth}
        stretchTop={cursorY >= window.innerHeight - PARAMETER.ossContextMenuHeight}
      >
        <DropdownButton
          text='Редактировать'
          title='Редактировать операцию'
          icon={<IconEdit2 size='1rem' className='icon-primary' />}
          disabled={controller.isProcessing}
          onClick={handleEditOperation}
        />

        {operation.result ? (
          <DropdownButton
            text='Открыть схему'
            titleHtml={prepareTooltip('Открыть привязанную КС', 'Двойной клик')}
            icon={<IconRSForm size='1rem' className='icon-green' />}
            disabled={controller.isProcessing}
            onClick={handleOpenSchema}
          />
        ) : null}
        {controller.isMutable && !operation.result && operation.operation_type === OperationType.INPUT ? (
          <DropdownButton
            text='Создать схему'
            title='Создать пустую схему для загрузки'
            icon={<IconNewRSForm size='1rem' className='icon-green' />}
            disabled={controller.isProcessing}
            onClick={handleCreateSchema}
          />
        ) : null}
        {controller.isMutable && operation.operation_type === OperationType.INPUT ? (
          <DropdownButton
            text={!operation.result ? 'Загрузить схему' : 'Изменить схему'}
            title='Выбрать схему для загрузки'
            icon={<IconConnect size='1rem' className='icon-primary' />}
            disabled={controller.isProcessing}
            onClick={handleEditSchema}
          />
        ) : null}
        {controller.isMutable && !operation.result && operation.operation_type === OperationType.SYNTHESIS ? (
          <DropdownButton
            text='Активировать синтез'
            titleHtml={
              readyForSynthesis
                ? 'Активировать операцию<br/>и получить синтезированную КС'
                : 'Необходимо предоставить все аргументы'
            }
            icon={<IconExecute size='1rem' className='icon-green' />}
            disabled={controller.isProcessing || !readyForSynthesis}
            onClick={handleRunSynthesis}
          />
        ) : null}

        <DropdownButton
          text='Удалить операцию'
          icon={<IconDestroy size='1rem' className='icon-red' />}
          disabled={!controller.isMutable || controller.isProcessing || !controller.canDelete(operation.id)}
          onClick={handleDeleteOperation}
        />
      </Dropdown>
    </div>
  );
}

export default NodeContextMenu;
