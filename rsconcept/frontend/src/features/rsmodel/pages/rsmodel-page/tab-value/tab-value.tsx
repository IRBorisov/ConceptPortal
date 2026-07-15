'use client';

import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

import { useTx } from '@/i18n';
import { type Constituenta } from '@rsconcept/domain/library';
import { isSchemaIssue } from '@rsconcept/domain/library/rsform-api';
import { isInferrable, isModelIssue } from '@rsconcept/domain/library/rsmodel-api';

import { useConceptNavigation } from '@/app';
import { ViewConstituents } from '@/features/rsform/components/view-constituents';
import { ConstituentsNarrowPicker } from '@/features/rsform/components/view-constituents/constituents-narrow-picker';
import { useSchemaEdit } from '@/features/rsform/pages/rsform-page/schema-edit-context';
import { hasActiveCstFilter, useCstSearchStore } from '@/features/rsform/stores/cst-search';

import { MiniButton } from '@/components/control';
import { IconMoveDown, IconMoveUp } from '@/components/icons';
import { useRowsDropHandler } from '@/hooks/use-rows-drop-handler';
import { useFitHeight, useMainHeight } from '@/stores/app-layout';
import { useModificationStore } from '@/stores/modification';
import { globalIDs } from '@/utils/constants';
import { prepareTooltip } from '@/utils/format';

import { useModelEdit } from '../model-edit-context';

import { FormValue } from './form-value';
import { ToolbarValueTab } from './toolbar-value-tab';

export function TabValue() {
  const tx = useTx();
  const router = useConceptNavigation();
  const {
    schema,
    activeCst,
    selectedCst,
    setSelectedCst,
    clearPendingActiveID,
    isContentEditable,
    isProcessing,
    moveUp,
    moveDown,
    moveAfter,
    cloneCst
  } = useSchemaEdit();
  const { engine } = useModelEdit();
  const isModified = useModificationStore(state => state.isModified);
  const query = useCstSearchStore(state => state.query);
  const filter = useCstSearchStore(state => state.filter);
  const hasActiveFilter = hasActiveCstFilter(query, filter);
  const mainHeight = useMainHeight();
  const [toggleReset, setToggleReset] = useState(false);

  const canReorderConstituents =
    isContentEditable && !isProcessing && !isModified && schema.items.length > 1 && !hasActiveFilter;
  const reorderDisabled = !activeCst || !canReorderConstituents;

  const cloneDisabled = !activeCst || !isContentEditable || isProcessing || isModified;

  const listHeight = useFitHeight('8.2rem', '10rem');

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

  function initiateSubmit() {
    const element = document.getElementById(globalIDs.value_editor) as HTMLFormElement;
    if (element) {
      element.requestSubmit();
    }
  }

  function handleInput(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.altKey && !event.shiftKey && (event.code === 'ArrowUp' || event.code === 'ArrowDown')) {
      if (!reorderDisabled) {
        event.preventDefault();
        event.stopPropagation();
        if (event.code === 'ArrowUp') {
          moveUp();
        } else {
          moveDown();
        }
      }
      return;
    }
    if (event.altKey && !event.shiftKey && event.code === 'KeyV') {
      if (!cloneDisabled) {
        event.preventDefault();
        event.stopPropagation();
        void cloneCst();
      }
      return;
    }
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

  function handleActivateCst(cst: Constituenta) {
    clearPendingActiveID();
    router.changeActive(cst.id);
  }

  const handleRowsDropped = useRowsDropHandler(cloneCst, moveAfter);

  return (
    <div
      tabIndex={-1}
      className={clsx('relative flex flex-col', 'min-h-80 max-w-[calc(min(100vw,80rem))] mx-auto')}
      style={{ height: mainHeight }}
      onKeyDown={handleInput}
    >
      <ToolbarValueTab
        className={clsx(
          'cc-tab-tools cc-animate-position',
          'right-4 lg:right-1/2 -translate-x-1/2 lg:translate-x-0',
          'backdrop-blur-xs bg-background/90'
        )}
        onSubmit={initiateSubmit}
        onReset={() => setToggleReset(prev => !prev)}
      />

      <div className='flex min-h-0 flex-1 flex-col overflow-hidden pt-8 md:items-center lg:flex-row lg:items-stretch'>
        <div className='mx-0 flex h-full min-h-0 min-w-120 flex-1 flex-col overflow-hidden pt-8 md:mx-auto md:w-195 xs:pt-0 lg:flex-none'>
          <ConstituentsNarrowPicker
            className='min-h-0 flex-1'
            scrollChildren
            searchClassName='mb-1 ml-6 mt-2 w-fit'
            schema={schema}
            engine={engine}
            activeCst={activeCst}
            isSchemaIssue={isSchemaIssue}
            isModelIssue={cst => isModelIssue(engine, cst)}
            onActivate={handleActivateCst}
            showModelFilter
            stopSearchKeyPropagation
          >
            {activeCst ? (
              <FormValue
                key={`data-${activeCst.id}`}
                id={globalIDs.value_editor}
                activeCst={activeCst}
                onOpenEdit={handleOpenEdit}
                toggleReset={toggleReset}
              />
            ) : null}
          </ConstituentsNarrowPicker>
        </div>
        <ViewConstituents
          className={clsx(
            'cc-animate-sidebar min-h-55 hidden shrink-0 self-start lg:block',
            'mt-9 rounded-l-md rounded-r-none overflow-visible'
          )}
          schema={schema}
          engine={engine}
          activeCst={activeCst}
          isSchemaIssue={isSchemaIssue}
          isModelIssue={cst => isModelIssue(engine, cst)}
          onActivate={handleActivateCst}
          enableRowReordering={canReorderConstituents}
          onRowsDropped={handleRowsDropped}
          maxListHeight={listHeight}
          sidebarActions={
            isContentEditable ? (
              <div className='flex pl-1'>
                <MiniButton
                  title={prepareTooltip(tx('tx.general.moveUp'), 'Alt + ↑')}
                  aria-label={tx('tx.general.moveUp')}
                  className='px-0'
                  icon={<IconMoveUp size='1.1rem' className='hover:icon-primary text-muted-foreground' />}
                  onClick={moveUp}
                  disabled={reorderDisabled}
                />
                <MiniButton
                  title={prepareTooltip(tx('tx.general.moveDown'), 'Alt + ↓')}
                  aria-label={tx('tx.general.moveDown')}
                  className='px-0'
                  icon={<IconMoveDown size='1.1rem' className='hover:icon-primary text-muted-foreground' />}
                  onClick={moveDown}
                  disabled={reorderDisabled}
                />
              </div>
            ) : null
          }
        />
      </div>
    </div>
  );
}
