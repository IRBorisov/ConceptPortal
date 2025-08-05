'use client';

import { useReactFlow, useStoreApi } from 'reactflow';

import { HelpTopic } from '@/features/help';
import { BadgeHelp } from '@/features/help/components/badge-help';
import { type ILibraryItemReference } from '@/features/library';
import { MiniSelectorOSS } from '@/features/library/components/mini-selector-oss';
import { ToolbarFocusedCst } from '@/features/rsform/components/term-graph/toolbar-focused-cst';
import { ToolbarGraphSelection } from '@/features/rsform/components/toolbar-graph-selection';
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

import { CstType } from '../../../backend/types';
import { useMutatingRSForm } from '../../../backend/use-mutating-rsform';
import { useTermGraphStore } from '../../../stores/term-graph';
import { useRSEdit } from '../rsedit-context';

import { flowOptions } from './tg-flow';

interface ToolbarTermGraphProps {
  className?: string;
}

export function ToolbarTermGraph({ className }: ToolbarTermGraphProps) {
  const isProcessing = useMutatingRSForm();
  const {
    schema,
    selected,
    setSelected,
    setFocus,
    navigateOss,
    isContentEditable,
    canDeleteSelected,
    createCst,
    promptDeleteCst,
    focusCst
  } = useRSEdit();
  const showTypeGraph = useDialogsStore(state => state.showShowTypeGraph);
  const showParams = useDialogsStore(state => state.showGraphParams);
  const filter = useTermGraphStore(state => state.filter);
  const toggleText = useTermGraphStore(state => state.toggleText);
  const toggleClustering = useTermGraphStore(state => state.toggleClustering);

  const { fitView } = useReactFlow();
  const store = useStoreApi();
  const { addSelectedNodes } = store.getState();

  function handleShowTypeGraph() {
    const typeInfo = schema.items.map(item => ({
      alias: item.alias,
      result: item.parse.typification,
      args: item.parse.args
    }));
    showTypeGraph({ items: typeInfo });
  }

  function handleCreateCst() {
    const definition = selected.map(id => schema.cstByID.get(id)!.alias).join(' ');
    createCst(selected.length === 0 ? CstType.BASE : CstType.TERM, false, definition);
  }

  function handleDeleteCst() {
    if (isProcessing) {
      return;
    }
    promptDeleteCst();
  }

  function handleFitView() {
    setTimeout(() => {
      fitView(flowOptions.fitViewOptions);
    }, PARAMETER.minimalTimeout);
  }

  function handleSetFocus() {
    const target = schema.cstByID.get(selected[0]);
    if (target) {
      setFocus(target);
    }
  }

  function handleSelectOss(event: React.MouseEvent<HTMLElement>, newValue: ILibraryItemReference) {
    navigateOss(newValue.id, event.ctrlKey || event.metaKey);
  }

  function handleSetSelected(newSelection: number[]) {
    setSelected(newSelection);
    addSelectedNodes(newSelection.map(id => String(id)));
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
          disabled={selected.length !== 1}
          onClick={handleSetFocus}
        />
        <MiniButton
          title='Граф целиком'
          icon={<IconFitImage size='1.25rem' className='icon-primary' />}
          onClick={handleFitView}
        />
        <MiniButton
          title={!filter.noText ? 'Скрыть текст' : 'Отобразить текст'}
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
          title={!filter.foldDerived ? 'Скрыть порожденные' : 'Отобразить порожденные'}
          icon={
            !filter.foldDerived ? (
              <IconClustering size='1.25rem' className='icon-green' />
            ) : (
              <IconClusteringOff size='1.25rem' className='icon-primary' />
            )
          }
          onClick={toggleClustering}
        />

        <MiniButton
          icon={<IconTypeGraph size='1.25rem' className='icon-primary' />}
          title='Граф ступеней'
          onClick={handleShowTypeGraph}
        />
        <BadgeHelp topic={HelpTopic.UI_GRAPH_TERM} contentClass='sm:max-w-160' offset={4} />
      </div>
      <div className='cc-icons items-center'>
        {focusCst ? (
          <ToolbarFocusedCst
            focus={focusCst} //
            resetFocus={() => setFocus(null)}
          />
        ) : (
          <ToolbarGraphSelection
            graph={schema.graph}
            isCore={cstID => {
              const cst = schema.cstByID.get(cstID);
              return !!cst && isBasicConcept(cst.cst_type);
            }}
            isCrucial={cstID => schema.cstByID.get(cstID)?.crucial ?? false}
            isInherited={cstID => schema.cstByID.get(cstID)?.is_inherited ?? false}
            value={selected}
            onChange={handleSetSelected}
          />
        )}
        {isContentEditable ? (
          <MiniButton
            title='Новая конституента'
            icon={<IconNewItem size='1.25rem' className='icon-green' />}
            onClick={handleCreateCst}
            disabled={isProcessing}
          />
        ) : null}
        {isContentEditable ? (
          <MiniButton
            title='Удалить выбранные'
            icon={<IconDestroy size='1.25rem' className='icon-red' />}
            onClick={handleDeleteCst}
            disabled={!canDeleteSelected || isProcessing}
          />
        ) : null}
      </div>
    </div>
  );
}
