'use client';

import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

import { isProblematic } from '@/domain/library/rsform-api';
import { isInferrable } from '@/domain/library/rsmodel-api';

import { useConceptNavigation } from '@/app';
import { ViewConstituents } from '@/features/rsform/components/view-constituents';
import { useSchemaEdit } from '@/features/rsform/pages/rsform-page/schema-edit-context';
import { useRoleStore, UserRole } from '@/features/users';

import { useWindowSize } from '@/hooks/use-window-size';
import { useFitHeight, useMainHeight } from '@/stores/app-layout';
import { globalIDs } from '@/utils/constants';

import { useModelEdit } from '../model-edit-context';

import { FormValue } from './form-value';
import { ToolbarValueTab } from './toolbar-value-tab';

// Threshold window width to switch layout.
const SIDELIST_LAYOUT_THRESHOLD = 1000; // px

export function TabValue() {
  const router = useConceptNavigation();
  const { schema, activeCst, selectedCst, setSelectedCst, clearPendingActiveID } = useSchemaEdit();
  const { engine } = useModelEdit();
  const windowSize = useWindowSize();
  const mainHeight = useMainHeight();
  const [toggleReset, setToggleReset] = useState(false);

  const isNarrow = !!windowSize.width && windowSize.width <= SIDELIST_LAYOUT_THRESHOLD;

  const role = useRoleStore(state => state.role);
  const listHeight = useFitHeight(!isNarrow ? '8.2rem' : role !== UserRole.READER ? '42rem' : '35rem', '10rem');

  const prevActiveCstId = useRef<number | null>(null);
  useEffect(
    function adjustSelectionOnActiveChange() {
      if (activeCst && prevActiveCstId.current !== activeCst.id) {
        prevActiveCstId.current = activeCst.id;
        const primarySelected = selectedCst.length === 0 ? undefined : selectedCst[selectedCst.length - 1];
        if (selectedCst.length !== 1 || primarySelected !== activeCst.id) {
          setSelectedCst([activeCst.id]);
        }
      }
    },
    [activeCst, selectedCst, setSelectedCst]
  );

  function handleClearValue() {
    if (!activeCst) {
      return;
    }
    void engine.resetValue(activeCst.id);
  }

  function initiateSubmit() {
    const element = document.getElementById(globalIDs.value_editor) as HTMLFormElement;
    if (element) {
      element.requestSubmit();
    }
  }

  function handleInput(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.altKey && event.code === 'KeyQ') {
      event.preventDefault();
      event.stopPropagation();
      engine.recalculateAll();
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.code === 'KeyQ') {
      event.preventDefault();
      event.stopPropagation();
      if (activeCst && isInferrable(activeCst.cst_type)) {
        engine.calculateCst(activeCst.id);
      }
      return;
    }
  }

  function handleOpenEdit(cstID: number) {
    clearPendingActiveID();
    router.changeActive(cstID);
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
      <ToolbarValueTab
        className={clsx(
          'cc-tab-tools',
          'right-1/2 translate-x-0 xs:right-4 xs:-translate-x-1/2 md:right-1/2 md:translate-x-0',
          'cc-animate-position'
        )}
        onClearValue={handleClearValue}
        onSubmit={initiateSubmit}
        onReset={() => setToggleReset(prev => !prev)}
      />

      <div className='mx-0 min-w-120 md:mx-auto pt-8 md:w-195 shrink-0 xs:pt-0 min-h-6'>
        {activeCst ? (
          <FormValue
            key={`data-${activeCst.id}`}
            id={globalIDs.value_editor}
            activeCst={activeCst}
            onOpenEdit={handleOpenEdit}
            toggleReset={toggleReset}
          />
        ) : null}
      </div>
      <ViewConstituents
        className={clsx(
          'cc-animate-sidebar min-h-55',
          isNarrow ? 'mt-3 mx-6 rounded-md overflow-hidden' : 'mt-9 rounded-l-md rounded-r-none overflow-visible'
        )}
        schema={schema}
        engine={engine}
        activeCst={activeCst}
        isProblematic={isProblematic}
        onActivate={cst => {
          clearPendingActiveID();
          router.changeActive(cst.id);
        }}
        maxListHeight={listHeight}
        autoScroll={!isNarrow}
      />
    </div>
  );
}
