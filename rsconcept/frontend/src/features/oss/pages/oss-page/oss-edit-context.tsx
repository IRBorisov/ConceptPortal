'use client';

import { createContext, use, useEffect, useState } from 'react';

import { urls, useConceptNavigation } from '@/app';
import { useAuthSuspense } from '@/features/auth';
import { useLibrarySearchStore } from '@/features/library';
import { useDeleteItem } from '@/features/library/backend/use-delete-item';
import { RSTabID } from '@/features/rsform/pages/rsform-page/rsedit-context';
import { useRoleStore, UserRole } from '@/features/users';

import { usePreferencesStore } from '@/stores/preferences';
import { promptText } from '@/utils/labels';

import { OperationType } from '../../backend/types';
import { useOssSuspense } from '../../backend/use-oss';
import { type IOperation, type IOperationSchema } from '../../models/oss';

export const OssTabID = {
  CARD: 0,
  GRAPH: 1
} as const;
export type OssTabID = (typeof OssTabID)[keyof typeof OssTabID];

export interface IOssEditContext {
  schema: IOperationSchema;
  selected: number[];

  isOwned: boolean;
  isMutable: boolean;

  navigateTab: (tab: OssTabID) => void;
  navigateOperationSchema: (target: number) => void;

  canDeleteOperation: (target: IOperation) => boolean;
  deleteSchema: () => void;
  setSelected: React.Dispatch<React.SetStateAction<number[]>>;
}

const OssEditContext = createContext<IOssEditContext | null>(null);
export const useOssEdit = () => {
  const context = use(OssEditContext);
  if (context === null) {
    throw new Error('useOssEdit has to be used within <OssEditState>');
  }
  return context;
};

interface OssEditStateProps {
  itemID: number;
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

  const [selected, setSelected] = useState<number[]>([]);

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
    router.push({ path: url });
  }

  function navigateOperationSchema(target: number) {
    const node = schema.operationByID.get(target);
    if (!node?.result) {
      return;
    }
    router.push({ path: urls.schema_props({ id: node.result, tab: RSTabID.CST_LIST }) });
  }

  function deleteSchema() {
    if (!window.confirm(promptText.deleteOSS)) {
      return;
    }
    void deleteItem({
      target: schema.id,
      beforeInvalidate: () => {
        if (searchLocation === schema.location) {
          setSearchLocation('');
        }
        return router.pushAsync({ path: urls.library, force: true });
      }
    });
  }

  function canDeleteOperation(target: IOperation) {
    if (target.operation_type === OperationType.INPUT) {
      return true;
    }
    return schema.graph.expandOutputs([target.id]).length === 0;
  }

  return (
    <OssEditContext
      value={{
        schema,
        selected,

        isOwned,
        isMutable,

        navigateTab,
        navigateOperationSchema,

        canDeleteOperation,
        deleteSchema,
        setSelected
      }}
    >
      {children}
    </OssEditContext>
  );
};
