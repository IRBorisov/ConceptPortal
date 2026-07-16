'use client';

import clsx from 'clsx';

import { useTx } from '@/i18n';
import { CstType } from '@rsconcept/domain/library/rsform';
import { isSchemaIssue } from '@rsconcept/domain/library/rsform-api';
import { isModelIssue } from '@rsconcept/domain/library/rsmodel-api';

import { useConceptNavigation } from '@/app';
import { emitOnboardingAction, OnboardingActionID } from '@/features/onboarding/models/actions';
import { useFilteredItems } from '@/features/rsform/components/view-constituents/use-filtered-items';
import { useSchemaEdit } from '@/features/rsform/pages/rsform-page/schema-edit-context';
import { hasActiveCstFilter, useCstSearchStore } from '@/features/rsform/stores/cst-search';

import { ExportDropdown } from '@/components/control/export-dropdown';
import { type RowSelectionState } from '@/components/data-table';
import { SearchBar } from '@/components/input';
import { useRowsDropHandler } from '@/hooks/use-rows-drop-handler';
import { useFitHeight } from '@/stores/app-layout';
import { usePreferencesStore } from '@/stores/preferences';
import { withPreventDefault } from '@/utils/utils';

import { useModelEdit } from '../model-edit-context';

import { TableModelList } from './table-model-list';
import { ToolbarModelList } from './toolbar-model-list';

export function TabModelList() {
  const tx = useTx();
  const router = useConceptNavigation();
  const {
    isContentEditable,
    isProcessing,
    schema,
    selectedCst,
    deselectAll,
    setSelectedCst,
    createCst,
    promptCreateCst,
    moveUp,
    moveDown,
    moveAfter,
    cloneCst,
    promptDeleteSelected
  } = useSchemaEdit();
  const { engine } = useModelEdit();

  const query = useCstSearchStore(state => state.query);
  const filter = useCstSearchStore(state => state.filter);
  const setQuery = useCstSearchStore(state => state.setQuery);
  const filtered = useFilteredItems(schema, isSchemaIssue, cst => isModelIssue(engine, cst));
  const hasActiveFilter = hasActiveCstFilter(query, filter);

  function handleChangeQuery(value: string) {
    setQuery(value);
  }

  function completeSearchPractice(value: string) {
    if (value.trim()) {
      emitOnboardingAction(OnboardingActionID.CONSTITUENTS_SEARCH_USED);
    }
  }

  function handleSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      completeSearchPractice(event.currentTarget.value);
    }
  }

  const rowSelection: RowSelectionState = Object.fromEntries(
    filtered.filter(cst => selectedCst.includes(cst.id)).map(cst => [String(cst.id), true])
  );

  function handleRowSelection(updater: React.SetStateAction<RowSelectionState>) {
    const newRowSelection = typeof updater === 'function' ? updater(rowSelection) : updater;
    const filteredIds = new Set(filtered.map(cst => cst.id));
    const hiddenSelected = selectedCst.filter(id => !filteredIds.has(id));
    const newVisibleSelection: number[] = [];

    for (const [key, selected] of Object.entries(newRowSelection)) {
      if (selected) {
        const cstID = Number(key);
        if (filteredIds.has(cstID)) {
          newVisibleSelection.push(cstID);
        }
      }
    }

    setSelectedCst([...hiddenSelected, ...newVisibleSelection]);
  }

  const handleRowsDrop = useRowsDropHandler(cloneCst, moveAfter);

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      withPreventDefault(deselectAll)(event);
      return;
    }
    if (!isContentEditable || isProcessing) {
      return;
    }
    if (event.key === 'Delete') {
      withPreventDefault(promptDeleteSelected)(event);
      return;
    }
    if (event.altKey && !event.shiftKey) {
      if (processAltKey(event.code)) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
    }
  }

  async function createPDFList() {
    const { cstListToFile } = await import('@/services/pdf');
    return cstListToFile(filtered, usePreferencesStore.getState().locale);
  }

  function processAltKey(code: string): boolean {
    if (selectedCst.length > 0 && !hasActiveFilter) {
      // prettier-ignore
      switch (code) {
        case 'ArrowUp': moveUp(); return true;
        case 'ArrowDown': moveDown(); return true;
        case 'KeyV': void cloneCst(); return true;
      }
    } else if (selectedCst.length > 0 && code === 'KeyV') {
      void cloneCst();
      return true;
    }
    // prettier-ignore
    switch (code) {
      case 'KeyQ': engine.recalculateAll(); return true;
      case 'Backquote': void promptCreateCst(); return true;

      case 'Digit1': void createCst(CstType.BASE); return true;
      case 'Digit2': void createCst(CstType.STRUCTURED); return true;
      case 'Digit3': void createCst(CstType.TERM); return true;
      case 'Digit4': void createCst(CstType.AXIOM); return true;
      case 'KeyW': void createCst(CstType.FUNCTION); return true;
      case 'KeyE': void createCst(CstType.PREDICATE); return true;
      case 'Digit5': void createCst(CstType.CONSTANT); return true;
      case 'Digit6': void createCst(CstType.STATEMENT); return true;
      case 'Digit7': void createCst(CstType.NOMINAL); return true;
    }
    return false;
  }

  const tableHeight = useFitHeight('4rem + 5px');

  return (
    <div tabIndex={-1} onKeyDown={handleKeyDown} className='relative pt-8'>
      {isContentEditable ? (
        <ToolbarModelList
          className={clsx(
            'cc-tab-tools',
            'right-4 lg:right-1/2 -translate-x-1/2 lg:translate-x-0',
            'cc-animate-position',
            'mx-8'
          )}
          hasActiveFilter={hasActiveFilter}
        />
      ) : null}

      <div className={clsx('flex items-center border-b', !isContentEditable && 'justify-center pl-10')}>
        {isContentEditable ? (
          <div className='px-2 shrink-0' data-tour='list-selection'>
            {tx('tx.general.selection.status', {
              selected: selectedCst.length,
              total: schema.items.length
            })}
          </div>
        ) : null}
        <SearchBar
          id='constituents_search'
          noBorder
          className='max-w-50'
          query={query}
          onChangeQuery={handleChangeQuery}
          onBlur={event => completeSearchPractice(event.currentTarget.value)}
          onKeyDown={handleSearchKeyDown}
          stopKeyPropagation
          data-tour='list-search'
        />
      </div>

      <ExportDropdown
        data={filtered}
        filename={schema.alias}
        className='absolute z-pop right-4 hidden sm:block top-9'
        disabled={filtered.length === 0}
        pdfConverter={createPDFList}
      />

      <div data-tour='list-table'>
        <TableModelList
          items={filtered}
          maxHeight={tableHeight}
          enableSelection={isContentEditable}
          selected={rowSelection}
          setSelected={handleRowSelection}
          enableRowReordering={isContentEditable && !isProcessing && schema.items.length > 1 && !hasActiveFilter}
          onEdit={cstID => router.gotoActiveValue(cstID)}
          onCreateNew={() => void promptCreateCst()}
          onMoveRows={handleRowsDrop}
        />
      </div>
    </div>
  );
}
