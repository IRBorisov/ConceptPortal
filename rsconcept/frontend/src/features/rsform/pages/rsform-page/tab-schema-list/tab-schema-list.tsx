'use client';

import clsx from 'clsx';

import { useTx } from '@/i18n';
import { CstType } from '@rsconcept/domain/library/rsform';

import { useConceptNavigation } from '@/app';
import { MiniSelectorOSS } from '@/features/library/components/mini-selector-oss';
import { emitOnboardingAction, OnboardingActionID } from '@/features/onboarding/models/actions';

import { ExportDropdown } from '@/components/control/export-dropdown';
import { type RowSelectionState } from '@/components/data-table';
import { SearchBar } from '@/components/input';
import { useRowsDropHandler } from '@/hooks/use-rows-drop-handler';
import { useFitHeight } from '@/stores/app-layout';
import { withPreventDefault } from '@/utils/utils';

import { useFilteredItems } from '../../../components/view-constituents/use-filtered-items';
import { hasActiveCstFilter, useCstSearchStore } from '../../../stores/cst-search';
import { useSchemaEdit } from '../schema-edit-context';

import { TableSchemaList } from './table-schema-list';
import { ToolbarSchemaList } from './toolbar-schema-list';

export function TabSchemaList() {
  const tx = useTx();
  const router = useConceptNavigation();
  const {
    isContentEditable,
    isProcessing,
    schema,
    selectedCst,
    activeCst,
    deselectAll,
    setSelectedCst,
    clearPendingActiveID,
    createCst,
    promptCreateCst,
    moveUp,
    moveDown,
    moveAfter,
    cloneCst,
    promptDeleteSelected
  } = useSchemaEdit();

  const query = useCstSearchStore(state => state.query);
  const filter = useCstSearchStore(state => state.filter);
  const setQuery = useCstSearchStore(state => state.setQuery);
  const filtered = useFilteredItems(schema);
  const listScrollKey = `${query}\0${filter}`;
  const hasActiveFilter = hasActiveCstFilter(query, filter);

  function handleChangeQuery(value: string) {
    setQuery(value);
  }

  function completeSearchPractice(value: string = query) {
    if (value.trim()) {
      emitOnboardingAction(OnboardingActionID.CONSTITUENTS_SEARCH_USED);
    }
  }

  function handleSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      completeSearchPractice(query);
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

  function handleDeselectAll() {
    deselectAll();
    router.clearActive();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      withPreventDefault(handleDeselectAll)(event);
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
    const { cstListToFile } = await import('../../../utils/rsform2pdf');
    return cstListToFile(schema.items);
  }

  function processAltKey(code: string): boolean {
    if (selectedCst.length > 0 && !hasActiveFilter) {
      // prettier-ignore
      switch (code) {
        case 'ArrowUp': moveUp(); return true;
        case 'ArrowDown': moveDown(); return true;
        case 'KeyV': void cloneCst(); return true;
      }
    } else if (selectedCst.length > 0) {
      if (code === 'KeyV') {
        void cloneCst();
        return true;
      }
    }
    // prettier-ignore
    switch (code) {
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
  const focusCstId = activeCst?.id;

  return (
    <div tabIndex={-1} onKeyDown={handleKeyDown} className='relative pt-8'>
      {isContentEditable ? (
        <ToolbarSchemaList
          className={clsx(
            'cc-tab-tools',
            'right-4 lg:right-1/2 -translate-x-1/2 lg:translate-x-0',
            'cc-animate-position',
            'mx-8'
          )}
          onDeselectAll={handleDeselectAll}
        />
      ) : null}

      <div className={clsx('flex items-center border-b', !isContentEditable && 'justify-center pl-10')}>
        {isContentEditable ? (
          <div className='px-2' data-tour='list-selection'>
            {tx('tx.general.selection.status', {
              selected: selectedCst.length,
              total: schema.items.length
            })}
          </div>
        ) : null}
        {!isContentEditable && schema.oss.length > 0 ? (
          <MiniSelectorOSS
            items={schema.oss}
            onSelect={(event, value) => router.gotoOss(value.id, event.ctrlKey || event.metaKey)}
          />
        ) : null}
        <SearchBar
          id='constituents_search'
          noBorder
          className='max-w-50'
          query={query}
          onChangeQuery={handleChangeQuery}
          onBlur={() => completeSearchPractice()}
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
        <TableSchemaList
          items={filtered}
          focusCstId={focusCstId}
          listScrollKey={listScrollKey}
          maxHeight={tableHeight}
          enableSelection={isContentEditable}
          selected={rowSelection}
          setSelected={handleRowSelection}
          enableRowReordering={isContentEditable && !isProcessing && schema.items.length > 1 && !hasActiveFilter}
          onEdit={cstID => {
            clearPendingActiveID();
            router.gotoEditActive(cstID);
          }}
          onCreateNew={() => void promptCreateCst()}
          onMoveRows={handleRowsDrop}
        />
      </div>
    </div>
  );
}
