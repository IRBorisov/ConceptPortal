'use client';

import { useState } from 'react';
import clsx from 'clsx';

import { useWindowSize } from '@/hooks/use-window-size';
import { useMainHeight } from '@/stores/app-layout';
import { useModificationStore } from '@/stores/modification';
import { usePreferencesStore } from '@/stores/preferences';
import { globalIDs } from '@/utils/constants';

import { useMutatingRSForm } from '../../../backend/use-mutating-rsform';
import { useRSEdit } from '../rsedit-context';
import { ViewConstituents } from '../view-constituents';

import { FormConstituenta } from './form-constituenta';
import { ToolbarConstituenta } from './toolbar-constituenta';

// Threshold window width to switch layout.
const SIDELIST_LAYOUT_THRESHOLD = 1000; // px

export function EditorConstituenta() {
  const { schema, activeCst, isContentEditable, moveUp, moveDown, cloneCst, navigateCst } = useRSEdit();
  const windowSize = useWindowSize();
  const mainHeight = useMainHeight();

  const showList = usePreferencesStore(state => state.showCstSideList);
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

  function initiateSubmit() {
    const element = document.getElementById(globalIDs.constituenta_editor) as HTMLFormElement;
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
    <div
      tabIndex={-1}
      className={clsx(
        'relative ',
        'min-h-80 max-w-[calc(min(100vw,80rem))] mx-auto',
        'flex pt-8',
        'overflow-y-auto overflow-x-clip',
        isNarrow && 'flex-col md:items-center'
      )}
      style={{ maxHeight: mainHeight }}
      onKeyDown={handleInput}
    >
      <ToolbarConstituenta
        className='cc-tab-tools right-1/2 translate-x-0 xs:right-4 xs:-translate-x-1/2 md:right-1/2 md:translate-x-0 cc-animate-position'
        activeCst={activeCst}
        onSubmit={initiateSubmit}
        onReset={() => setToggleReset(prev => !prev)}
        disabled={disabled}
      />

      <div className='mx-0 md:mx-auto pt-8 md:w-195 shrink-0 xs:pt-0'>
        {activeCst ? (
          <FormConstituenta
            id={globalIDs.constituenta_editor}
            toggleReset={toggleReset}
            activeCst={activeCst}
            schema={schema}
            onOpenEdit={navigateCst}
            disabled={disabled}
          />
        ) : null}
      </div>
      <ViewConstituents
        className={isNarrow ? 'mt-3 mx-6 overflow-hidden' : 'mt-9 h-fit overflow-visible'}
        isMounted={showList}
        isBottom={isNarrow}
      />
    </div>
  );
}
