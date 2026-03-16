'use client';

import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

import { useConceptNavigation } from '@/app';
import { ViewConstituents } from '@/features/rsform/components/view-constituents';
import { useRSFormEdit } from '@/features/rsform/pages/rsform-page/rsedit-context';
import { useRoleStore, UserRole } from '@/features/users';

import { useWindowSize } from '@/hooks/use-window-size';
import { useFitHeight, useMainHeight } from '@/stores/app-layout';
import { usePreferencesStore } from '@/stores/preferences';
import { globalIDs } from '@/utils/constants';

import { useRSModelEdit } from '../rsmodel-context';

import { FormValue } from './form-value';
import { ToolbarValueEditor } from './toolbar-value-editor';

// Threshold window width to switch layout.
const SIDELIST_LAYOUT_THRESHOLD = 1000; // px

// Window width cutoff for dense search bar
const COLUMN_DENSE_SEARCH_THRESHOLD = 1100;

export function TabValue() {
  const router = useConceptNavigation();
  const {
    schema,
    activeCst,
    selectedCst,
    setSelectedCst
  } = useRSFormEdit();
  const { engine } = useRSModelEdit();
  const windowSize = useWindowSize();
  const mainHeight = useMainHeight();

  const showList = usePreferencesStore(state => state.showValueSideList);

  const [toggleReset, setToggleReset] = useState(false);

  const isNarrow = !!windowSize.width && windowSize.width <= SIDELIST_LAYOUT_THRESHOLD;

  const role = useRoleStore(state => state.role);
  const listHeight = useFitHeight(!isNarrow ? '8.2rem' : role !== UserRole.READER ? '42rem' : '35rem', '10rem');

  const prevActiveCstId = useRef<number | null>(null);
  useEffect(() => {
    if (activeCst && prevActiveCstId.current !== activeCst.id) {
      prevActiveCstId.current = activeCst.id;
      if (selectedCst.length !== 1 || selectedCst[0] !== activeCst.id) {
        setSelectedCst([activeCst.id]);
      }
    }
  }, [activeCst, selectedCst, setSelectedCst]);

  function handleClearValue() {
    if (!activeCst) {
      return;
    }
    void engine.resetValue(activeCst.id);
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
    >
      <ToolbarValueEditor
        className={clsx(
          'cc-tab-tools',
          'right-1/2 translate-x-0 xs:right-4 xs:-translate-x-1/2 md:right-1/2 md:translate-x-0',
          'cc-animate-position'
        )}
        isNarrow={isNarrow}
        onReset={() => setToggleReset(prev => !prev)}
        onClearValue={handleClearValue}
      />

      <div className='mx-0 min-w-120 md:mx-auto pt-8 md:w-195 shrink-0 xs:pt-0 min-h-6'>
        {activeCst ? (
          <FormValue
            key={`data-${activeCst.id}`}
            id={globalIDs.value_editor}
            activeCst={activeCst}
            toggleReset={toggleReset}
          />
        ) : null}
      </div>
      <ViewConstituents
        className={clsx(
          'cc-animate-sidebar min-h-55',
          isNarrow ? 'mt-3 mx-6 rounded-md overflow-hidden' : 'mt-9 rounded-l-md rounded-r-none overflow-visible',
          showList ? 'max-w-full' : 'opacity-0 max-w-0'
        )}
        schema={schema}
        engine={engine}
        activeCst={activeCst}
        onActivate={cst => router.changeActive(cst.id)}
        dense={!!windowSize.width && windowSize.width < COLUMN_DENSE_SEARCH_THRESHOLD}
        maxListHeight={listHeight}
        autoScroll={!isNarrow}
      />
    </div>
  );
}
