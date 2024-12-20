import clsx from 'clsx';

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
import BadgeHelp from '@/components/info/BadgeHelp';
import MiniSelectorOSS from '@/components/select/MiniSelectorOSS';
import MiniButton from '@/components/ui/MiniButton';
import { HelpTopic } from '@/models/miscellaneous';
import { PARAMETER } from '@/utils/constants';

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

function ToolbarTermGraph({
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

  return (
    <div className='cc-icons'>
      {controller.schema && controller.schema?.oss.length > 0 ? (
        <MiniSelectorOSS
          items={controller.schema.oss}
          onSelect={(event, value) => controller.viewOSS(value.id, event.ctrlKey || event.metaKey)}
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
          disabled={controller.isProcessing}
          onClick={onCreate}
        />
      ) : null}
      {controller.isContentEditable ? (
        <MiniButton
          title='Удалить выбранные'
          icon={<IconDestroy size='1.25rem' className='icon-red' />}
          disabled={!controller.canDeleteSelected || controller.isProcessing}
          onClick={onDelete}
        />
      ) : null}
      <MiniButton
        icon={<IconTypeGraph size='1.25rem' className='icon-primary' />}
        title='Граф ступеней'
        onClick={() => controller.showTypeGraph()}
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

export default ToolbarTermGraph;
