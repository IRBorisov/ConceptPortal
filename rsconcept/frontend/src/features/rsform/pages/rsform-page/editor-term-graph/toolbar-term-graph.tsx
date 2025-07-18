import { useReactFlow } from 'reactflow';

import { HelpTopic } from '@/features/help';
import { BadgeHelp } from '@/features/help/components/badge-help';
import { type ILibraryItemReference } from '@/features/library';
import { MiniSelectorOSS } from '@/features/library/components/mini-selector-oss';

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
import { useDialogsStore } from '@/stores/dialogs';
import { PARAMETER } from '@/utils/constants';

import { CstType } from '../../../backend/types';
import { useMutatingRSForm } from '../../../backend/use-mutating-rsform';
import { useTermGraphStore } from '../../../stores/term-graph';
import { useRSEdit } from '../rsedit-context';

import { flowOptions } from './tg-flow';

export function ToolbarTermGraph() {
  const isProcessing = useMutatingRSForm();
  const {
    schema, //
    selected,
    setFocus,
    navigateOss,
    isContentEditable,
    canDeleteSelected,
    createCst,
    promptDeleteCst
  } = useRSEdit();
  const showTypeGraph = useDialogsStore(state => state.showShowTypeGraph);
  const showParams = useDialogsStore(state => state.showGraphParams);
  const filter = useTermGraphStore(state => state.filter);
  const toggleText = useTermGraphStore(state => state.toggleText);
  const toggleClustering = useTermGraphStore(state => state.toggleClustering);

  const { fitView } = useReactFlow();

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

  return (
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
      <MiniButton
        icon={<IconTypeGraph size='1.25rem' className='icon-primary' />}
        title='Граф ступеней'
        onClick={handleShowTypeGraph}
      />
      <BadgeHelp topic={HelpTopic.UI_GRAPH_TERM} contentClass='sm:max-w-160' offset={4} />
    </div>
  );
}
