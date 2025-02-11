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
import { prompts } from '@/utils/labels';

import { IOperationPosition } from '../../backend/api';
import { useOssSuspense } from '../../backend/useOSS';
import { IOperationSchema, OperationID, OperationType } from '../../models/oss';

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
    void deleteItem(schema.id).then(() => {
      if (searchLocation === schema.location) {
        setSearchLocation('');
      }
      router.push(urls.library);
    });
  }

  function promptCreateOperation({ defaultX, defaultY, inputs, positions, callback }: ICreateOperationPrompt) {
    showCreateOperation({
      oss: schema,
      defaultX: defaultX,
      defaultY: defaultY,
      positions: positions,
      initialInputs: inputs,
      onCreate: callback
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
      positions: positions
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
      positions: positions
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
