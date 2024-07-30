'use client';

import { AnimatePresence } from 'framer-motion';
import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import { urls } from '@/app/urls';
import { useAccessMode } from '@/context/AccessModeContext';
import { useAuth } from '@/context/AuthContext';
import { useConceptOptions } from '@/context/ConceptOptionsContext';
import { useConceptNavigation } from '@/context/NavigationContext';
import { useOSS } from '@/context/OssContext';
import DlgChangeInputSchema from '@/dialogs/DlgChangeInputSchema';
import DlgChangeLocation from '@/dialogs/DlgChangeLocation';
import DlgCreateOperation from '@/dialogs/DlgCreateOperation';
import DlgEditEditors from '@/dialogs/DlgEditEditors';
import DlgEditOperation from '@/dialogs/DlgEditOperation';
import { AccessPolicy, LibraryItemID } from '@/models/library';
import { Position2D } from '@/models/miscellaneous';
import {
  IOperationCreateData,
  IOperationPosition,
  IOperationSchema,
  IOperationSetInputData,
  IOperationUpdateData,
  OperationID
} from '@/models/oss';
import { UserID, UserLevel } from '@/models/user';
import { information } from '@/utils/labels';

export interface IOssEditContext {
  schema?: IOperationSchema;
  selected: OperationID[];

  isMutable: boolean;
  isProcessing: boolean;

  showTooltip: boolean;
  setShowTooltip: React.Dispatch<React.SetStateAction<boolean>>;

  setOwner: (newOwner: UserID) => void;
  setAccessPolicy: (newPolicy: AccessPolicy) => void;
  promptEditors: () => void;
  promptLocation: () => void;
  toggleSubscribe: () => void;

  setSelected: React.Dispatch<React.SetStateAction<OperationID[]>>;

  share: () => void;

  openOperationSchema: (target: OperationID) => void;

  savePositions: (positions: IOperationPosition[], callback?: () => void) => void;
  promptCreateOperation: (x: number, y: number, positions: IOperationPosition[]) => void;
  deleteOperation: (target: OperationID, positions: IOperationPosition[]) => void;
  createInput: (target: OperationID, positions: IOperationPosition[]) => void;
  promptEditInput: (target: OperationID, positions: IOperationPosition[]) => void;
  promptEditOperation: (target: OperationID, positions: IOperationPosition[]) => void;
  executeOperation: (target: OperationID, positions: IOperationPosition[]) => void;
  executeAll: (positions: IOperationPosition[]) => void;
}

const OssEditContext = createContext<IOssEditContext | null>(null);
export const useOssEdit = () => {
  const context = useContext(OssEditContext);
  if (context === null) {
    throw new Error('useOssEdit has to be used within <OssEditState.Provider>');
  }
  return context;
};

interface OssEditStateProps {
  // isModified: boolean;
  selected: OperationID[];
  setSelected: React.Dispatch<React.SetStateAction<OperationID[]>>;
  children: React.ReactNode;
}

export const OssEditState = ({ selected, setSelected, children }: OssEditStateProps) => {
  const router = useConceptNavigation();
  const { user } = useAuth();
  const { adminMode } = useConceptOptions();
  const { accessLevel, setAccessLevel } = useAccessMode();
  const model = useOSS();

  const isMutable = useMemo(
    () => accessLevel > UserLevel.READER && !model.schema?.read_only,
    [accessLevel, model.schema?.read_only]
  );

  const [showTooltip, setShowTooltip] = useState(true);

  const [showEditEditors, setShowEditEditors] = useState(false);
  const [showEditLocation, setShowEditLocation] = useState(false);
  const [showEditInput, setShowEditInput] = useState(false);
  const [showEditOperation, setShowEditOperation] = useState(false);

  const [showCreateOperation, setShowCreateOperation] = useState(false);
  const [insertPosition, setInsertPosition] = useState<Position2D>({ x: 0, y: 0 });
  const [positions, setPositions] = useState<IOperationPosition[]>([]);
  const [targetOperationID, setTargetOperationID] = useState<OperationID | undefined>(undefined);
  const targetOperation = useMemo(
    () => (targetOperationID ? model.schema?.operationByID.get(targetOperationID) : undefined),
    [model, targetOperationID]
  );

  useLayoutEffect(
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

  const toggleSubscribe = useCallback(() => {
    if (model.isSubscribed) {
      model.unsubscribe(() => toast.success(information.unsubscribed));
    } else {
      model.subscribe(() => toast.success(information.subscribed));
    }
  }, [model]);

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
      if (!node || !node.result) {
        return;
      }
      router.push(urls.schema(node.result));
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
        if (callback) callback();
      });
    },
    [model]
  );

  const promptCreateOperation = useCallback((x: number, y: number, positions: IOperationPosition[]) => {
    setInsertPosition({ x: x, y: y });
    setPositions(positions);
    setShowCreateOperation(true);
  }, []);

  const handleCreateOperation = useCallback(
    (data: IOperationCreateData) => {
      data.positions = positions;
      data.item_data.position_x = insertPosition.x;
      data.item_data.position_y = insertPosition.y;
      model.createOperation(data, operation => toast.success(information.newOperation(operation.alias)));
    },
    [model, positions, insertPosition]
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

  const deleteOperation = useCallback(
    (target: OperationID, positions: IOperationPosition[]) => {
      model.deleteOperation({ target: target, positions: positions }, () =>
        toast.success(information.operationDestroyed)
      );
    },
    [model]
  );

  const createInput = useCallback(
    (target: OperationID, positions: IOperationPosition[]) => {
      model.createInput({ target: target, positions: positions }, new_schema => {
        toast.success(information.newLibraryItem);
        router.push(urls.schema(new_schema.id));
      });
    },
    [model, router]
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

  const executeAll = useCallback(
    (positions: IOperationPosition[]) => {
      const data = { positions: positions };
      model.executeAll(data, () => toast.success(information.allOperationExecuted));
    },
    [model]
  );

  return (
    <OssEditContext.Provider
      value={{
        schema: model.schema,
        selected,

        showTooltip,
        setShowTooltip,

        isMutable,
        isProcessing: model.processing,

        toggleSubscribe,
        setOwner,
        setAccessPolicy,
        promptEditors,
        promptLocation,

        share,
        setSelected,

        openOperationSchema,
        savePositions,
        promptCreateOperation,
        deleteOperation,
        createInput,
        promptEditInput,
        promptEditOperation,
        executeOperation,
        executeAll
      }}
    >
      {model.schema ? (
        <AnimatePresence>
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
        </AnimatePresence>
      ) : null}

      {children}
    </OssEditContext.Provider>
  );
};
