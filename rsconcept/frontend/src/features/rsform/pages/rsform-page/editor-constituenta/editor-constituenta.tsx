'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';

import { useRoleStore, UserRole } from '@/features/users';

import { useWindowSize } from '@/hooks/use-window-size';
import { useFitHeight, useMainHeight } from '@/stores/app-layout';
import { useModificationStore } from '@/stores/modification';
import { usePreferencesStore } from '@/stores/preferences';
import { globalIDs } from '@/utils/constants';

import { useMutatingRSForm } from '../../../backend/use-mutating-rsform';
import { ViewConstituents } from '../../../components/view-constituents';
import { useRSEdit } from '../rsedit-context';

import { FormConstituenta } from './form-constituenta';
import { ToolbarConstituenta } from './toolbar-constituenta';

// Threshold window width to switch layout.
const SIDELIST_LAYOUT_THRESHOLD = 1000; // px

// Window width cutoff for dense search bar
const COLUMN_DENSE_SEARCH_THRESHOLD = 1100;

export function EditorConstituenta() {
  const { schema, activeCst, isContentEditable, selected, setSelected, moveUp, moveDown, cloneCst, navigateCst } =
    useRSEdit();
  const windowSize = useWindowSize();
  const mainHeight = useMainHeight();

  const showList = usePreferencesStore(state => state.showCstSideList);
  const { isModified } = useModificationStore();

  const [toggleReset, setToggleReset] = useState(false);

  const isProcessing = useMutatingRSForm();
  const disabled = !activeCst || !isContentEditable || isProcessing;
  const isNarrow = !!windowSize.width && windowSize.width <= SIDELIST_LAYOUT_THRESHOLD;

  const role = useRoleStore(state => state.role);
  const listHeight = useFitHeight(!isNarrow ? '8.2rem' : role !== UserRole.READER ? '42rem' : '35rem', '10rem');

  useEffect(() => {
    if (activeCst && selected.length !== 1) {
      setSelected([activeCst.id]);
    }
  }, [activeCst, selected, setSelected]);

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
        isNarrow={isNarrow}
      />

      <div className='mx-0 md:mx-auto pt-8 md:w-195 shrink-0 xs:pt-0'>
        {activeCst ? (
          <FormConstituenta
            key={activeCst.id}
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
        className={clsx(
          'cc-animate-sidebar',
          isNarrow ? 'mt-3 mx-6 rounded-md overflow-hidden' : 'mt-9 rounded-l-md rounded-r-none overflow-visible',
          showList ? 'max-w-full' : 'opacity-0 max-w-0'
        )}
        schema={schema}
        activeCst={activeCst}
        onActivate={cst => navigateCst(cst.id)}
        dense={!!windowSize.width && windowSize.width < COLUMN_DENSE_SEARCH_THRESHOLD}
        maxListHeight={listHeight}
        autoScroll={!isNarrow}
      />
    </div>
  );
}
