'use client';

import { AnimatePresence } from 'framer-motion';
import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import { useAccessMode } from '@/context/AccessModeContext';
import { useAuth } from '@/context/AuthContext';
import { useConceptOptions } from '@/context/ConceptOptionsContext';
import { useOSS } from '@/context/OssContext';
import DlgChangeLocation from '@/dialogs/DlgChangeLocation';
import DlgCreateOperation from '@/dialogs/DlgCreateOperation';
import DlgEditEditors from '@/dialogs/DlgEditEditors';
import { AccessPolicy } from '@/models/library';
import { Position2D } from '@/models/miscellaneous';
import { IOperationCreateData, IOperationPosition, IOperationSchema } from '@/models/oss';
import { UserID, UserLevel } from '@/models/user';
import { information } from '@/utils/labels';

export interface IOssEditContext {
  schema?: IOperationSchema;

  isMutable: boolean;
  isProcessing: boolean;

  setOwner: (newOwner: UserID) => void;
  setAccessPolicy: (newPolicy: AccessPolicy) => void;
  promptEditors: () => void;
  promptLocation: () => void;
  toggleSubscribe: () => void;

  share: () => void;

  promptCreateOperation: (x: number, y: number, positions: IOperationPosition[]) => void;
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
  children: React.ReactNode;
}

export const OssEditState = ({ children }: OssEditStateProps) => {
  // const router = useConceptNavigation();
  const { user } = useAuth();
  const { adminMode } = useConceptOptions();
  const { accessLevel, setAccessLevel } = useAccessMode();
  const model = useOSS();

  const isMutable = useMemo(
    () => accessLevel > UserLevel.READER && !model.schema?.read_only,
    [accessLevel, model.schema?.read_only]
  );

  const [showEditEditors, setShowEditEditors] = useState(false);
  const [showEditLocation, setShowEditLocation] = useState(false);

  const [showCreateOperation, setShowCreateOperation] = useState(false);
  const [insertPosition, setInsertPosition] = useState<Position2D>({ x: 0, y: 0 });
  const [positions, setPositions] = useState<IOperationPosition[]>([]);

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

  const promptCreateOperation = useCallback((x: number, y: number, positions: IOperationPosition[]) => {
    setInsertPosition({ x: x, y: y });
    setPositions(positions);
    setShowCreateOperation(true);
  }, []);

  const handleCreateOperation = useCallback(
    (data: IOperationCreateData) => {
      model.createOperation(data, operation => toast.success(information.newOperation(operation.alias)));
    },
    [model]
  );

  return (
    <OssEditContext.Provider
      value={{
        schema: model.schema,
        isMutable,
        isProcessing: model.processing,

        toggleSubscribe,
        setOwner,
        setAccessPolicy,
        promptEditors,
        promptLocation,

        share,

        promptCreateOperation
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
              positions={positions}
              insertPosition={insertPosition}
              onCreate={handleCreateOperation}
            />
          ) : null}
        </AnimatePresence>
      ) : null}

      {children}
    </OssEditContext.Provider>
  );
};
