'use client';

import { useEffect, useEffectEvent, useRef, useState } from 'react';
import clsx from 'clsx';

import { useTx } from '@/i18n';
import { type Constituenta, type RSEngine } from '@rsconcept/domain/library';
import { isSchemaIssue } from '@rsconcept/domain/library/rsform-api';
import { isModelIssue } from '@rsconcept/domain/library/rsmodel-api';

import { useConceptNavigation } from '@/app';

import { MiniButton } from '@/components/control';
import { IconMoveDown, IconMoveUp } from '@/components/icons';
import { useRowsDropHandler } from '@/hooks/use-rows-drop-handler';
import { useFitHeight, useMainHeight } from '@/stores/app-layout';
import { useModificationStore } from '@/stores/modification';
import { globalIDs } from '@/utils/constants';
import { prepareTooltip } from '@/utils/format';

import { ViewConstituents } from '../../../components/view-constituents';
import { ConstituentsNarrowPicker } from '../../../components/view-constituents/constituents-narrow-picker';
import { hasActiveCstFilter, useCstSearchStore } from '../../../stores/cst-search';
import { useSchemaEdit } from '../schema-edit-context';

import { FormConstituenta } from './form-constituenta';
import { ToolbarConstituenta } from './toolbar-constituenta';

interface TabConstituentaProps {
  engine?: RSEngine;
}

export function TabConstituenta({ engine }: TabConstituentaProps) {
  const tx = useTx();
  const router = useConceptNavigation();
  const {
    schema,
    activeCst,
    isContentEditable,
    isProcessing,
    selectedCst,
    setSelectedCst,
    clearPendingActiveID,
    moveUp,
    moveDown,
    moveAfter,
    cloneCst
  } = useSchemaEdit();
  const mainHeight = useMainHeight();
  const onSelectCst = useEffectEvent(setSelectedCst);

  const { isModified } = useModificationStore();
  const query = useCstSearchStore(state => state.query);
  const filter = useCstSearchStore(state => state.filter);
  const hasActiveFilter = hasActiveCstFilter(query, filter);

  const [toggleReset, setToggleReset] = useState(false);

  const disabled = !activeCst || !isContentEditable || isProcessing;
  const canReorderConstituents = isContentEditable && !isProcessing && !isModified && !hasActiveFilter;

  const listHeight = useFitHeight('8.2rem', '10rem');

  const prevActiveCstId = useRef<number | null>(null);
  useEffect(
    function adjustSelectionOnActiveChange() {
      if (activeCst && prevActiveCstId.current !== activeCst.id) {
        prevActiveCstId.current = activeCst.id;
        const primarySelected = selectedCst.length === 0 ? undefined : selectedCst[selectedCst.length - 1];
        if (selectedCst.length !== 1 || primarySelected !== activeCst.id) {
          onSelectCst([activeCst.id]);
        }
      }
    },
    [activeCst, selectedCst]
  );

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
    if (canReorderConstituents) {
      // prettier-ignore
      switch (code) {
        case 'ArrowUp': moveUp(); return true;
        case 'ArrowDown': moveDown(); return true;
        case 'KeyV': void cloneCst(); return true;
      }
    } else if (code === 'KeyV') {
      void cloneCst();
      return true;
    }
    return false;
  }

  const handleRowsDropped = useRowsDropHandler(cloneCst, moveAfter);

  function handleOpenEdit(cstID: number) {
    clearPendingActiveID();
    router.changeActive(cstID);
  }

  function handleActivateCst(cst: Constituenta) {
    clearPendingActiveID();
    router.changeActive(cst.id);
  }

  return (
    <div
      tabIndex={-1}
      className={clsx('relative flex flex-col', 'min-h-80 max-w-[calc(min(100vw,80rem))] mx-auto')}
      style={{ height: mainHeight }}
      onKeyDown={handleInput}
    >
      <ToolbarConstituenta
        className={clsx(
          'cc-tab-tools cc-animate-position',
          'right-4 lg:right-1/2 -translate-x-1/2 lg:translate-x-0',
          'backdrop-blur-xs bg-background/90'
        )}
        hasInheritance={schema.inheritance.length > 0}
        activeCst={activeCst}
        onSubmit={initiateSubmit}
        onReset={() => setToggleReset(prev => !prev)}
        disabled={disabled}
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
            isModelIssue={engine ? cst => isModelIssue(engine, cst) : undefined}
            onActivate={handleActivateCst}
            showModelFilter={!!engine}
            stopSearchKeyPropagation
          >
            {activeCst ? (
              <FormConstituenta
                key={`cst-${activeCst.id}`}
                id={globalIDs.constituenta_editor}
                toggleReset={toggleReset}
                activeCst={activeCst}
                schema={schema}
                onOpenEdit={handleOpenEdit}
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
          isModelIssue={engine ? cst => isModelIssue(engine, cst) : undefined}
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
                  disabled={disabled || !canReorderConstituents || schema.items.length < 2}
                />
                <MiniButton
                  title={prepareTooltip(tx('tx.general.moveDown'), 'Alt + ↓')}
                  aria-label={tx('tx.general.moveDown')}
                  className='px-0'
                  icon={<IconMoveDown size='1.1rem' className='hover:icon-primary text-muted-foreground' />}
                  onClick={moveDown}
                  disabled={disabled || !canReorderConstituents || schema.items.length < 2}
                />
              </div>
            ) : null
          }
        />
      </div>
    </div>
  );
}
