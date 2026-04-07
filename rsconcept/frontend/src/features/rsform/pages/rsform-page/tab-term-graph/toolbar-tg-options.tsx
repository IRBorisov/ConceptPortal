'use client';

import { useTermGraphStore } from '@/features/rsform/stores/term-graph';

import { MiniButton } from '@/components/control';
import { Dropdown, DropdownButton, useDropdown } from '@/components/dropdown';
import {
  IconFilter,
  IconFitImage,
  IconFocus,
  IconImage,
  IconPNG,
  IconSVG
} from '@/components/icons';
import { cn } from '@/components/utils';
import { type Graph } from '@/models/graph';
import { useDialogsStore } from '@/stores/dialogs';
import { prepareTooltip } from '@/utils/format';

import { IconEnableClustering } from '../../../components/icon-enable-clustering';
import { IconEnableText } from '../../../components/icon-enable-text';
import { useRSFormEdit } from '../rsedit-context';

import { useHandleActions } from './use-handle-actions';

interface ToolbarTGOptionsProps {
  className?: string;
  graph: Graph<number>;
}

export function ToolbarTGOptions({ className, graph }: ToolbarTGOptionsProps) {
  const { selectedCst, isProcessing } = useRSFormEdit();

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

  return (
    <div className={cn('grid grid-cols-2 gap-1 pointer-events-auto', className)}>
      <MiniButton
        titleHtml={prepareTooltip('Граф целиком', 'G')}
        icon={<IconFitImage size='1.25rem' className='icon-primary' />}
        onClick={handleFitView}
      />


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
        titleHtml={prepareTooltip(!filter.noText ? 'Скрыть текст' : 'Отобразить текст', 'T')}
        icon={<IconEnableText value={!filter.noText} size='1.25rem' />}
        onClick={handleToggleText}
      />
      <div ref={exportRef} onBlur={handleExportBlur} className='flex relative'>
        <MiniButton
          title='Сохранить изображение'
          hideTitle={isExportOpen}
          icon={<IconImage size='1.25rem' className='icon-primary' />}
          onClick={toggleExport}
          disabled={isProcessing || isExportingImage}
        />
        <Dropdown isOpen={isExportOpen} className='-translate-x-1/2'>
          <DropdownButton
            icon={<IconPNG size='1.25rem' className='icon-primary' />}
            text='Сохранить PNG'
            onClick={handleExportPngBtn}
            disabled={isProcessing || isExportingImage}
          />
          <DropdownButton
            icon={<IconSVG size='1.25rem' className='icon-primary' />}
            text='Сохранить SVG'
            onClick={handleExportSvgBtn}
            disabled={isProcessing || isExportingImage}
          />
        </Dropdown>
      </div>
      <MiniButton
        titleHtml={prepareTooltip(!filter.foldDerived ? 'Скрыть порожденные' : 'Отобразить порожденные', 'V')}
        icon={<IconEnableClustering value={!filter.foldDerived} size='1.25rem' />}
        onClick={handleToggleClustering}
      />
    </div>
  );
}
