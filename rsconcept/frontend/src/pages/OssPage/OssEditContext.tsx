'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import { urls } from '@/app/urls';
import { useAccessMode } from '@/context/AccessModeContext';
import { useAuth } from '@/context/AuthContext';
import { useConceptOptions } from '@/context/ConceptOptionsContext';
import { useLibrary } from '@/context/LibraryContext';
import { useConceptNavigation } from '@/context/NavigationContext';
import { useOSS } from '@/context/OssContext';
import DlgChangeInputSchema from '@/dialogs/DlgChangeInputSchema';
import DlgChangeLocation from '@/dialogs/DlgChangeLocation';
import DlgCreateOperation from '@/dialogs/DlgCreateOperation';
import DlgDeleteOperation from '@/dialogs/DlgDeleteOperation';
import DlgEditEditors from '@/dialogs/DlgEditEditors';
import DlgEditOperation from '@/dialogs/DlgEditOperation';
import DlgRelocateConstituents from '@/dialogs/DlgRelocateConstituents';
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
import { UserID, UserLevel } from '@/models/user';
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
  const { adminMode } = useConceptOptions();
  const { accessLevel, setAccessLevel } = useAccessMode();
  const model = useOSS();
  const library = useLibrary();

  const isMutable = useMemo(
    () => accessLevel > UserLevel.READER && !model.schema?.read_only,
    [accessLevel, model.schema?.read_only]
  );

  const [showTooltip, setShowTooltip] = useState(true);

  const [showEditEditors, setShowEditEditors] = useState(false);
  const [showEditLocation, setShowEditLocation] = useState(false);
  const [showEditInput, setShowEditInput] = useState(false);
  const [showEditOperation, setShowEditOperation] = useState(false);
  const [showDeleteOperation, setShowDeleteOperation] = useState(false);
  const [showRelocateConstituents, setShowRelocateConstituents] = useState(false);

  const [showCreateOperation, setShowCreateOperation] = useState(false);
  const [insertPosition, setInsertPosition] = useState<Position2D>({ x: 0, y: 0 });
  const [initialInputs, setInitialInputs] = useState<OperationID[]>([]);
  const [createCallback, setCreateCallback] = useState<((newID: OperationID) => void) | undefined>(undefined);

  const [positions, setPositions] = useState<IOperationPosition[]>([]);
  const [targetOperationID, setTargetOperationID] = useState<OperationID | undefined>(undefined);
  const targetOperation = useMemo(
    () => (targetOperationID ? model.schema?.operationByID.get(targetOperationID) : undefined),
    [model, targetOperationID]
  );

  useEffect(
    () =>
      setAccessLevel(prev => {
        if (
          prev === UserLevel.EDITOR &&
          (model.isOwned || user?.is_staff || (user && model.schema?.editors.includes(user.id)))
        ) {
          return UserLevel.EDITOR;
        } else if (user?.is_staff && (prev === UserLevel.ADMIN || adminMode)) {
          return UserLevel.ADMIN;
        } else if (model.isOwned) {
          return UserLevel.OWNER;
        } else if (user?.id && model.schema?.editors.includes(user?.id)) {
          return UserLevel.EDITOR;
        } else {
          return UserLevel.READER;
        }
      }),
    [model.schema, setAccessLevel, model.isOwned, user, adminMode]
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

  const promptEditors = useCallback(() => {
    setShowEditEditors(true);
  }, []);

  const promptLocation = useCallback(() => {
    setShowEditLocation(true);
  }, []);

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

  const setEditors = useCallback(
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

  const promptCreateOperation = useCallback(
    ({ defaultX, defaultY, inputs, positions, callback }: ICreateOperationPrompt) => {
      setInsertPosition({ x: defaultX, y: defaultY });
      setInitialInputs(inputs);
      setPositions(positions);
      setCreateCallback(() => callback);
      setShowCreateOperation(true);
    },
    []
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

  const promptEditOperation = useCallback((target: OperationID, positions: IOperationPosition[]) => {
    setPositions(positions);
    setTargetOperationID(target);
    setShowEditOperation(true);
  }, []);

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

  const promptDeleteOperation = useCallback((target: OperationID, positions: IOperationPosition[]) => {
    setPositions(positions);
    setTargetOperationID(target);
    setShowDeleteOperation(true);
  }, []);

  const deleteOperation = useCallback(
    (keepConstituents: boolean, deleteSchema: boolean) => {
      if (!targetOperationID) {
        return;
      }
      const data: IOperationDeleteData = {
        target: targetOperationID,
        positions: positions,
        keep_constituents: keepConstituents,
        delete_schema: deleteSchema
      };
      model.deleteOperation(data, () => toast.success(information.operationDestroyed));
    },
    [model, targetOperationID, positions]
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

  const promptEditInput = useCallback((target: OperationID, positions: IOperationPosition[]) => {
    setPositions(positions);
    setTargetOperationID(target);
    setShowEditInput(true);
  }, []);

  const setTargetInput = useCallback(
    (newInput: LibraryItemID | undefined) => {
      if (!targetOperationID) {
        return;
      }
      const data: IOperationSetInputData = {
        target: targetOperationID,
        positions: positions,
        input: newInput ?? null
      };
      model.setInput(data, () => toast.success(information.changesSaved));
    },
    [model, targetOperationID, positions]
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

  const promptRelocateConstituents = useCallback((target: OperationID | undefined, positions: IOperationPosition[]) => {
    setPositions(positions);
    setTargetOperationID(target);
    setShowRelocateConstituents(true);
  }, []);

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
      {model.schema ? (
        <>
          {showEditEditors ? (
            <DlgEditEditors
              hideWindow={() => setShowEditEditors(false)}
              editors={model.schema.editors}
              setEditors={setEditors}
            />
          ) : null}
          {showEditLocation ? (
            <DlgChangeLocation
              hideWindow={() => setShowEditLocation(false)}
              initial={model.schema.location}
              onChangeLocation={handleSetLocation}
            />
          ) : null}
          {showCreateOperation ? (
            <DlgCreateOperation
              hideWindow={() => setShowCreateOperation(false)}
              oss={model.schema}
              onCreate={handleCreateOperation}
              initialInputs={initialInputs}
            />
          ) : null}
          {showEditInput ? (
            <DlgChangeInputSchema
              hideWindow={() => setShowEditInput(false)}
              oss={model.schema}
              target={targetOperation!}
              onSubmit={setTargetInput}
            />
          ) : null}
          {showEditOperation ? (
            <DlgEditOperation
              hideWindow={() => setShowEditOperation(false)}
              oss={model.schema}
              target={targetOperation!}
              onSubmit={handleEditOperation}
            />
          ) : null}
          {showDeleteOperation ? (
            <DlgDeleteOperation
              hideWindow={() => setShowDeleteOperation(false)}
              target={targetOperation!}
              onSubmit={deleteOperation}
            />
          ) : null}
          {showRelocateConstituents ? (
            <DlgRelocateConstituents
              hideWindow={() => setShowRelocateConstituents(false)}
              initialTarget={targetOperation}
              oss={model.schema}
              onSubmit={handleRelocateConstituents}
            />
          ) : null}
        </>
      ) : null}

      {children}
    </OssEditContext>
  );
};
