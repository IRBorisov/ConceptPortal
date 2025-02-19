import clsx from 'clsx';

import { BadgeHelp, HelpTopic } from '@/features/help';
import { MiniSelectorOSS } from '@/features/library';

import { MiniButton } from '@/components/Control';
import {
  IconClustering,
  IconClusteringOff,
  IconDestroy,
  IconFilter,
  IconFitImage,
  IconImage,
  IconNewItem,
  IconText,
  IconTextOff,
  IconTypeGraph
} from '@/components/Icons';
import { useDialogsStore } from '@/stores/dialogs';
import { PARAMETER } from '@/utils/constants';

import { useMutatingRSForm } from '../../../backend/useMutatingRSForm';
import { useRSEdit } from '../RSEditContext';

interface ToolbarTermGraphProps {
  noText: boolean;
  foldDerived: boolean;

  showParamsDialog: () => void;
  onCreate: () => void;
  onDelete: () => void;
  onFitView: () => void;
  onSaveImage: () => void;

  toggleFoldDerived: () => void;
  toggleNoText: () => void;
}

export function ToolbarTermGraph({
  noText,
  foldDerived,
  toggleNoText,
  toggleFoldDerived,
  showParamsDialog,
  onCreate,
  onDelete,
  onFitView,
  onSaveImage
}: ToolbarTermGraphProps) {
  const controller = useRSEdit();
  const isProcessing = useMutatingRSForm();
  const showTypeGraph = useDialogsStore(state => state.showShowTypeGraph);

  function handleShowTypeGraph() {
    const typeInfo = controller.schema.items.map(item => ({
      alias: item.alias,
      result: item.parse.typification,
      args: item.parse.args
    }));
    showTypeGraph({ items: typeInfo });
  }

  return (
    <div className='cc-icons'>
      {controller.schema.oss.length > 0 ? (
        <MiniSelectorOSS
          items={controller.schema.oss}
          onSelect={(event, value) => controller.navigateOss(value.id, event.ctrlKey || event.metaKey)}
        />
      ) : null}
      <MiniButton
        title='Настройки фильтрации узлов и связей'
        icon={<IconFilter size='1.25rem' className='icon-primary' />}
        onClick={showParamsDialog}
      />
      <MiniButton
        icon={<IconFitImage size='1.25rem' className='icon-primary' />}
        title='Граф целиком'
        onClick={onFitView}
      />
      <MiniButton
        title={!noText ? 'Скрыть текст' : 'Отобразить текст'}
        icon={
          !noText ? (
            <IconText size='1.25rem' className='icon-green' />
          ) : (
            <IconTextOff size='1.25rem' className='icon-primary' />
          )
        }
        onClick={toggleNoText}
      />
      <MiniButton
        title={!foldDerived ? 'Скрыть порожденные' : 'Отобразить порожденные'}
        icon={
          !foldDerived ? (
            <IconClustering size='1.25rem' className='icon-green' />
          ) : (
            <IconClusteringOff size='1.25rem' className='icon-primary' />
          )
        }
        onClick={toggleFoldDerived}
      />
      {controller.isContentEditable ? (
        <MiniButton
          title='Новая конституента'
          icon={<IconNewItem size='1.25rem' className='icon-green' />}
          disabled={isProcessing}
          onClick={onCreate}
        />
      ) : null}
      {controller.isContentEditable ? (
        <MiniButton
          title='Удалить выбранные'
          icon={<IconDestroy size='1.25rem' className='icon-red' />}
          disabled={!controller.canDeleteSelected || isProcessing}
          onClick={onDelete}
        />
      ) : null}
      <MiniButton
        icon={<IconTypeGraph size='1.25rem' className='icon-primary' />}
        title='Граф ступеней'
        onClick={handleShowTypeGraph}
      />
      <MiniButton
        icon={<IconImage size='1.25rem' className='icon-primary' />}
        title='Сохранить изображение'
        onClick={onSaveImage}
      />
      <BadgeHelp
        topic={HelpTopic.UI_GRAPH_TERM}
        className={clsx(PARAMETER.TOOLTIP_WIDTH, 'sm:max-w-[40rem]')}
        offset={4}
      />
    </div>
  );
}
