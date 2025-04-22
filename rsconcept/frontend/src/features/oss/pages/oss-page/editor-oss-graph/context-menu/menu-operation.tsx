'use client';
import { toast } from 'react-toastify';

import { urls, useConceptNavigation } from '@/app';
import { useLibrary } from '@/features/library/backend/use-library';
import { useCreateInput } from '@/features/oss/backend/use-create-input';
import { useExecuteOperation } from '@/features/oss/backend/use-execute-operation';

import { DropdownButton } from '@/components/dropdown';
import {
  IconChild,
  IconConnect,
  IconDestroy,
  IconEdit2,
  IconExecute,
  IconNewRSForm,
  IconRSForm
} from '@/components/icons';
import { useDialogsStore } from '@/stores/dialogs';
import { errorMsg } from '@/utils/labels';
import { prepareTooltip } from '@/utils/utils';

import { OperationType } from '../../../../backend/types';
import { useMutatingOss } from '../../../../backend/use-mutating-oss';
import { type IOperation } from '../../../../models/oss';
import { useOssEdit } from '../../oss-edit-context';
import { useGetLayout } from '../use-get-layout';

interface MenuOperationProps {
  operation: IOperation;
  onHide: () => void;
}

export function MenuOperation({ operation, onHide }: MenuOperationProps) {
  const router = useConceptNavigation();
  const { items: libraryItems } = useLibrary();
  const { schema, navigateOperationSchema, isMutable, canDeleteOperation } = useOssEdit();
  const isProcessing = useMutatingOss();
  const getLayout = useGetLayout();

  const { createInput: inputCreate } = useCreateInput();
  const { executeOperation: operationExecute } = useExecuteOperation();

  const showEditInput = useDialogsStore(state => state.showChangeInputSchema);
  const showRelocateConstituents = useDialogsStore(state => state.showRelocateConstituents);
  const showEditOperation = useDialogsStore(state => state.showEditOperation);
  const showDeleteOperation = useDialogsStore(state => state.showDeleteOperation);

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
    if (!operation) {
      return;
    }
    onHide();
    showEditOperation({
      oss: schema,
      target: operation,
      layout: getLayout()
    });
  }

  function handleDeleteOperation() {
    if (!operation || !canDeleteOperation(operation)) {
      return;
    }
    onHide();
    showDeleteOperation({
      oss: schema,
      target: operation,
      layout: getLayout()
    });
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
    }).then(new_schema => router.push({ path: urls.schema(new_schema.id), force: true }));
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

  return (
    <>
      <DropdownButton
        text='Редактировать'
        title='Редактировать операцию'
        icon={<IconEdit2 size='1rem' className='icon-primary' />}
        onClick={handleEditOperation}
        disabled={!isMutable || isProcessing}
      />

      {operation?.result ? (
        <DropdownButton
          text='Открыть схему'
          titleHtml={prepareTooltip('Открыть привязанную КС', 'Двойной клик')}
          aria-label='Открыть привязанную КС'
          icon={<IconRSForm size='1rem' className='icon-green' />}
          onClick={handleOpenSchema}
          disabled={isProcessing}
        />
      ) : null}
      {isMutable && !operation?.result && operation?.arguments.length === 0 ? (
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
      {isMutable && !operation?.result && operation?.operation_type === OperationType.SYNTHESIS ? (
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

      {isMutable && operation?.result ? (
        <DropdownButton
          text='Конституенты'
          titleHtml='Перенос конституент</br>между схемами'
          aria-label='Перенос конституент между схемами'
          icon={<IconChild size='1rem' className='icon-green' />}
          onClick={handleRelocateConstituents}
          disabled={isProcessing}
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
