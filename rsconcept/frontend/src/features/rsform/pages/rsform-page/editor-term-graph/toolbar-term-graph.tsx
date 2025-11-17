'use client';

import { useReactFlow, useStoreApi } from 'reactflow';

import { HelpTopic } from '@/features/help';
import { BadgeHelp } from '@/features/help/components/badge-help';
import { type ILibraryItemReference } from '@/features/library';
import { MiniSelectorOSS } from '@/features/library/components/mini-selector-oss';
import { IconEdgeType } from '@/features/rsform/components/icon-edge-type';
import { IconGraphMode } from '@/features/rsform/components/icon-graph-mode';
import { FocusLabel } from '@/features/rsform/components/term-graph/focus-label';
import { ToolbarFocusedCst } from '@/features/rsform/components/term-graph/toolbar-focused-cst';
import { ToolbarGraphSelection } from '@/features/rsform/components/toolbar-graph-selection';
import { labelEdgeType, labelGraphMode } from '@/features/rsform/labels';
import { isBasicConcept } from '@/features/rsform/models/rsform-api';

import { MiniButton } from '@/components/control';
import {
  IconClustering,
  IconClusteringOff,
  IconDestroy,
  IconFilter,
  IconFitImage,
  IconFocus,
  IconNewItem,
  IconText,
  IconTextOff,
  IconTypeGraph
} from '@/components/icons';
import { cn } from '@/components/utils';
import { useDialogsStore } from '@/stores/dialogs';
import { PARAMETER } from '@/utils/constants';
import { prepareTooltip } from '@/utils/utils';

import { CstType } from '../../../backend/types';
import { useMutatingRSForm } from '../../../backend/use-mutating-rsform';
import { InteractionMode, useTermGraphStore, useTGConnectionStore } from '../../../stores/term-graph';
import { useRSEdit } from '../rsedit-context';

import { fitViewOptions } from './tg-flow';
import { useFilteredGraph } from './use-filtered-graph';

interface ToolbarTermGraphProps {
  className?: string;

  onDeleteSelected: () => void;
}

export function ToolbarTermGraph({ className, onDeleteSelected }: ToolbarTermGraphProps) {
  const isProcessing = useMutatingRSForm();
  const {
    schema,
    selectedCst,
    setSelectedCst,
    setFocus,
    navigateOss,
    isContentEditable,
    canDeleteSelected,
    createCst,
    focusCst,
    deselectAll
  } = useRSEdit();

  const showTypeGraph = useDialogsStore(state => state.showShowTypeGraph);
  const showParams = useDialogsStore(state => state.showGraphParams);
  const mode = useTermGraphStore(state => state.mode);
  const toggleMode = useTermGraphStore(state => state.toggleMode);
  const edgeType = useTGConnectionStore(state => state.connectionType);
  const toggleEdgeType = useTGConnectionStore(state => state.toggleConnectionType);
  const filter = useTermGraphStore(state => state.filter);
  const toggleText = useTermGraphStore(state => state.toggleText);
  const toggleClustering = useTermGraphStore(state => state.toggleClustering);
  const { filteredGraph } = useFilteredGraph();

  const { fitView } = useReactFlow();
  const store = useStoreApi();
  const { addSelectedNodes } = store.getState();

  function handleShowTypeGraph() {
    const typeInfo = schema.items
      .filter(item => !!item.parse)
      .map(item => ({
        alias: item.alias,
        result: item.parse!.typification,
        args: item.parse!.args
      }));
    showTypeGraph({ items: typeInfo });
  }

  function handleCreateCst() {
    const definition = selectedCst.map(id => schema.cstByID.get(id)!.alias).join(' ');
    createCst(selectedCst.length === 0 ? CstType.BASE : CstType.TERM, false, definition);
  }

  function handleFitView() {
    setTimeout(() => {
      fitView(fitViewOptions);
    }, PARAMETER.minimalTimeout);
  }

  function handleSetFocus() {
    const target = schema.cstByID.get(selectedCst[0]);
    if (target) {
      setFocus(target);
    }
  }

  function handleSelectOss(event: React.MouseEvent<HTMLElement>, newValue: ILibraryItemReference) {
    navigateOss(newValue.id, event.ctrlKey || event.metaKey);
  }

  function handleSetSelected(newSelection: number[]) {
    setSelectedCst(newSelection);
    addSelectedNodes(newSelection.map(id => String(id)));
  }

  function handleToggleMode() {
    toggleMode();
    deselectAll();
  }

  return (
    <div
      className={cn(
        'grid justify-items-center', //
        'rounded-b-2xl hover:bg-background backdrop-blur-xs',
        className
      )}
    >
      <div className='cc-icons'>
        {schema.oss.length > 0 ? <MiniSelectorOSS items={schema.oss} onSelect={handleSelectOss} /> : null}
        <MiniButton
          title='Настройки фильтрации узлов и связей'
          icon={<IconFilter size='1.25rem' className='icon-primary' />}
          onClick={showParams}
        />
        <MiniButton
          title='Задать фокус конституенту'
          icon={<IconFocus size='1.25rem' className='icon-primary' />}
          disabled={selectedCst.length !== 1}
          onClick={handleSetFocus}
        />
        <MiniButton
          titleHtml={prepareTooltip('Граф целиком', 'G')}
          icon={<IconFitImage size='1.25rem' className='icon-primary' />}
          onClick={handleFitView}
        />
        <MiniButton
          titleHtml={prepareTooltip(!filter.noText ? 'Скрыть текст' : 'Отобразить текст', 'T')}
          icon={
            !filter.noText ? (
              <IconText size='1.25rem' className='icon-green' />
            ) : (
              <IconTextOff size='1.25rem' className='icon-primary' />
            )
          }
          onClick={toggleText}
        />
        <MiniButton
          titleHtml={prepareTooltip(!filter.foldDerived ? 'Скрыть порожденные' : 'Отобразить порожденные', 'V')}
          icon={
            !filter.foldDerived ? (
              <IconClustering size='1.25rem' className='icon-green' />
            ) : (
              <IconClusteringOff size='1.25rem' className='icon-primary' />
            )
          }
          onClick={toggleClustering}
        />

        <BadgeHelp topic={HelpTopic.UI_GRAPH_TERM} contentClass='sm:max-w-160' offset={4} />
      </div>
      <div className='cc-icons items-start'>
        {focusCst ? <ToolbarFocusedCst resetFocus={() => setFocus(null)} /> : null}
        {!focusCst && mode === InteractionMode.explore ? (
          <ToolbarGraphSelection
            tipHotkeys
            graph={filteredGraph}
            isCore={cstID => {
              const cst = schema.cstByID.get(cstID);
              return !!cst && isBasicConcept(cst.cst_type);
            }}
            isCrucial={cstID => schema.cstByID.get(cstID)?.crucial ?? false}
            isInherited={cstID => schema.cstByID.get(cstID)?.is_inherited ?? false}
            value={selectedCst}
            onChange={handleSetSelected}
          />
        ) : null}
        {isContentEditable ? (
          <MiniButton
            titleHtml={prepareTooltip(labelGraphMode(mode), 'Q')}
            onClick={handleToggleMode}
            icon={
              <IconGraphMode value={mode} size='1.25rem' className={mode === 'edit' ? 'icon-green' : 'icon-primary'} />
            }
          />
        ) : null}
        {isContentEditable && mode === InteractionMode.edit ? (
          <MiniButton
            titleHtml={prepareTooltip(labelEdgeType(edgeType), 'E')}
            onClick={toggleEdgeType}
            icon={<IconEdgeType value={edgeType} size='1.25rem' className='icon-primary' />}
          />
        ) : null}
        {isContentEditable ? (
          <MiniButton
            titleHtml={prepareTooltip('Новая конституента', 'R')}
            icon={<IconNewItem size='1.25rem' className='icon-green' />}
            onClick={handleCreateCst}
            disabled={isProcessing}
          />
        ) : null}
        {isContentEditable ? (
          <MiniButton
            titleHtml={prepareTooltip('Удалить выбранные', 'Delete, `')}
            icon={<IconDestroy size='1.25rem' className='icon-red' />}
            onClick={onDeleteSelected}
            disabled={!canDeleteSelected || isProcessing}
          />
        ) : null}

        <MiniButton
          icon={<IconTypeGraph size='1.25rem' className='icon-primary' />}
          title='Граф ступеней'
          onClick={handleShowTypeGraph}
        />
      </div>
      {focusCst ? <FocusLabel label={focusCst.alias} /> : null}
    </div>
  );
}
