'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { urls } from '@/app/urls';
import { useAuth } from '@/context/AuthContext';
import { useLibrary } from '@/context/LibraryContext';
import { useConceptNavigation } from '@/context/NavigationContext';
import { useOSS } from '@/context/OssContext';
import { AccessPolicy, ILibraryItemEditor, LibraryItemID } from '@/models/library';
import { Position2D } from '@/models/miscellaneous';
import { calculateInsertPosition } from '@/models/miscellaneousAPI';
import {
  ICstRelocateData,
  IOperationCreateData,
  IOperationDeleteData,
  IOperationPosition,
  IOperationSchema,
  IOperationSetInputData,
  IOperationUpdateData,
  OperationID,
  OperationType
} from '@/models/oss';
import { UserID, UserRole } from '@/models/user';
import { useDialogsStore } from '@/stores/dialogs';
import { usePreferencesStore } from '@/stores/preferences';
import { useRoleStore } from '@/stores/role';
import { PARAMETER } from '@/utils/constants';
import { errors, information } from '@/utils/labels';

import { RSTabID } from '../RSFormPage/RSTabs';

export interface ICreateOperationPrompt {
  defaultX: number;
  defaultY: number;
  inputs: OperationID[];
  positions: IOperationPosition[];
  callback: (newID: OperationID) => void;
}

export interface IOssEditContext extends ILibraryItemEditor {
  schema?: IOperationSchema;
  selected: OperationID[];

  isMutable: boolean;
  isProcessing: boolean;
  isAttachedToOSS: boolean;

  showTooltip: boolean;
  setShowTooltip: (newValue: boolean) => void;

  setOwner: (newOwner: UserID) => void;
  setAccessPolicy: (newPolicy: AccessPolicy) => void;
  promptEditors: () => void;
  promptLocation: () => void;

  setSelected: React.Dispatch<React.SetStateAction<OperationID[]>>;

  share: () => void;

  openOperationSchema: (target: OperationID) => void;

  savePositions: (positions: IOperationPosition[], callback?: () => void) => void;
  promptCreateOperation: (props: ICreateOperationPrompt) => void;
  canDelete: (target: OperationID) => boolean;
  promptDeleteOperation: (target: OperationID, positions: IOperationPosition[]) => void;
  createInput: (target: OperationID, positions: IOperationPosition[]) => void;
  promptEditInput: (target: OperationID, positions: IOperationPosition[]) => void;
  promptEditOperation: (target: OperationID, positions: IOperationPosition[]) => void;
  executeOperation: (target: OperationID, positions: IOperationPosition[]) => void;
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
  selected: OperationID[];
  setSelected: React.Dispatch<React.SetStateAction<OperationID[]>>;
}

export const OssEditState = ({ selected, setSelected, children }: React.PropsWithChildren<OssEditStateProps>) => {
  const router = useConceptNavigation();
  const { user } = useAuth();
  const adminMode = usePreferencesStore(state => state.adminMode);

  const role = useRoleStore(state => state.role);
  const adjustRole = useRoleStore(state => state.adjustRole);
  const model = useOSS();
  const library = useLibrary();

  const isMutable = role > UserRole.READER && !model.schema?.read_only;

  const [showTooltip, setShowTooltip] = useState(true);

  const [insertPosition, setInsertPosition] = useState<Position2D>({ x: 0, y: 0 });
  const [createCallback, setCreateCallback] = useState<((newID: OperationID) => void) | undefined>(undefined);

  const showEditEditors = useDialogsStore(state => state.showEditEditors);
  const showEditLocation = useDialogsStore(state => state.showChangeLocation);
  const showEditInput = useDialogsStore(state => state.showChangeInputSchema);
  const showEditOperation = useDialogsStore(state => state.showEditOperation);
  const showDeleteOperation = useDialogsStore(state => state.showDeleteOperation);
  const showRelocateConstituents = useDialogsStore(state => state.showRelocateConstituents);
  const showCreateOperation = useDialogsStore(state => state.showCreateOperation);

  const [positions, setPositions] = useState<IOperationPosition[]>([]);

  useEffect(
    () =>
      adjustRole({
        isOwner: model.isOwned,
        isEditor: (user && model.schema?.editors.includes(user?.id)) ?? false,
        isStaff: user?.is_staff ?? false,
        adminMode: adminMode
      }),
    [model.schema, adjustRole, model.isOwned, user, adminMode]
  );

  const handleSetLocation = useCallback(
    (newLocation: string) => {
      if (!model.schema) {
        return;
      }
      model.setLocation(newLocation, () => toast.success(information.moveComplete));
    },
    [model]
  );

  const share = useCallback(() => {
    const currentRef = window.location.href;
    const url = currentRef.includes('?') ? currentRef + '&share' : currentRef + '?share';
    navigator.clipboard
      .writeText(url)
      .then(() => toast.success(information.linkReady))
      .catch(console.error);
  }, []);

  const setOwner = useCallback(
    (newOwner: UserID) => {
      model.setOwner(newOwner, () => toast.success(information.changesSaved));
    },
    [model]
  );

  const setAccessPolicy = useCallback(
    (newPolicy: AccessPolicy) => {
      model.setAccessPolicy(newPolicy, () => toast.success(information.changesSaved));
    },
    [model]
  );

  const handleSetEditors = useCallback(
    (newEditors: UserID[]) => {
      model.setEditors(newEditors, () => toast.success(information.changesSaved));
    },
    [model]
  );

  const openOperationSchema = useCallback(
    (target: OperationID) => {
      const node = model.schema?.operationByID.get(target);
      if (!node?.result) {
        return;
      }
      router.push(urls.schema_props({ id: node.result, tab: RSTabID.CST_LIST }));
    },
    [router, model]
  );

  const savePositions = useCallback(
    (positions: IOperationPosition[], callback?: () => void) => {
      model.savePositions({ positions: positions }, () => {
        positions.forEach(item => {
          const operation = model.schema?.operationByID.get(item.id);
          if (operation) {
            operation.position_x = item.position_x;
            operation.position_y = item.position_y;
          }
        });
        toast.success(information.changesSaved);
        callback?.();
      });
    },
    [model]
  );

  const handleCreateOperation = useCallback(
    (data: IOperationCreateData) => {
      const target = calculateInsertPosition(
        model.schema!,
        data.item_data.operation_type,
        data.arguments!,
        positions,
        insertPosition
      );
      data.positions = positions;
      data.item_data.position_x = target.x;
      data.item_data.position_y = target.y;
      model.createOperation(data, operation => {
        toast.success(information.newOperation(operation.alias));
        if (createCallback) {
          setTimeout(() => createCallback(operation.id), PARAMETER.refreshTimeout);
        }
      });
    },
    [model, positions, insertPosition, createCallback]
  );

  const handleEditOperation = useCallback(
    (data: IOperationUpdateData) => {
      data.positions = positions;
      model.updateOperation(data, () => toast.success(information.changesSaved));
    },
    [model, positions]
  );

  const canDelete = useCallback(
    (target: OperationID) => {
      if (!model.schema) {
        return false;
      }
      const operation = model.schema.operationByID.get(target);
      if (!operation) {
        return false;
      }
      if (operation.operation_type === OperationType.INPUT) {
        return true;
      }
      return model.schema.graph.expandOutputs([target]).length === 0;
    },
    [model]
  );

  const handleDeleteOperation = useCallback(
    (targetID: OperationID, keepConstituents: boolean, deleteSchema: boolean) => {
      const data: IOperationDeleteData = {
        target: targetID,
        positions: positions,
        keep_constituents: keepConstituents,
        delete_schema: deleteSchema
      };
      model.deleteOperation(data, () => toast.success(information.operationDestroyed));
    },
    [model, positions]
  );

  const createInput = useCallback(
    (target: OperationID, positions: IOperationPosition[]) => {
      const operation = model.schema?.operationByID.get(target);
      if (!model.schema || !operation) {
        return;
      }
      if (library.items.find(item => item.alias === operation.alias && item.location === model.schema!.location)) {
        toast.error(errors.inputAlreadyExists);
        return;
      }
      model.createInput({ target: target, positions: positions }, new_schema => {
        toast.success(information.newLibraryItem);
        router.push(urls.schema(new_schema.id));
      });
    },
    [model, library.items, router]
  );

  const setTargetInput = useCallback(
    (target: OperationID, newInput: LibraryItemID | undefined) => {
      const data: IOperationSetInputData = {
        target: target,
        positions: positions,
        input: newInput ?? null
      };
      model.setInput(data, () => toast.success(information.changesSaved));
    },
    [model, positions]
  );

  const handleRelocateConstituents = useCallback(
    (data: ICstRelocateData) => {
      if (
        positions.every(item => {
          const operation = model.schema!.operationByID.get(item.id)!;
          return operation.position_x === item.position_x && operation.position_y === item.position_y;
        })
      ) {
        model.relocateConstituents(data, () => toast.success(information.changesSaved));
      } else {
        model.savePositions({ positions: positions }, () =>
          model.relocateConstituents(data, () => toast.success(information.changesSaved))
        );
      }
    },
    [model, positions]
  );

  const executeOperation = useCallback(
    (target: OperationID, positions: IOperationPosition[]) => {
      const data = {
        target: target,
        positions: positions
      };
      model.executeOperation(data, () => toast.success(information.operationExecuted));
    },
    [model]
  );

  const promptEditors = useCallback(() => {
    if (!model.schema) {
      return;
    }
    showEditEditors({ editors: model.schema.editors, setEditors: handleSetEditors });
  }, [model.schema, showEditEditors, handleSetEditors]);

  const promptLocation = useCallback(() => {
    if (!model.schema) {
      return;
    }
    showEditLocation({ initial: model.schema.location, onChangeLocation: handleSetLocation });
  }, [model.schema, showEditLocation, handleSetLocation]);

  const promptCreateOperation = useCallback(
    ({ defaultX, defaultY, inputs, positions, callback }: ICreateOperationPrompt) => {
      if (!model.schema) {
        return;
      }
      setInsertPosition({ x: defaultX, y: defaultY });
      setPositions(positions);
      setCreateCallback(() => callback);
      showCreateOperation({ oss: model.schema, onCreate: handleCreateOperation, initialInputs: inputs });
    },
    [model.schema, showCreateOperation, handleCreateOperation]
  );

  const promptEditOperation = useCallback(
    (target: OperationID, positions: IOperationPosition[]) => {
      const operation = model.schema?.operationByID.get(target);
      if (!model.schema || !operation) {
        return;
      }
      setPositions(positions);
      showEditOperation({ oss: model.schema, target: operation, onSubmit: handleEditOperation });
    },
    [model.schema, showEditOperation, handleEditOperation]
  );

  const promptDeleteOperation = useCallback(
    (target: OperationID, positions: IOperationPosition[]) => {
      const operation = model.schema?.operationByID.get(target);
      if (!model.schema || !operation) {
        return;
      }
      setPositions(positions);
      showDeleteOperation({ target: operation, onSubmit: handleDeleteOperation });
    },
    [model.schema, showDeleteOperation, handleDeleteOperation]
  );

  const promptEditInput = useCallback(
    (target: OperationID, positions: IOperationPosition[]) => {
      const operation = model.schema?.operationByID.get(target);
      if (!model.schema || !operation) {
        return;
      }
      setPositions(positions);
      showEditInput({ oss: model.schema, target: operation, onSubmit: setTargetInput });
    },
    [model.schema, showEditInput, setTargetInput]
  );

  const promptRelocateConstituents = useCallback(
    (target: OperationID | undefined, positions: IOperationPosition[]) => {
      if (!model.schema) {
        return;
      }
      const operation = target ? model.schema?.operationByID.get(target) : undefined;
      setPositions(positions);
      showRelocateConstituents({ oss: model.schema, initialTarget: operation, onSubmit: handleRelocateConstituents });
    },
    [model.schema, showRelocateConstituents, handleRelocateConstituents]
  );

  return (
    <OssEditContext
      value={{
        schema: model.schema,
        selected,

        showTooltip,
        setShowTooltip,

        isMutable,
        isProcessing: model.processing,
        isAttachedToOSS: false,

        setOwner,
        setAccessPolicy,
        promptEditors,
        promptLocation,

        share,
        setSelected,

        openOperationSchema,
        savePositions,
        promptCreateOperation,
        canDelete,
        promptDeleteOperation,
        createInput,
        promptEditInput,
        promptEditOperation,
        executeOperation,
        promptRelocateConstituents
      }}
    >
      {children}
    </OssEditContext>
  );
};
