'use client';

import { useMemo, useState } from 'react';

import { type RSForm } from '@/features/rsform';
import { type MoveConstituentsDTO } from '@/features/rsform/backend/types';
import { type Constituenta } from '@/features/rsform/models/rsform';
import { RSEditContext } from '@/features/rsform/pages/rsform-page/rsedit-context';

import { notImplemented } from '@/utils/utils';

import { offlineMoveConstituents } from '../../backend/sandbox-mutations';
import { type SandboxBundle } from '../../models/bundle';

interface SandboxRSEditStateProps {
  schema: RSForm;
  setBundle: React.Dispatch<React.SetStateAction<SandboxBundle | null>>;
}

export function SandboxRSEditState({
  schema,
  setBundle,
  children
}: React.PropsWithChildren<SandboxRSEditStateProps>) {
  const [selectedCst, setSelectedCst] = useState<number[]>([]);
  const [selectedEdges, setSelectedEdges] = useState<string[]>([]);
  const [pendingActiveID, setPendingActiveID] = useState<number | null>(null);
  const [focusCst, setFocusCst] = useState<Constituenta | null>(null);
  const selectedCstInSchema = useMemo(
    () => selectedCst.filter(id => schema.cstByID.has(id)),
    [schema, selectedCst]
  );

  const activeCst = useMemo(() => {
    if (selectedCstInSchema.length === 0) {
      return null;
    }
    const activeID = selectedCstInSchema[selectedCstInSchema.length - 1];
    return schema.cstByID.get(activeID) ?? null;
  }, [schema, selectedCstInSchema]);

  const canDeleteSelected = false;

  function promptCreateCst(): Promise<number | null> {
    notImplemented();
    return Promise.resolve(null);
  }

  function createCst(): Promise<number> {
    notImplemented();
    return Promise.resolve(activeCst?.id ?? schema.items[0]?.id ?? 0);
  }

  function cloneCst(): Promise<number> {
    notImplemented();
    return Promise.resolve(activeCst?.id ?? schema.items[0]?.id ?? 0);
  }

  function moveSelected(target: number) {
    if (selectedCstInSchema.length === 0) {
      return;
    }
    setBundle(prev => {
      if (!prev) {
        return prev;
      }
      return offlineMoveConstituents(prev, {
        items: selectedCstInSchema,
        move_to: target
      } satisfies MoveConstituentsDTO);
    });
  }

  function moveUp() {
    if (selectedCstInSchema.length === 0) {
      return;
    }
    const currentIndex = schema.items.reduce((prev, cst, index) => {
      if (!selectedCstInSchema.includes(cst.id)) {
        return prev;
      } else if (prev === -1) {
        return index;
      }
      return Math.min(prev, index);
    }, -1);
    const target = Math.max(0, currentIndex - 1);
    moveSelected(target);
  }

  function stubSchemaMutation(): Promise<void> {
    notImplemented();
    return Promise.resolve();
  }

  function moveDown() {
    if (selectedCstInSchema.length === 0) {
      return;
    }
    let count = 0;
    const currentIndex = schema.items.reduce((prev, cst, index) => {
      if (!selectedCstInSchema.includes(cst.id)) {
        return prev;
      } else {
        count += 1;
        if (prev === -1) {
          return index;
        }
        return Math.max(prev, index);
      }
    }, -1);
    const target = Math.min(schema.items.length - 1, currentIndex - count + 2);
    moveSelected(target);
  }

  return (
    <RSEditContext
      value={{
        schema,
        focusCst,
        selectedCst: selectedCstInSchema,
        selectedEdges,
        activeCst,
        pendingActiveID,

        isOwned: true,
        isArchive: false,
        isMutable: true,
        isContentEditable: true,
        canDeleteSelected,
        isProcessing: false,

        deleteSchema: notImplemented,

        patchConstituenta: stubSchemaMutation,
        openTermEditor: notImplemented,
        promptRename: notImplemented,
        addAttribution: notImplemented,
        removeAttribution: notImplemented,
        clearAttributions: notImplemented,
        gotoPredecessor: notImplemented,

        setFocus: setFocusCst,
        clearPendingActiveID: function clearPendingActiveID() {
          setPendingActiveID(null);
        },
        setSelectedCst,
        setSelectedEdges,
        selectCst: function selectCst(target: number) {
          setSelectedCst(prev => [...prev, target]);
        },
        deselectCst: function deselectCst(target: number) {
          setSelectedCst(prev => prev.filter(id => id !== target));
        },
        toggleSelectCst: function toggleSelectCst(target: number) {
          setSelectedCst(prev => (prev.includes(target) ? prev.filter(id => id !== target) : [...prev, target]));
        },
        deselectAll: function deselectAll() {
          setSelectedCst([]);
          setSelectedEdges([]);
        },

        moveUp,
        moveDown,
        toggleCrucial: notImplemented,
        createCst,
        promptCreateCst,
        cloneCst,
        promptDeleteSelected: notImplemented,
        promptTemplate: notImplemented
      }}
    >
      {children}
    </RSEditContext>
  );
}
