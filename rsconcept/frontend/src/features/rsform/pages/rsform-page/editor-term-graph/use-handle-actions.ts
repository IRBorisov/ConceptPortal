import { useState } from 'react';
import { useReactFlow } from '@xyflow/react';
import { toPng, toSvg } from 'html-to-image';
import fileDownload from 'js-file-download';

import { useScrollToNode } from '@/components/flow/use-scroll-to-node';
import { type Graph } from '@/models/graph';
import { useDialogsStore } from '@/stores/dialogs';
import { usePreferencesStore } from '@/stores/preferences';
import { APP_COLOR_CODES } from '@/styling/colors';
import { EXPORTS, PARAMETER, REACTFLOW_VIEWPORT } from '@/utils/constants';
import { cleanSvg } from '@/utils/svg';
import { dataUrlToBlob, withPreventDefault } from '@/utils/utils';

import { CstType } from '../../../backend/types';
import { useMutatingRSForm } from '../../../backend/use-mutating-rsform';
import { useUpdateCrucial } from '../../../backend/use-update-crucial';
import { isBasicConcept } from '../../../models/rsform-api';
import { InteractionMode, useTermGraphStore, useTGConnectionStore } from '../../../stores/term-graph';
import { useRSEdit } from '../rsedit-context';

/** Options for graph fit view. */
export const fitViewOptions = { padding: 0.3, duration: PARAMETER.zoomDuration };

const IMAGE_PADDING_HORIZONTAL = 75;
const IMAGE_PADDING_VERTICAL = 20;

export function useHandleActions(graph: Graph<number>) {
  const darkMode = usePreferencesStore(state => state.darkMode);
  const isProcessing = useMutatingRSForm();
  const { fitView, getNodesBounds, getNodes } = useReactFlow();
  const scrollToNode = useScrollToNode();
  const {
    schema,
    selectedCst,
    isContentEditable,
    setSelectedCst,
    deselectAll,
    promptCreateCst,
    setFocus,
    promptDeleteSelected
  } = useRSEdit();

  const mode = useTermGraphStore(state => state.mode);

  const toggleText = useTermGraphStore(state => state.toggleText);
  const toggleClustering = useTermGraphStore(state => state.toggleClustering);
  const toggleHermits = useTermGraphStore(state => state.toggleHermits);
  const toggleMode = useTermGraphStore(state => state.toggleMode);
  const toggleEdgeType = useTGConnectionStore(state => state.toggleConnectionType);

  const { updateCrucial } = useUpdateCrucial();
  const showEditCst = useDialogsStore(state => state.showEditCst);
  const showTypeGraph = useDialogsStore(state => state.showShowTypeGraph);

  const [isExportingImage, setIsExportingImage] = useState(false);

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

  function handleSetFocus() {
    const target = schema.cstByID.get(selectedCst[0]);
    if (target) {
      setFocus(target);
    }
  }

  function handleToggleMode() {
    toggleMode();
    deselectAll();
  }

  function handleToggleCrucial() {
    if (selectedCst.length === 0) {
      return;
    }
    const isCrucial = !schema.cstByID.get(selectedCst[0])!.crucial;
    void updateCrucial({
      itemID: schema.id,
      data: {
        target: selectedCst,
        value: isCrucial
      }
    });
  }

  function panToCst(cstID: number) {
    setTimeout(
      () =>
        scrollToNode(String(cstID), {
          duration: PARAMETER.moveDuration,
          padding: fitViewOptions.padding,
          maxZoom: 1.5
        }),
      PARAMETER.moveDuration
    );
  }

  function handleCreateCst() {
    const definition = selectedCst.map(id => schema.cstByID.get(id)!.alias).join(' ');
    const hintType = selectedCst.length === 0 ? CstType.BASE : CstType.TERM;
    void promptCreateCst(hintType, definition).then(newID => newID && panToCst(newID));
  }

  function handleDeleteSelected() {
    if (isProcessing) {
      return;
    }
    promptDeleteSelected();
  }

  function handelFastEdit() {
    if (selectedCst.length !== 1) {
      return;
    }
    showEditCst({ schemaID: schema.id, targetID: selectedCst[0] });
  }

  function handleSelectCore() {
    const isCore = (cstID: number) => {
      const cst = schema.cstByID.get(cstID);
      return !!cst && isBasicConcept(cst.cst_type);
    };
    const core = [...graph.nodes.keys()].filter(isCore);
    setSelectedCst([...core, ...graph.expandInputs(core)]);
  }

  async function handleExportPNG() {
    if (isExportingImage) {
      return;
    }

    const node = document.querySelector(`.${REACTFLOW_VIEWPORT}`);
    if (!node || !(node instanceof HTMLElement)) {
      return;
    }

    setIsExportingImage(true);

    await new Promise(resolve => requestAnimationFrame(resolve));
    await new Promise(resolve => requestAnimationFrame(resolve));
    await new Promise(resolve => setTimeout(resolve, 10));

    const bounds = getNodesBounds(getNodes());
    const exportWidth = bounds.width + 2 * IMAGE_PADDING_HORIZONTAL;
    const exportHeight = bounds.height + 2 * IMAGE_PADDING_VERTICAL;

    const dataUrl = await toPng(node, {
      width: exportWidth,
      height: exportHeight,
      pixelRatio: EXPORTS.pngPixelRatio,
      backgroundColor: darkMode ? APP_COLOR_CODES.bgDark : APP_COLOR_CODES.bgLight,
      style: {
        width: `${exportWidth}px`,
        height: `${exportHeight}px`,
        transform: `translate(${IMAGE_PADDING_HORIZONTAL - bounds.x}px, ${IMAGE_PADDING_VERTICAL - bounds.y}px)`
      }
    });
    const blob = dataUrlToBlob(dataUrl);
    fileDownload(blob, 'graph.png');

    setIsExportingImage(false);
  }

  async function handleExportSVG() {
    if (isExportingImage) {
      return;
    }

    const node = document.querySelector(`.${REACTFLOW_VIEWPORT}`);
    if (!node || !(node instanceof HTMLElement)) {
      return;
    }

    setIsExportingImage(true);

    await new Promise(resolve => requestAnimationFrame(resolve));
    await new Promise(resolve => requestAnimationFrame(resolve));
    await new Promise(resolve => setTimeout(resolve, 10));

    try {
      const bounds = getNodesBounds(getNodes());

      const exportWidth = bounds.width + 2 * IMAGE_PADDING_HORIZONTAL;
      const exportHeight = bounds.height + 2 * IMAGE_PADDING_VERTICAL;

      const prefix = 'data:image/svg+xml;charset=utf-8,';

      const svgString = await toSvg(node, {
        skipFonts: true,
        width: exportWidth,
        height: exportHeight,
        style: {
          width: `${exportWidth}px`,
          height: `${exportHeight}px`,
          transform: `translate(${IMAGE_PADDING_HORIZONTAL - bounds.x}px, ${IMAGE_PADDING_VERTICAL - bounds.y}px)`
        }
      });

      let rawSvg = svgString.startsWith(prefix) ? svgString.slice(prefix.length) : svgString;
      rawSvg = decodeURIComponent(rawSvg);

      const cleanSvgStr = cleanSvg(rawSvg);

      fileDownload(cleanSvgStr, 'graph.svg');
    } catch (error) {
      console.error(error);
    } finally {
      setIsExportingImage(false);
    }
  }

  function handleSelectOwned() {
    setSelectedCst([...graph.nodes.keys()].filter(cstID => !schema.cstByID.get(cstID)?.is_inherited));
  }

  function handleSelectInherited() {
    setSelectedCst([...graph.nodes.keys()].filter(cstID => schema.cstByID.get(cstID)?.is_inherited ?? false));
  }

  function handleSelectCrucial() {
    setSelectedCst([...graph.nodes.keys()].filter(cstID => schema.cstByID.get(cstID)?.crucial ?? false));
  }

  function handleExpandOutputs() {
    setSelectedCst(prev => [...prev, ...graph.expandOutputs(prev)]);
  }

  function handleExpandInputs() {
    setSelectedCst(prev => [...prev, ...graph.expandInputs(prev)]);
  }

  function handleSelectMaximize() {
    setSelectedCst(prev => graph.maximizePart(prev));
  }

  function handleSelectInvert() {
    setSelectedCst(prev => [...graph.nodes.keys()].filter(item => !prev.includes(item)));
  }

  function handleSelectAllInputs() {
    setSelectedCst(prev => [...prev, ...graph.expandAllInputs(prev)]);
  }

  function handleSelectAllOutputs() {
    setSelectedCst(prev => [...prev, ...graph.expandAllOutputs(prev)]);
  }

  function handleFitView() {
    void fitView(fitViewOptions);
  }

  function handleSelectionHotkey(eventCode: string): boolean {
    if (eventCode === 'Escape') {
      setFocus(null);
      return true;
    }
    if (eventCode === 'Digit1') {
      handleExpandInputs();
      return true;
    }
    if (eventCode === 'Digit2') {
      handleExpandOutputs();
      return true;
    }
    if (eventCode === 'Digit3') {
      handleSelectAllInputs();
      return true;
    }
    if (eventCode === 'Digit4') {
      handleSelectAllOutputs();
      return true;
    }
    if (eventCode === 'Digit5') {
      handleSelectMaximize();
      return true;
    }
    if (eventCode === 'Digit6') {
      handleSelectInvert();
      return true;
    }
    if (eventCode === 'KeyZ') {
      handleSelectCore();
      return true;
    }
    if (eventCode === 'KeyX') {
      handleSelectCrucial();
      return true;
    }
    if (eventCode === 'KeyC') {
      handleSelectOwned();
      return true;
    }
    if (eventCode === 'KeyY') {
      handleSelectInherited();
      return true;
    }

    return false;
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (isProcessing) {
      return;
    }
    if (event.shiftKey || event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }
    if (handleSelectionHotkey(event.code)) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    if (event.code === 'KeyG') {
      withPreventDefault(handleFitView)(event);
      return;
    }
    if (event.code === 'KeyT') {
      withPreventDefault(toggleText)(event);
      return;
    }
    if (event.code === 'KeyB') {
      withPreventDefault(toggleClustering)(event);
      return;
    }
    if (event.code === 'KeyH') {
      withPreventDefault(toggleHermits)(event);
      return;
    }

    if (isContentEditable) {
      if (event.code === 'KeyF') {
        withPreventDefault(handleToggleCrucial)(event);
        return;
      }
      if (event.code === 'KeyQ') {
        withPreventDefault(handleToggleMode)(event);
        return;
      }
      if (event.code === 'KeyE' && mode === InteractionMode.edit) {
        withPreventDefault(toggleEdgeType)(event);
        return;
      }
      if (event.code === 'KeyR') {
        withPreventDefault(handleCreateCst)(event);
        return;
      }
      if (event.code === 'KeyV') {
        withPreventDefault(handelFastEdit)(event);
        return;
      }
      if (event.code === 'Delete' || event.code === 'Backquote') {
        withPreventDefault(handleDeleteSelected)(event);
        return;
      }
    }
  }

  return {
    handleKeyDown,

    handleShowTypeGraph,
    handleSetFocus,
    handleFitView,
    handleExpandInputs,
    handleExpandOutputs,
    handleSelectAllInputs,
    handleSelectAllOutputs,
    handleSelectMaximize,
    handleSelectInvert,
    handleSelectCore,
    handleSelectOwned,
    handleSelectInherited,
    handleSelectCrucial,
    handleToggleMode,
    handleToggleCrucial,
    handleCreateCst,
    handleDeleteSelected,
    handleToggleEdgeType: toggleEdgeType,
    handleToggleText: toggleText,
    handleToggleClustering: toggleClustering,
    handleToggleHermits: toggleHermits,
    handelFastEdit,
    handleExportSVG,
    handleExportPNG,
    isExportingImage
  };
}
