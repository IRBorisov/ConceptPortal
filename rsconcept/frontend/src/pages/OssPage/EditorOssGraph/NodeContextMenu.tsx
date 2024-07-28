'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import { IconConnect, IconDestroy, IconEdit2, IconExecute, IconNewItem, IconRSForm } from '@/components/Icons';
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
}

function NodeContextMenu({
  operation,
  cursorX,
  cursorY,
  onHide,
  onDelete,
  onCreateInput,
  onEditSchema
}: NodeContextMenuProps) {
  const controller = useOssEdit();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

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
    toast.error('Not implemented');
    handleHide();
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
    toast.error('Not implemented');
    handleHide();
  };

  return (
    <div ref={ref} className='absolute' style={{ top: cursorY, left: cursorX, width: 10, height: 10 }}>
      <Dropdown isOpen={isOpen} stretchLeft={cursorX >= window.innerWidth - PARAMETER.ossContextMenuWidth}>
        <DropdownButton
          text='Редактировать'
          titleHtml={prepareTooltip('Редактировать операцию', 'Ctrl + клик')}
          icon={<IconEdit2 size='1rem' className='icon-primary' />}
          disabled={controller.isProcessing}
          onClick={handleEditOperation}
        />

        {operation.result ? (
          <DropdownButton
            text='Открыть схему'
            title='Открыть привязанную КС'
            icon={<IconRSForm size='1rem' className='icon-green' />}
            disabled={controller.isProcessing}
            onClick={handleOpenSchema}
          />
        ) : null}
        {controller.isMutable && !operation.result && operation.operation_type === OperationType.INPUT ? (
          <DropdownButton
            text='Создать схему'
            title='Создать пустую схему для загрузки'
            icon={<IconNewItem size='1rem' className='icon-green' />}
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
            text='Выполнить синтез'
            title='Выполнить операцию и получить синтезированную КС'
            icon={<IconExecute size='1rem' className='icon-green' />}
            disabled={controller.isProcessing}
            onClick={handleRunSynthesis}
          />
        ) : null}

        <DropdownButton
          text='Удалить операцию'
          icon={<IconDestroy size='1rem' className='icon-red' />}
          disabled={!controller.isMutable || controller.isProcessing}
          onClick={handleDeleteOperation}
        />
      </Dropdown>
    </div>
  );
}

export default NodeContextMenu;
