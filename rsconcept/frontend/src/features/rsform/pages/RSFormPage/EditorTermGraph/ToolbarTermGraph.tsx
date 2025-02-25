import { useReactFlow } from 'reactflow';
import clsx from 'clsx';

import { HelpTopic } from '@/features/help';
import { BadgeHelp } from '@/features/help/components';
import { MiniSelectorOSS } from '@/features/library/components';

import { MiniButton } from '@/components/Control';
import {
  IconClustering,
  IconClusteringOff,
  IconDestroy,
  IconFilter,
  IconFitImage,
  IconNewItem,
  IconText,
  IconTextOff,
  IconTypeGraph
} from '@/components/Icons';
import { useDialogsStore } from '@/stores/dialogs';
import { PARAMETER } from '@/utils/constants';

import { CstType } from '../../../backend/types';
import { useMutatingRSForm } from '../../../backend/useMutatingRSForm';
import { useTermGraphStore } from '../../../stores/termGraph';
import { useRSEdit } from '../RSEditContext';

import { VIEW_PADDING } from './TGFlow';

export function ToolbarTermGraph() {
  const isProcessing = useMutatingRSForm();
  const {
    schema, //
    selected,
    navigateOss,
    isContentEditable,
    canDeleteSelected,
    createCst,
    promptDeleteCst
  } = useRSEdit();
  const showTypeGraph = useDialogsStore(state => state.showShowTypeGraph);
  const showParams = useDialogsStore(state => state.showGraphParams);
  const filter = useTermGraphStore(state => state.filter);
  const setFilter = useTermGraphStore(state => state.setFilter);

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
    if (!canDeleteSelected || isProcessing) {
      return;
    }
    promptDeleteCst();
  }

  function handleToggleNoText() {
    setFilter({
      ...filter,
      noText: !filter.noText
    });
  }

  function handleFitView() {
    setTimeout(() => {
      fitView({ duration: PARAMETER.zoomDuration, padding: VIEW_PADDING });
    }, PARAMETER.minimalTimeout);
  }

  function handleFoldDerived() {
    setFilter({
      ...filter,
      foldDerived: !filter.foldDerived
    });
  }

  return (
    <div className='cc-icons'>
      {schema.oss.length > 0 ? (
        <MiniSelectorOSS
          items={schema.oss}
          onSelect={(event, value) => navigateOss(value.id, event.ctrlKey || event.metaKey)}
        />
      ) : null}
      <MiniButton
        title='Настройки фильтрации узлов и связей'
        icon={<IconFilter size='1.25rem' className='icon-primary' />}
        onClick={showParams}
      />
      <MiniButton
        icon={<IconFitImage size='1.25rem' className='icon-primary' />}
        title='Граф целиком'
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
        onClick={handleToggleNoText}
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
        onClick={handleFoldDerived}
      />
      {isContentEditable ? (
        <MiniButton
          title='Новая конституента'
          icon={<IconNewItem size='1.25rem' className='icon-green' />}
          disabled={isProcessing}
          onClick={handleCreateCst}
        />
      ) : null}
      {isContentEditable ? (
        <MiniButton
          title='Удалить выбранные'
          icon={<IconDestroy size='1.25rem' className='icon-red' />}
          disabled={!canDeleteSelected || isProcessing}
          onClick={handleDeleteCst}
        />
      ) : null}
      <MiniButton
        icon={<IconTypeGraph size='1.25rem' className='icon-primary' />}
        title='Граф ступеней'
        onClick={handleShowTypeGraph}
      />
      <BadgeHelp
        topic={HelpTopic.UI_GRAPH_TERM}
        className={clsx(PARAMETER.TOOLTIP_WIDTH, 'sm:max-w-[40rem]')}
        offset={4}
      />
    </div>
  );
}
