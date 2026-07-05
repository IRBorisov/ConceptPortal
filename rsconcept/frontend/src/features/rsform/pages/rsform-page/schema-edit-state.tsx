'use client';

import { useEffect, useEffectEvent } from 'react';

import { useTx } from '@/i18n';

import { urls, useConceptNavigation } from '@/app';
import { useAIStore } from '@/features/ai/stores/ai-context';
import { useAuth } from '@/features/auth/backend/use-auth';
import { useDeleteItem } from '@/features/library/backend/use-delete-item';
import { useLibrarySearchStore } from '@/features/library/stores/library-search';
import { useFindPredecessor } from '@/features/oss/backend/use-find-predecessor';
import { UserRole } from '@/features/users';
import { useRoleStore } from '@/features/users/stores/role';
import { useAdjustRole } from '@/features/users/stores/use-adjust-role';

import { setOpenSchemaItemId } from '@/backend/cross-tab-reset-notify';
import { usePreferencesStore } from '@/stores/preferences';

import { useMutatingRSForm } from '../../backend/use-mutating-rsform';
import { useRSForm } from '../../backend/use-rsform';
import { RsformDialogHost } from '../../dialogs/rsform-dialog-host';

import { SchemaEditContext } from './schema-edit-context';
import { useSchemaCstActions } from './use-schema-cst-actions';

interface SchemaEditStateProps {
  itemID: number;
  activeVersion?: number;
  /** When set (e.g. on the RSModel page), includes RSModel mutations; otherwise only RSForm mutations. */
  isProcessing?: boolean;
}

export const SchemaEditState = ({
  itemID,
  activeVersion,
  isProcessing: isProcessingProp,
  children
}: React.PropsWithChildren<SchemaEditStateProps>) => {
  const tx = useTx();
  const router = useConceptNavigation();
  const adminMode = usePreferencesStore(state => state.adminMode);
  const role = useRoleStore(state => state.role);
  const setSearchLocation = useLibrarySearchStore(state => state.setLocation);
  const searchLocation = useLibrarySearchStore(state => state.location);

  const { user } = useAuth();
  const { schema } = useRSForm({ itemID: itemID, version: activeVersion });
  const isMutatingForm = useMutatingRSForm();
  const isProcessing = isProcessingProp ?? isMutatingForm;

  const isOwned = !!user.id && user.id === schema.owner;
  const isArchive = !!activeVersion;
  const isMutable = role > UserRole.READER && !schema.read_only;
  const isContentEditable = isMutable && !isArchive;
  const isEditor = !!user.id && schema.editors.includes(user.id);

  const cstActions = useSchemaCstActions({ schema, itemID });

  const { deleteItem } = useDeleteItem();
  const { findPredecessor } = useFindPredecessor();

  const setCurrentSchema = useAIStore(state => state.setSchema);
  const onSetSchema = useEffectEvent(setCurrentSchema);
  const setCurrentConstituenta = useAIStore(state => state.setConstituenta);
  const onSetConstituenta = useEffectEvent(setCurrentConstituenta);

  useAdjustRole({
    isOwner: isOwned,
    isEditor: isEditor,
    isStaff: user.is_staff,
    adminMode: adminMode
  });

  useEffect(
    function trackOpenSchemaItem() {
      setOpenSchemaItemId(itemID);
      return () => setOpenSchemaItemId(undefined);
    },
    [itemID]
  );

  useEffect(
    function syncGlobalSchema() {
      onSetSchema(schema);
      return () => onSetSchema(null);
    },
    [schema]
  );

  useEffect(
    function syncGlobalConstituenta() {
      onSetConstituenta(cstActions.activeCst);
      return () => onSetConstituenta(null);
    },
    [cstActions.activeCst]
  );

  function deleteSchema() {
    if (!window.confirm(tx('tx.general.delete.confirm') + ' ' + schema.title)) {
      return;
    }
    const ossID = schema.oss.length > 0 ? schema.oss[0].id : null;
    void deleteItem({
      target: schema.id,
      beforeInvalidate: () => {
        if (ossID) {
          return router.pushAsync({ path: urls.oss(ossID), force: true });
        } else {
          if (searchLocation === schema.location) {
            setSearchLocation('');
          }
          return router.pushAsync({ path: urls.library, force: true });
        }
      }
    });
  }

  function gotoPredecessor(target: number, newTab?: boolean) {
    void findPredecessor(target).then(reference => router.gotoCstEdit(reference.schema, reference.id, newTab));
  }

  return (
    <>
      <RsformDialogHost />
      <SchemaEditContext
        value={{
          schema,
          focusCst: cstActions.focusCst,
          selectedCst: cstActions.selectedCst,
          selectedEdges: cstActions.selectedEdges,
          activeCst: cstActions.activeCst,
          pendingActiveID: cstActions.pendingActiveID,
          activeVersion,

          isOwned,
          isArchive,
          isMutable,
          isContentEditable,
          canDeleteSelected: cstActions.canDeleteSelected,
          isProcessing,

          deleteSchema,

          patchConstituenta: cstActions.patchConstituenta,
          createCstFromData: cstActions.createCstFromData,
          openTermEditor: cstActions.openTermEditor,
          promptRename: cstActions.promptRename,
          addAttribution: cstActions.addAttribution,
          removeAttribution: cstActions.removeAttribution,
          clearAttributions: cstActions.clearAttributions,

          setFocus: cstActions.setFocus,
          clearPendingActiveID: cstActions.clearPendingActiveID,
          setSelectedCst: cstActions.setSelectedCst,
          setSelectedEdges: cstActions.setSelectedEdges,
          selectCst: cstActions.selectCst,
          deselectCst: cstActions.deselectCst,
          toggleSelectCst: cstActions.toggleSelectCst,
          deselectAll: cstActions.deselectAll,

          moveUp: cstActions.moveUp,
          moveDown: cstActions.moveDown,
          moveAfter: cstActions.moveAfter,
          toggleCrucial: cstActions.toggleCrucial,
          toggleValueClass: cstActions.toggleValueClass,
          createCst: cstActions.createCst,
          promptCreateCst: cstActions.promptCreateCst,
          cloneCst: cstActions.cloneCst,
          promptDeleteSelected: cstActions.promptDeleteSelected,

          promptTemplate: cstActions.promptTemplate,
          gotoPredecessor
        }}
      >
        {children}
      </SchemaEditContext>
    </>
  );
};
