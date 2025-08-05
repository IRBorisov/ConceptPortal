'use client';
import { toast } from 'react-toastify';

import { useLibrary } from '@/features/library/backend/use-library';
import { useCloneSchema } from '@/features/oss/backend/use-clone-schema';
import { useCreateReference } from '@/features/oss/backend/use-create-reference';

import { DropdownButton } from '@/components/dropdown';
import {
  IconChild,
  IconClone,
  IconConnect,
  IconDestroy,
  IconEdit2,
  IconExecute,
  IconNewRSForm,
  IconReference,
  IconRSForm
} from '@/components/icons';
import { useDialogsStore } from '@/stores/dialogs';
import { PARAMETER } from '@/utils/constants';
import { errorMsg } from '@/utils/labels';
import { prepareTooltip } from '@/utils/utils';

import { OperationType } from '../../../../backend/types';
import { useCreateInput } from '../../../../backend/use-create-input';
import { useExecuteOperation } from '../../../../backend/use-execute-operation';
import { useMutatingOss } from '../../../../backend/use-mutating-oss';
import { type IOperation } from '../../../../models/oss';
import { LayoutManager } from '../../../../models/oss-layout-api';
import { useOssEdit } from '../../oss-edit-context';
import { useGetLayout } from '../use-get-layout';

interface MenuOperationProps {
  operation: IOperation;
  onHide: () => void;
}

export function MenuOperation({ operation, onHide }: MenuOperationProps) {
  const { items: libraryItems } = useLibrary();
  const { schema, setSelected, navigateOperationSchema, isMutable, canDeleteOperation, deselectAll } = useOssEdit();
  const isProcessing = useMutatingOss();
  const getLayout = useGetLayout();

  const { createInput: inputCreate } = useCreateInput();
  const { executeOperation: operationExecute } = useExecuteOperation();
  const { cloneSchema } = useCloneSchema();
  const { createReference } = useCreateReference();

  const showEditInput = useDialogsStore(state => state.showChangeInputSchema);
  const showRelocateConstituents = useDialogsStore(state => state.showRelocateConstituents);
  const showEditOperation = useDialogsStore(state => state.showEditOperation);
  const showDeleteOperation = useDialogsStore(state => state.showDeleteOperation);
  const showDeleteReference = useDialogsStore(state => state.showDeleteReference);

  const readyForSynthesis = (() => {
    if (operation?.operation_type !== OperationType.SYNTHESIS) {
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

  function handleOpenSchema() {
    if (!operation) {
      return;
    }
    onHide();
    navigateOperationSchema(operation.id);
  }

  function handleEditSchema() {
    if (!operation) {
      return;
    }
    onHide();
    showEditInput({
      oss: schema,
      target: operation,
      layout: getLayout()
    });
  }

  function handleEditOperation() {
    if (!operation || operation.operation_type === OperationType.REFERENCE) {
      return;
    }
    onHide();
    showEditOperation({
      manager: new LayoutManager(schema, getLayout()),
      target: operation
    });
  }

  function handleDeleteOperation() {
    if (!operation || !canDeleteOperation(operation)) {
      return;
    }
    onHide();
    switch (operation.operation_type) {
      case OperationType.REFERENCE:
        showDeleteReference({
          oss: schema,
          target: operation,
          layout: getLayout(),
          beforeDelete: deselectAll
        });
        break;
      case OperationType.INPUT:
      case OperationType.SYNTHESIS:
        showDeleteOperation({
          oss: schema,
          target: operation,
          layout: getLayout(),
          beforeDelete: deselectAll
        });
    }
  }

  function handleOperationExecute() {
    if (!operation) {
      return;
    }
    onHide();
    void operationExecute({
      itemID: schema.id, //
      data: { target: operation.id, layout: getLayout() }
    });
  }

  function handleInputCreate() {
    if (!operation) {
      return;
    }
    if (libraryItems.find(item => item.alias === operation.alias && item.location === schema.location)) {
      toast.error(errorMsg.inputAlreadyExists);
      return;
    }
    onHide();
    void inputCreate({
      itemID: schema.id,
      data: { target: operation.id, layout: getLayout() }
    });
  }

  function handleRelocateConstituents() {
    if (!operation) {
      return;
    }
    onHide();
    showRelocateConstituents({
      oss: schema,
      initialTarget: operation,
      layout: getLayout()
    });
  }

  function handleCreateReference() {
    onHide();

    const layout = getLayout();
    const manager = new LayoutManager(schema, layout);
    const newPosition = manager.newClonePosition(operation.nodeID);
    if (!newPosition) {
      return;
    }

    void createReference({
      itemID: schema.id,
      data: {
        target: operation.id,
        layout: layout,
        position: newPosition
      }
    }).then(response => setTimeout(() => setSelected([`o${response.new_operation}`]), PARAMETER.refreshTimeout));
  }

  function handleClone() {
    onHide();

    const layout = getLayout();
    const manager = new LayoutManager(schema, layout);
    const newPosition = manager.newClonePosition(operation.nodeID);
    if (!newPosition) {
      return;
    }

    void cloneSchema({
      itemID: schema.id,
      data: {
        source_operation: operation.id,
        layout: layout,
        position: newPosition
      }
    }).then(response => setTimeout(() => setSelected([`o${response.new_operation}`]), PARAMETER.refreshTimeout));
  }

  function handleSelectTarget() {
    onHide();
    if (operation.operation_type !== OperationType.REFERENCE) {
      return;
    }
    setSelected([`o${operation.target}`]);
  }

  return (
    <>
      {operation.operation_type !== OperationType.REFERENCE ? (
        <DropdownButton
          text='Редактировать'
          title='Редактировать операцию'
          icon={<IconEdit2 size='1rem' className='icon-primary' />}
          onClick={handleEditOperation}
          disabled={!isMutable || isProcessing}
        />
      ) : (
        <DropdownButton
          text='Оригинал'
          title='Выделить оригинал'
          icon={<IconReference size='1rem' className='icon-primary' />}
          onClick={handleSelectTarget}
        />
      )}

      {operation.result ? (
        <DropdownButton
          text='Открыть схему'
          titleHtml={prepareTooltip('Открыть привязанную КС', 'Двойной клик')}
          aria-label='Открыть привязанную КС'
          icon={<IconRSForm size='1rem' className='icon-primary' />}
          onClick={handleOpenSchema}
          disabled={isProcessing}
        />
      ) : null}
      {isMutable &&
      !operation.result &&
      operation.operation_type === OperationType.SYNTHESIS &&
      operation.arguments.length === 0 ? (
        <DropdownButton
          text='Создать схему'
          title='Создать пустую схему'
          icon={<IconNewRSForm size='1rem' className='icon-green' />}
          onClick={handleInputCreate}
          disabled={isProcessing}
        />
      ) : null}
      {isMutable && operation?.operation_type === OperationType.INPUT ? (
        <DropdownButton
          text={!operation?.result ? 'Загрузить схему' : 'Изменить схему'}
          title='Выбрать схему для загрузки'
          icon={<IconConnect size='1rem' className='icon-primary' />}
          onClick={handleEditSchema}
          disabled={isProcessing}
        />
      ) : null}
      {isMutable && !operation.result && operation.operation_type === OperationType.SYNTHESIS ? (
        <DropdownButton
          text='Активировать синтез'
          titleHtml={
            readyForSynthesis
              ? 'Активировать операцию<br/>и получить синтезированную КС'
              : 'Необходимо предоставить все аргументы'
          }
          aria-label='Активировать операцию и получить синтезированную КС'
          icon={<IconExecute size='1rem' className='icon-green' />}
          onClick={handleOperationExecute}
          disabled={isProcessing || !readyForSynthesis}
        />
      ) : null}

      {isMutable && operation.result && operation.operation_type !== OperationType.REFERENCE ? (
        <DropdownButton
          text='Конституенты'
          titleHtml='Перенос конституент</br>между схемами'
          aria-label='Перенос конституент между схемами'
          icon={<IconChild size='1rem' className='icon-green' />}
          onClick={handleRelocateConstituents}
          disabled={isProcessing}
        />
      ) : null}

      {isMutable && operation.operation_type !== OperationType.REFERENCE ? (
        <DropdownButton
          text='Создать ссылку'
          title='Создать ссылку на результат операции'
          icon={<IconReference size='1rem' className='icon-green' />}
          onClick={handleCreateReference}
          disabled={isProcessing}
        />
      ) : null}

      {isMutable && operation.operation_type !== OperationType.REFERENCE ? (
        <DropdownButton
          text='Клонировать'
          title='Создать и загрузить копию концептуальной схемы'
          icon={<IconClone size='1rem' className='icon-green' />}
          onClick={handleClone}
          disabled={isProcessing || !operation?.result}
        />
      ) : null}

      <DropdownButton
        text='Удалить операцию'
        icon={<IconDestroy size='1rem' className='icon-red' />}
        onClick={handleDeleteOperation}
        disabled={!isMutable || isProcessing || !operation || !canDeleteOperation(operation)}
      />
    </>
  );
}
