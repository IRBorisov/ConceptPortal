'use client';

import { useRef } from 'react';
import { toast } from 'react-toastify';

import { urls, useConceptNavigation } from '@/app';
import { useLibrary } from '@/features/library/backend/use-library';
import { useInputCreate } from '@/features/oss/backend/use-input-create';
import { useOperationExecute } from '@/features/oss/backend/use-operation-execute';

import { Dropdown, DropdownButton } from '@/components/dropdown';
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

import { OperationType } from '../../../backend/types';
import { useMutatingOss } from '../../../backend/use-mutating-oss';
import { type IOperation } from '../../../models/oss';
import { useOssEdit } from '../oss-edit-context';

import { useGetPositions } from './use-get-positions';

// pixels - size of OSS context menu
const MENU_WIDTH = 200;
const MENU_HEIGHT = 200;

export interface ContextMenuData {
  operation: IOperation | null;
  cursorX: number;
  cursorY: number;
}

interface NodeContextMenuProps extends ContextMenuData {
  isOpen: boolean;
  onHide: () => void;
}

export function NodeContextMenu({ isOpen, operation, cursorX, cursorY, onHide }: NodeContextMenuProps) {
  const router = useConceptNavigation();
  const { items: libraryItems } = useLibrary();
  const { schema, navigateOperationSchema, isMutable, canDeleteOperation: canDelete } = useOssEdit();
  const isProcessing = useMutatingOss();
  const getPositions = useGetPositions();

  const { inputCreate } = useInputCreate();
  const { operationExecute } = useOperationExecute();

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

  const ref = useRef<HTMLDivElement>(null);

  function handleBlur(event: React.FocusEvent<HTMLDivElement>) {
    if (!ref.current?.contains(event.relatedTarget as Node)) {
      onHide();
    }
  }

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
      positions: getPositions()
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
      positions: getPositions()
    });
  }

  function handleDeleteOperation() {
    if (!operation || !canDelete(operation)) {
      return;
    }
    onHide();
    showDeleteOperation({
      oss: schema,
      target: operation,
      positions: getPositions()
    });
  }

  function handleOperationExecute() {
    if (!operation) {
      return;
    }
    onHide();
    void operationExecute({
      itemID: schema.id, //
      data: { target: operation.id, positions: getPositions() }
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
      data: { target: operation.id, positions: getPositions() }
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
      positions: getPositions()
    });
  }

  return (
    <div
      ref={ref}
      onBlur={handleBlur}
      className='relative'
      style={{ top: `calc(${cursorY}px - 2.5rem)`, left: cursorX }}
    >
      <Dropdown
        isOpen={isOpen}
        stretchLeft={cursorX >= window.innerWidth - MENU_WIDTH}
        stretchTop={cursorY >= window.innerHeight - MENU_HEIGHT}
        margin={cursorY >= window.innerHeight - MENU_HEIGHT ? 'mb-3' : 'mt-3'}
      >
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
          disabled={!isMutable || isProcessing || !operation || !canDelete(operation)}
        />
      </Dropdown>
    </div>
  );
}
