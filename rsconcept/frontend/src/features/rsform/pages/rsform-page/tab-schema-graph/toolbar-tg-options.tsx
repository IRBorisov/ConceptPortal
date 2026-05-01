'use client';

import { type Graph } from '@/domain/graph/graph';
import { useTx } from '@/i18n';

import { useTermGraphStore } from '@/features/rsform/stores/term-graph';

import { MiniButton } from '@/components/control';
import { Dropdown, DropdownButton, useDropdown } from '@/components/dropdown';
import { IconFilter, IconFitImage, IconFocus, IconImage, IconPNG, IconSVG } from '@/components/icons';
import { cn } from '@/components/utils';
import { useDialogsStore } from '@/stores/dialogs';
import { prepareTooltip } from '@/utils/format';

import { IconEnableClustering } from '../../../components/icon-enable-clustering';
import { IconEnableText } from '../../../components/icon-enable-text';
import { useSchemaEdit } from '../schema-edit-context';

import { useHandleActions } from './use-handle-actions';

interface ToolbarTGOptionsProps {
  className?: string;
  graph: Graph<number>;
}

export function ToolbarTGOptions({ className, graph }: ToolbarTGOptionsProps) {
  const tx = useTx();
  const { selectedCst, isProcessing } = useSchemaEdit();

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
    handleExportSVG,
    handleExportPNG,
    handleSetFocus,
    isExportingImage
  } = useHandleActions(graph);

  const showParams = useDialogsStore(state => state.showGraphParams);
  const filter = useTermGraphStore(state => state.filter);

  function handleExportSvgBtn() {
    toggleExport();
    void handleExportSVG();
  }

  function handleExportPngBtn() {
    toggleExport();
    void handleExportPNG();
  }

  const textToggleTitle = !filter.noText
    ? tx('ui.tg.toolbar.hideText', 'Hide text')
    : tx('ui.tg.toolbar.showText', 'Show text');
  const derivedToggleTitle = !filter.foldDerived
    ? tx('ui.tg.toolbar.hideDerived', 'Hide derived')
    : tx('ui.tg.toolbar.showDerived', 'Show derived');

  return (
    <div className={cn('grid grid-cols-2 gap-1 pointer-events-auto', className)}>
      <MiniButton
        title={prepareTooltip(tx('ui.tg.toolbar.fullGraph', 'Full graph'), tx('ui.hotkey.g', 'G'))}
        icon={<IconFitImage size='1.25rem' className='icon-primary' />}
        onClick={handleFitView}
      />

      <MiniButton
        title={tx('ui.tg.toolbar.filterSettings', 'Node and edge filter settings')}
        icon={<IconFilter size='1.25rem' className='icon-primary' />}
        onClick={showParams}
      />
      <MiniButton
        title={tx('ui.tg.toolbar.focusCst', 'Focus constituent')}
        icon={<IconFocus size='1.25rem' className='icon-primary' />}
        disabled={selectedCst.length !== 1}
        onClick={handleSetFocus}
      />
      <MiniButton
        title={prepareTooltip(textToggleTitle, tx('ui.hotkey.t', 'T'))}
        icon={<IconEnableText value={!filter.noText} size='1.25rem' />}
        onClick={handleToggleText}
      />
      <div ref={exportRef} onBlur={handleExportBlur} className='flex relative'>
        <MiniButton
          title={tx('ui.tg.toolbar.saveImage', 'Save image')}
          hideTitle={isExportOpen}
          icon={<IconImage size='1.25rem' className='icon-primary' />}
          onClick={toggleExport}
          disabled={isProcessing || isExportingImage}
        />
        <Dropdown isOpen={isExportOpen} className='-translate-x-1/2'>
          <DropdownButton
            icon={<IconPNG size='1.25rem' className='icon-primary' />}
            text={tx('ui.tg.toolbar.savePng', 'Save PNG')}
            onClick={handleExportPngBtn}
            disabled={isProcessing || isExportingImage}
          />
          <DropdownButton
            icon={<IconSVG size='1.25rem' className='icon-primary' />}
            text={tx('ui.tg.toolbar.saveSvg', 'Save SVG')}
            onClick={handleExportSvgBtn}
            disabled={isProcessing || isExportingImage}
          />
        </Dropdown>
      </div>
      <MiniButton
        title={prepareTooltip(derivedToggleTitle, tx('ui.hotkey.v', 'V'))}
        icon={<IconEnableClustering value={!filter.foldDerived} size='1.25rem' />}
        onClick={handleToggleClustering}
      />
    </div>
  );
}
