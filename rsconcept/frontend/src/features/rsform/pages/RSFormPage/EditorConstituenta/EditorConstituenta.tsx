'use client';

import { useState } from 'react';
import clsx from 'clsx';

import useWindowSize from '@/hooks/useWindowSize';
import { useMainHeight } from '@/stores/appLayout';
import { useDialogsStore } from '@/stores/dialogs';
import { useModificationStore } from '@/stores/modification';
import { usePreferencesStore } from '@/stores/preferences';
import { globals } from '@/utils/constants';
import { promptUnsaved } from '@/utils/utils';

import { useMutatingRSForm } from '../../../backend/useMutatingRSForm';
import { useRSEdit } from '../RSEditContext';
import { ViewConstituents } from '../ViewConstituents';

import EditorControls from './EditorControls';
import { FormConstituenta } from './FormConstituenta';
import ToolbarConstituenta from './ToolbarConstituenta';

// Threshold window width to switch layout.
const SIDELIST_LAYOUT_THRESHOLD = 1000; // px

function EditorConstituenta() {
  const { schema, activeCst, isContentEditable, moveUp, moveDown, cloneCst, navigateCst } = useRSEdit();
  const windowSize = useWindowSize();
  const mainHeight = useMainHeight();

  const showList = usePreferencesStore(state => state.showCstSideList);
  const showEditTerm = useDialogsStore(state => state.showEditWordForms);
  const { isModified } = useModificationStore();

  const [toggleReset, setToggleReset] = useState(false);

  const isProcessing = useMutatingRSForm();
  const disabled = !activeCst || !isContentEditable || isProcessing;
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
    if (!activeCst) {
      return;
    }
    if (isModified && !promptUnsaved()) {
      return;
    }
    showEditTerm({ itemID: schema.id, target: activeCst });
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
      case 'ArrowUp': moveUp(); return true;
      case 'ArrowDown': moveDown(); return true;
      case 'KeyV': cloneCst(); return true;
    }
    return false;
  }

  return (
    <>
      <ToolbarConstituenta
        activeCst={activeCst}
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
        <div className='mx-0 md:mx-auto pt-[2rem] md:w-[48.8rem] shrink-0 xs:pt-0'>
          {activeCst ? (
            <EditorControls
              disabled={disabled} //
              constituenta={activeCst}
              onEditTerm={handleEditTermForms}
            />
          ) : null}
          {activeCst ? (
            <FormConstituenta
              id={globals.constituenta_editor} //
              disabled={disabled}
              toggleReset={toggleReset}
              activeCst={activeCst}
              schema={schema}
              onOpenEdit={navigateCst}
            />
          ) : null}
        </div>
        <ViewConstituents isMounted={showList} isBottom={isNarrow} />
      </div>
    </>
  );
}

export default EditorConstituenta;
