'use client';

import { createContext, useContext, useEffect, useState } from 'react';

import { urls, useConceptNavigation } from '@/app';
import { useAuthSuspense } from '@/features/auth/backend/useAuth';
import { useDeleteItem } from '@/features/library/backend/useDeleteItem';
import { ILibraryItemEditor, LibraryItemID } from '@/features/library/models/library';
import { useLibrarySearchStore } from '@/features/library/stores/librarySearch';
import { RSTabID } from '@/features/rsform/pages/RSFormPage/RSEditContext';
import { UserRole } from '@/features/users/models/user';
import { useDialogsStore } from '@/stores/dialogs';
import { usePreferencesStore } from '@/stores/preferences';
import { useRoleStore } from '@/stores/role';
import { PARAMETER } from '@/utils/constants';
import { prompts } from '@/utils/labels';

import { IOperationPosition } from '../../backend/api';
import { useOperationCreate } from '../../backend/useOperationCreate';
import { useOperationUpdate } from '../../backend/useOperationUpdate';
import { useOssSuspense } from '../../backend/useOSS';
import { useRelocateConstituents } from '../../backend/useRelocateConstituents';
import { useUpdatePositions } from '../../backend/useUpdatePositions';
import { IOperationSchema, OperationID, OperationType } from '../../models/oss';
import { calculateInsertPosition } from '../../models/ossAPI';

export enum OssTabID {
  CARD = 0,
  GRAPH = 1
}

export interface ICreateOperationPrompt {
  defaultX: number;
  defaultY: number;
  inputs: OperationID[];
  positions: IOperationPosition[];
  callback: (newID: OperationID) => void;
}

export interface IOssEditContext extends ILibraryItemEditor {
  schema: IOperationSchema;
  selected: OperationID[];

  isOwned: boolean;
  isMutable: boolean;
  isAttachedToOSS: boolean;

  showTooltip: boolean;
  setShowTooltip: (newValue: boolean) => void;

  navigateTab: (tab: OssTabID) => void;
  navigateOperationSchema: (target: OperationID) => void;

  deleteSchema: () => void;
  setSelected: React.Dispatch<React.SetStateAction<OperationID[]>>;

  canDelete: (target: OperationID) => boolean;
  promptCreateOperation: (props: ICreateOperationPrompt) => void;
  promptDeleteOperation: (target: OperationID, positions: IOperationPosition[]) => void;
  promptEditInput: (target: OperationID, positions: IOperationPosition[]) => void;
  promptEditOperation: (target: OperationID, positions: IOperationPosition[]) => void;
  promptRelocateConstituents: (target: OperationID | undefined, positions: IOperationPosition[]) => void;
}

const OssEditContext = createContext<IOssEditContext | null>(null);
export const useOssEdit = () => {
  const context = useContext(OssEditContext);
  if (context === null) {
    throw new Error('useOssEdit has to be used within <OssEditState>');
  }
  return context;
};

interface OssEditStateProps {
  itemID: LibraryItemID;
}

export const OssEditState = ({ itemID, children }: React.PropsWithChildren<OssEditStateProps>) => {
  const router = useConceptNavigation();
  const adminMode = usePreferencesStore(state => state.adminMode);

  const role = useRoleStore(state => state.role);
  const adjustRole = useRoleStore(state => state.adjustRole);
  const setSearchLocation = useLibrarySearchStore(state => state.setLocation);
  const searchLocation = useLibrarySearchStore(state => state.location);

  const { user } = useAuthSuspense();
  const { schema } = useOssSuspense({ itemID: itemID });

  const isOwned = !!user.id && user.id === schema.owner;
  const isMutable = role > UserRole.READER && !schema.read_only;

  const [showTooltip, setShowTooltip] = useState(true);
  const [selected, setSelected] = useState<OperationID[]>([]);

  const showEditInput = useDialogsStore(state => state.showChangeInputSchema);
  const showEditOperation = useDialogsStore(state => state.showEditOperation);
  const showDeleteOperation = useDialogsStore(state => state.showDeleteOperation);
  const showRelocateConstituents = useDialogsStore(state => state.showRelocateConstituents);
  const showCreateOperation = useDialogsStore(state => state.showCreateOperation);

  const { deleteItem } = useDeleteItem();
  const { updatePositions } = useUpdatePositions();
  const { operationCreate } = useOperationCreate();
  const { operationUpdate } = useOperationUpdate();
  const { relocateConstituents } = useRelocateConstituents();

  useEffect(
    () =>
      adjustRole({
        isOwner: isOwned,
        isEditor: !!user.id && schema.editors.includes(user.id),
        isStaff: user.is_staff,
        adminMode: adminMode
      }),
    [schema, adjustRole, isOwned, user, adminMode]
  );

  function navigateTab(tab: OssTabID) {
    const url = urls.oss_props({
      id: schema.id,
      tab: tab
    });
    router.push(url);
  }

  function navigateOperationSchema(target: OperationID) {
    const node = schema.operationByID.get(target);
    if (!node?.result) {
      return;
    }
    router.push(urls.schema_props({ id: node.result, tab: RSTabID.CST_LIST }));
  }

  function deleteSchema() {
    if (!window.confirm(prompts.deleteOSS)) {
      return;
    }
    deleteItem(schema.id, () => {
      if (searchLocation === schema.location) {
        setSearchLocation('');
      }
      router.push(urls.library);
    });
  }

  function promptCreateOperation({ defaultX, defaultY, inputs, positions, callback }: ICreateOperationPrompt) {
    showCreateOperation({
      oss: schema,
      onCreate: data => {
        const target = calculateInsertPosition(schema, data.item_data.operation_type, data.arguments ?? [], positions, {
          x: defaultX,
          y: defaultY
        });
        data.positions = positions;
        data.item_data.position_x = target.x;
        data.item_data.position_y = target.y;
        operationCreate({ itemID: schema.id, data }, operation => {
          if (callback) {
            setTimeout(() => callback(operation.id), PARAMETER.refreshTimeout);
          }
        });
      },
      initialInputs: inputs
    });
  }

  function canDelete(target: OperationID) {
    const operation = schema.operationByID.get(target);
    if (!operation) {
      return false;
    }
    if (operation.operation_type === OperationType.INPUT) {
      return true;
    }
    return schema.graph.expandOutputs([target]).length === 0;
  }

  function promptEditOperation(target: OperationID, positions: IOperationPosition[]) {
    const operation = schema.operationByID.get(target);
    if (!operation) {
      return;
    }
    showEditOperation({
      oss: schema,
      target: operation,
      onSubmit: data => {
        data.positions = positions;
        operationUpdate({ itemID: schema.id, data });
      }
    });
  }

  function promptDeleteOperation(target: OperationID, positions: IOperationPosition[]) {
    const operation = schema.operationByID.get(target);
    if (!operation) {
      return;
    }
    showDeleteOperation({
      oss: schema,
      positions: positions,
      target: operation
    });
  }

  function promptEditInput(target: OperationID, positions: IOperationPosition[]) {
    const operation = schema.operationByID.get(target);
    if (!operation) {
      return;
    }
    showEditInput({
      oss: schema,
      target: operation,
      positions: positions
    });
  }

  function promptRelocateConstituents(target: OperationID | undefined, positions: IOperationPosition[]) {
    const operation = target ? schema.operationByID.get(target) : undefined;
    showRelocateConstituents({
      oss: schema,
      initialTarget: operation,
      onSubmit: data => {
        if (
          positions.every(item => {
            const operation = schema.operationByID.get(item.id)!;
            return operation.position_x === item.position_x && operation.position_y === item.position_y;
          })
        ) {
          relocateConstituents({ itemID: schema.id, data });
        } else {
          updatePositions(
            {
              isSilent: true,
              itemID: schema.id, //
              positions: positions
            },
            () => relocateConstituents({ itemID: schema.id, data })
          );
        }
      }
    });
  }

  return (
    <OssEditContext
      value={{
        schema,
        selected,

        navigateTab,

        deleteSchema,

        showTooltip,
        setShowTooltip,

        isOwned,
        isMutable,
        isAttachedToOSS: false,

        setSelected,

        navigateOperationSchema,
        promptCreateOperation,
        canDelete,
        promptDeleteOperation,
        promptEditInput,
        promptEditOperation,
        promptRelocateConstituents
      }}
    >
      {children}
    </OssEditContext>
  );
};
