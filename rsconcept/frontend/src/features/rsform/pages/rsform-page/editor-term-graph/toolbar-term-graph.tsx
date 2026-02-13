'use client';

import { useStoreApi } from '@xyflow/react';

import { useConceptNavigation } from '@/app';
import { HelpTopic } from '@/features/help';
import { BadgeHelp } from '@/features/help/components/badge-help';
import { type LibraryItemReference } from '@/features/library';
import { MiniSelectorOSS } from '@/features/library/components/mini-selector-oss';

import { MiniButton } from '@/components/control';
import { Dropdown, DropdownButton, useDropdown } from '@/components/dropdown';
import {
  IconClustering,
  IconClusteringOff,
  IconCrucial,
  IconDestroy,
  IconEdit2,
  IconFilter,
  IconFitImage,
  IconFocus,
  IconImage,
  IconNewItem,
  IconPNG,
  IconSVG,
  IconText,
  IconTextOff,
  IconTypeGraph
} from '@/components/icons';
import { cn } from '@/components/utils';
import { type Graph } from '@/models/graph';
import { useDialogsStore } from '@/stores/dialogs';
import { prepareTooltip } from '@/utils/utils';

import { useMutatingRSForm } from '../../../backend/use-mutating-rsform';
import { IconEdgeType } from '../../../components/icon-edge-type';
import { IconGraphMode } from '../../../components/icon-graph-mode';
import { FocusLabel } from '../../../components/term-graph/focus-label';
import { ToolbarFocusedCst } from '../../../components/term-graph/toolbar-focused-cst';
import { ToolbarGraphSelection } from '../../../components/toolbar-graph-selection';
import { labelEdgeType, labelGraphMode } from '../../../labels';
import { isBasicConcept } from '../../../models/rsform-api';
import { InteractionMode, useTermGraphStore, useTGConnectionStore } from '../../../stores/term-graph';
import { useRSFormEdit } from '../rsedit-context';

import { useHandleActions } from './use-handle-actions';

interface ToolbarTermGraphProps {
  className?: string;
  graph: Graph<number>;
}

export function ToolbarTermGraph({ className, graph }: ToolbarTermGraphProps) {
  const router = useConceptNavigation();
  const isProcessing = useMutatingRSForm();
  const {
    schema,
    selectedCst,
    setSelectedCst,
    setFocus,
    isContentEditable,
    canDeleteSelected,
    focusCst
  } = useRSFormEdit();

  const {
    elementRef: exportRef,
    isOpen: isExportOpen,
    toggle: toggleExport,
    handleBlur: handleExportBlur
  } = useDropdown();

  const {
    handleShowTypeGraph,
    handleSetFocus,
    handleFitView,
    handleToggleMode,
    handleToggleCrucial,
    handleCreateCst,
    handleDeleteSelected,
    handleToggleEdgeType,
    handleToggleText,
    handleToggleClustering,
    handelFastEdit,
    handleExportSVG,
    handleExportPNG,
    isExportingImage
  } = useHandleActions(graph);

  const showParams = useDialogsStore(state => state.showGraphParams);
  const mode = useTermGraphStore(state => state.mode);
  const edgeType = useTGConnectionStore(state => state.connectionType);
  const filter = useTermGraphStore(state => state.filter);

  const store = useStoreApi();
  const { addSelectedNodes } = store.getState();

  function handleSelectOss(event: React.MouseEvent<HTMLElement>, newValue: LibraryItemReference) {
    router.gotoOss(newValue.id, event.ctrlKey || event.metaKey);
  }

  function handleSetSelected(newSelection: number[]) {
    setSelectedCst(newSelection);
    addSelectedNodes(newSelection.map(id => String(id)));
  }

  function handleExportSvgBtn() {
    toggleExport();
    void handleExportSVG();
  }

  function handleExportPngBtn() {
    toggleExport();
    void handleExportPNG();
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
          onClick={handleToggleText}
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
          onClick={handleToggleClustering}
        />
        <MiniButton
          icon={<IconTypeGraph size='1.25rem' className='icon-primary' />}
          title='Граф ступеней'
          onClick={handleShowTypeGraph}
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

        <BadgeHelp topic={HelpTopic.UI_GRAPH_TERM} contentClass='sm:max-w-160' offset={4} />
      </div>
      <div className='cc-icons items-start'>
        {focusCst ? <ToolbarFocusedCst resetFocus={() => setFocus(null)} /> : null}

        {isContentEditable ? (
          <MiniButton
            titleHtml={prepareTooltip('Ключевая конституента', 'F')}
            aria-label='Переключатель статуса ключевой конституенты'
            icon={<IconCrucial size='1.25rem' className='icon-primary' />}
            onClick={handleToggleCrucial}
            disabled={isProcessing || selectedCst.length === 0}
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
        {isContentEditable ? (
          <MiniButton
            titleHtml={prepareTooltip(labelEdgeType(edgeType), 'E')}
            onClick={handleToggleEdgeType}
            icon={<IconEdgeType value={edgeType} size='1.25rem' className='icon-primary' />}
            disabled={mode !== InteractionMode.edit}
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
            titleHtml={prepareTooltip('Редактировать конституенту', 'V')}
            icon={<IconEdit2 size='1.25rem' className='icon-primary' />}
            onClick={handelFastEdit}
            disabled={isProcessing || selectedCst.length !== 1}
          />
        ) : null}
        {isContentEditable ? (
          <MiniButton
            titleHtml={prepareTooltip('Удалить выбранные', 'Delete, `')}
            icon={<IconDestroy size='1.25rem' className='icon-red' />}
            onClick={handleDeleteSelected}
            disabled={!canDeleteSelected || isProcessing}
          />
        ) : null}
      </div>
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
      {focusCst ? <FocusLabel label={focusCst.alias} /> : null}
    </div>
  );
}
