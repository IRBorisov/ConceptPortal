'use client';

import { useStoreApi } from '@xyflow/react';

import { useTx } from '@/i18n';
import { type Graph } from '@rsconcept/domain/graph/graph';
import { isBasicConcept } from '@rsconcept/domain/library/rsform-api';

import { HelpTopic } from '@/features/help';
import { BadgeHelp } from '@/features/help/components/badge-help';
import { EditorTourID } from '@/features/onboarding/tours/editor-tours';

import { MiniButton } from '@/components/control';
import { cn } from '@/components/utils';
import { prepareTooltip } from '@/utils/format';

import { IconEdgeType } from '../../../components/icon-edge-type';
import { IconEnableOverviewCore } from '../../../components/icon-enable-overview-core';
import { IconGraphMode } from '../../../components/icon-graph-mode';
import { FocusLabel } from '../../../components/term-graph/focus-label';
import { ToolbarFocusedCst } from '../../../components/term-graph/toolbar-focused-cst';
import { ToolbarGraphSelection } from '../../../components/toolbar-graph-selection';
import { labelEdgeType, labelGraphMode } from '../../../labels';
import { InteractionMode, useTermGraphStore, useTGConnectionStore } from '../../../stores/term-graph';
import { useSchemaEdit } from '../schema-edit-context';

import { useHandleActions } from './use-handle-actions';

interface ToolbarSchemaGraphProps {
  className?: string;
  graph: Graph<number>;
}

export function ToolbarSchemaGraph({ className, graph }: ToolbarSchemaGraphProps) {
  const tx = useTx();
  const { schema, selectedCst, setSelectedCst, setFocus, isContentEditable, focusCst } = useSchemaEdit();

  const { handleToggleMode, handleToggleEdgeType, handleToggleOverviewCore } = useHandleActions(graph);

  const mode = useTermGraphStore(state => state.mode);
  const filter = useTermGraphStore(state => state.filter);
  const edgeType = useTGConnectionStore(state => state.connectionType);

  const store = useStoreApi();
  const { addSelectedNodes } = store.getState();

  function handleSetSelected(newSelection: number[]) {
    setSelectedCst(newSelection);
    addSelectedNodes(newSelection.map(id => String(id)));
  }

  const coreToggleTitle = filter.overviewCore
    ? tx('tx.termGraph.overviewCore.hide')
    : tx('tx.termGraph.overviewCore.show');

  return (
    <div
      className={cn(
        'grid justify-items-center', //
        'rounded-b-2xl hover:bg-background backdrop-blur-xs',
        className
      )}
      data-tour='graph-tools'
    >
      <div className='cc-icons'>
        {isContentEditable ? (
          <MiniButton
            title={prepareTooltip(labelGraphMode(mode), 'Q')}
            onClick={handleToggleMode}
            icon={
              <IconGraphMode value={mode} size='1.25rem' className={mode === 'edit' ? 'icon-green' : 'icon-primary'} />
            }
          />
        ) : null}
        {isContentEditable && schema.is_attributive ? (
          <MiniButton
            title={prepareTooltip(labelEdgeType(edgeType), 'E')}
            onClick={handleToggleEdgeType}
            icon={<IconEdgeType value={edgeType} size='1.25rem' className='icon-primary' />}
            disabled={mode !== InteractionMode.edit}
          />
        ) : null}
        {!focusCst ? (
          <MiniButton
            title={prepareTooltip(coreToggleTitle, 'O')}
            icon={<IconEnableOverviewCore value={filter.overviewCore} size='1.25rem' />}
            onClick={handleToggleOverviewCore}
          />
        ) : null}
        {focusCst ? <ToolbarFocusedCst resetFocus={() => setFocus(null)} /> : null}
        {!focusCst && mode === InteractionMode.explore ? (
          <ToolbarGraphSelection
            tipHotkeys
            graph={graph}
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
        <BadgeHelp
          topic={HelpTopic.UI_GRAPH_TERM}
          tourID={EditorTourID.TERM_GRAPH}
          contentClass='sm:max-w-160'
          offset={4}
        />
      </div>

      {focusCst ? <FocusLabel label={focusCst.alias} /> : null}
    </div>
  );
}
