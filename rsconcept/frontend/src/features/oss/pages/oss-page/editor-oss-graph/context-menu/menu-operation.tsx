'use client';

import { toast } from 'react-toastify';

import { useConceptNavigation } from '@/app';
import { useLibrary } from '@/features/library/backend/use-library';

import { DropdownButton } from '@/components/dropdown';
import {
  IconChild,
  IconClone,
  IconConnect,
  IconDestroy,
  IconEdit,
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
import { useCloneSchema } from '../../../../backend/use-clone-schema';
import { useCreateInput } from '../../../../backend/use-create-input';
import { useCreateReference } from '../../../../backend/use-create-replica';
import { useExecuteOperation } from '../../../../backend/use-execute-operation';
import { useMutatingOss } from '../../../../backend/use-mutating-oss';
import { type Operation } from '../../../../models/oss';
import { LayoutManager } from '../../../../models/oss-layout-api';
import { useOssEdit } from '../../oss-edit-context';
import { useGetLayout } from '../use-get-layout';

interface MenuOperationProps {
  operation: Operation;
  onHide: () => void;
}

export function MenuOperation({ operation, onHide }: MenuOperationProps) {
  const router = useConceptNavigation();
  const { items: libraryItems } = useLibrary();
  const { schema, setSelectedNodes, isMutable, canDeleteOperation, deselectAll } = useOssEdit();
  const isProcessing = useMutatingOss();
  const getLayout = useGetLayout();

  const { createInput: inputCreate } = useCreateInput();
  const { executeOperation: operationExecute } = useExecuteOperation();
  const { cloneSchema } = useCloneSchema();
  const { createReplica: createReference } = useCreateReference();

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
    if (operation.result) {
      router.gotoCstList(operation.result);
    }
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
    if (!operation || operation.operation_type === OperationType.REPLICA) {
      return;
    }
    onHide();
    showEditOperation({
      layout: getLayout(),
      ossID: schema.id,
      targetID: operation.id
    });
  }

  function handleDeleteOperation() {
    if (!operation || !canDeleteOperation(operation)) {
      return;
    }
    onHide();
    switch (operation.operation_type) {
      case OperationType.REPLICA:
        showDeleteReference({
          ossID: schema.id,
          targetID: operation.id,
          layout: getLayout(),
          beforeDelete: deselectAll
        });
        break;
      case OperationType.INPUT:
      case OperationType.SYNTHESIS:
        showDeleteOperation({
          ossID: schema.id,
          targetID: operation.id,
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
      ossID: schema.id,
      targetID: operation.id,
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
    }).then(response => setTimeout(() => setSelectedNodes([`o${response.new_operation}`]), PARAMETER.refreshTimeout));
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
    }).then(response => setTimeout(() => setSelectedNodes([`o${response.new_operation}`]), PARAMETER.refreshTimeout));
  }

  function handleSelectTarget() {
    onHide();
    if (operation.operation_type !== OperationType.REPLICA) {
      return;
    }
    setSelectedNodes([`o${operation.target}`]);
  }

  return (
    <>
      {operation.operation_type !== OperationType.REPLICA ? (
        <DropdownButton
          text='Редактировать'
          title='Редактировать операцию'
          icon={<IconEdit size='1rem' className='icon-primary' />}
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
      {isMutable && !operation.result && operation.operation_type === OperationType.INPUT ? (
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
      {isMutable &&
        !operation.result &&
        operation.operation_type === OperationType.SYNTHESIS &&
        operation.arguments.length > 0 ? (
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

      {isMutable && operation.result && operation.operation_type !== OperationType.REPLICA ? (
        <DropdownButton
          text='Конституенты'
          titleHtml='Перенос конституент</br>между схемами'
          aria-label='Перенос конституент между схемами'
          icon={<IconChild size='1rem' className='icon-green' />}
          onClick={handleRelocateConstituents}
          disabled={isProcessing}
        />
      ) : null}

      {isMutable && operation.operation_type !== OperationType.REPLICA ? (
        <DropdownButton
          text='Создать реплику'
          title='Создать реплику результата операции'
          icon={<IconReference size='1rem' className='icon-green' />}
          onClick={handleCreateReference}
          disabled={isProcessing}
        />
      ) : null}

      {isMutable && operation.operation_type !== OperationType.REPLICA ? (
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
