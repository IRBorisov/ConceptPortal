'use client';

import clsx from 'clsx';
import { useState } from 'react';

import { useCstUpdate } from '@/backend/rsform/useCstUpdate';
import { useMutatingRSForm } from '@/backend/rsform/useMutatingRSForm';
import useWindowSize from '@/hooks/useWindowSize';
import { useMainHeight } from '@/stores/appLayout';
import { useDialogsStore } from '@/stores/dialogs';
import { useModificationStore } from '@/stores/modification';
import { usePreferencesStore } from '@/stores/preferences';
import { globals } from '@/utils/constants';
import { promptUnsaved } from '@/utils/utils';

import { useRSEdit } from '../RSEditContext';
import ViewConstituents from '../ViewConstituents';
import FormConstituenta from './FormConstituenta';
import ToolbarConstituenta from './ToolbarConstituenta';

// Threshold window width to switch layout.
const SIDELIST_LAYOUT_THRESHOLD = 1000; // px

function EditorConstituenta() {
  const controller = useRSEdit();
  const windowSize = useWindowSize();
  const mainHeight = useMainHeight();

  const showList = usePreferencesStore(state => state.showCstSideList);
  const showEditTerm = useDialogsStore(state => state.showEditWordForms);
  const { cstUpdate } = useCstUpdate();
  const { isModified } = useModificationStore();

  const [toggleReset, setToggleReset] = useState(false);

  const isProcessing = useMutatingRSForm();
  const disabled = !controller.activeCst || !controller.isContentEditable || isProcessing;
  const isNarrow = !!windowSize.width && windowSize.width <= SIDELIST_LAYOUT_THRESHOLD;

  function handleInput(event: React.KeyboardEvent<HTMLDivElement>) {
    if (disabled) {
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.code === 'KeyS') {
      if (isModified) {
        initiateSubmit();
      }
      event.preventDefault();
      return;
    }
    if (!event.altKey || event.shiftKey) {
      return;
    }
    if (processAltKey(event.code)) {
      event.preventDefault();
      return;
    }
  }

  function handleEditTermForms() {
    if (!controller.activeCst) {
      return;
    }
    if (isModified && !promptUnsaved()) {
      return;
    }
    showEditTerm({
      target: controller.activeCst,
      onSave: forms =>
        cstUpdate({
          itemID: controller.schema.id,
          data: {
            target: controller.activeCst!.id,
            item_data: { term_forms: forms }
          }
        })
    });
  }

  function initiateSubmit() {
    const element = document.getElementById(globals.constituenta_editor) as HTMLFormElement;
    if (element) {
      element.requestSubmit();
    }
  }

  function processAltKey(code: string): boolean {
    // prettier-ignore
    switch (code) {
      case 'ArrowUp': controller.moveUp(); return true;
      case 'ArrowDown': controller.moveDown(); return true;
      case 'KeyV': controller.cloneCst(); return true;
    }
    return false;
  }

  return (
    <>
      <ToolbarConstituenta
        activeCst={controller.activeCst}
        disabled={disabled}
        onSubmit={initiateSubmit}
        onReset={() => setToggleReset(prev => !prev)}
      />
      <div
        tabIndex={-1}
        className={clsx(
          'cc-fade-in',
          'min-h-[20rem] max-w-[calc(min(100vw,95rem))] mx-auto',
          'flex pt-[1.9rem]',
          'overflow-y-auto overflow-x-clip',
          { 'flex-col md:items-center': isNarrow }
        )}
        style={{ maxHeight: mainHeight }}
        onKeyDown={handleInput}
      >
        <FormConstituenta
          id={globals.constituenta_editor}
          disabled={disabled}
          toggleReset={toggleReset}
          onEditTerm={handleEditTermForms}
        />
        <ViewConstituents
          isMounted={showList}
          expression={controller.activeCst?.definition_formal ?? ''}
          isBottom={isNarrow}
        />
      </div>
    </>
  );
}

export default EditorConstituenta;
