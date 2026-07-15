'use client';

import { useTx } from '@/i18n';
import { type Graph } from '@rsconcept/domain/graph/graph';

import { useTermGraphStore } from '@/features/rsform/stores/term-graph';

import { MiniButton } from '@/components/control';
import { Dropdown, DropdownButton, useDropdown } from '@/components/dropdown';
import { IconFilter, IconFitImage, IconFocus, IconImage, IconPNG, IconSVG } from '@/components/icons';
import { cn } from '@/components/utils';
import { prepareTooltip } from '@/utils/format';

import { IconEnableClustering } from '../../../components/icon-enable-clustering';
import { IconEnableOverviewCore } from '../../../components/icon-enable-overview-core';
import { IconEnableText } from '../../../components/icon-enable-text';
import { useRsformDialogsStore } from '../../../dialogs/rsform-dialog-store';
import { useSchemaEdit } from '../schema-edit-context';

import { useHandleActions } from './use-handle-actions';

interface ToolbarTGOptionsProps {
  className?: string;
  graph: Graph<number>;
}

export function ToolbarTGOptions({ className, graph }: ToolbarTGOptionsProps) {
  const tx = useTx();
  const { selectedCst, isProcessing, focusCst } = useSchemaEdit();

  const {
    elementRef: exportRef,
    isOpen: isExportOpen,
    toggle: toggleExport,
    handleBlur: handleExportBlur
  } = useDropdown();

  const {
    handleFitView,
    handleToggleText,
    handleToggleClustering,
    handleToggleOverviewCore,
    handleExportSVG,
    handleExportPNG,
    handleSetFocus,
    isExportingImage
  } = useHandleActions(graph);

  const showParams = useRsformDialogsStore(state => state.showGraphParams);
  const filter = useTermGraphStore(state => state.filter);

  function handleExportSvgBtn() {
    toggleExport();
    void handleExportSVG();
  }

  function handleExportPngBtn() {
    toggleExport();
    void handleExportPNG();
  }

  const textToggleTitle = !filter.noText ? tx('tx.general.labels.hide') : tx('tx.general.labels.show');
  const derivedToggleTitle = !filter.foldDerived ? tx('tx.cst.spawned.hide') : tx('tx.cst.spawned.show');
  const coreToggleTitle = filter.overviewCore
    ? tx('tx.termGraph.overviewCore.hide')
    : tx('tx.termGraph.overviewCore.show');

  return (
    <div className={cn('grid grid-cols-2 gap-1 pointer-events-auto', className)}>
      <MiniButton
        title={prepareTooltip(tx('tx.flow.fitView'), 'G')}
        icon={<IconFitImage size='1.25rem' className='icon-primary' />}
        onClick={handleFitView}
      />

      <MiniButton
        title={tx('tx.general.view.settings')}
        icon={<IconFilter size='1.25rem' className='icon-primary' />}
        onClick={showParams}
      />
      <MiniButton
        title={tx('tx.termGraph.focus.hint')}
        icon={<IconFocus size='1.25rem' className='icon-primary' />}
        disabled={selectedCst.length !== 1}
        onClick={handleSetFocus}
      />
      <MiniButton
        title={prepareTooltip(coreToggleTitle, 'O')}
        icon={<IconEnableOverviewCore value={filter.overviewCore} size='1.25rem' />}
        onClick={handleToggleOverviewCore}
        disabled={!!focusCst}
      />
      <MiniButton
        data-tour='graph-toggle-labels'
        title={prepareTooltip(textToggleTitle, 'T')}
        icon={<IconEnableText value={!filter.noText} size='1.25rem' />}
        onClick={handleToggleText}
      />
      <MiniButton
        title={prepareTooltip(derivedToggleTitle, 'V')}
        icon={<IconEnableClustering value={!filter.foldDerived} size='1.25rem' />}
        onClick={handleToggleClustering}
      />
      <div ref={exportRef} onBlur={handleExportBlur} className='flex relative'>
        <MiniButton
          title={tx('tx.general.images.save')}
          hideTitle={isExportOpen}
          icon={<IconImage size='1.25rem' className='icon-primary' />}
          onClick={toggleExport}
          disabled={isProcessing || isExportingImage}
        />
        <Dropdown isOpen={isExportOpen} className='-translate-x-1/2'>
          <DropdownButton
            icon={<IconPNG size='1.25rem' className='icon-primary' />}
            text={tx('tx.general.save') + ' PNG'}
            onClick={handleExportPngBtn}
            disabled={isProcessing || isExportingImage}
          />
          <DropdownButton
            icon={<IconSVG size='1.25rem' className='icon-primary' />}
            text={tx('tx.general.save') + ' SVG'}
            onClick={handleExportSvgBtn}
            disabled={isProcessing || isExportingImage}
          />
        </Dropdown>
      </div>
    </div>
  );
}
