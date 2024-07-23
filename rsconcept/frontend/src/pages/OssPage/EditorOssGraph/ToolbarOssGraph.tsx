import clsx from 'clsx';

import { IconDestroy, IconFitImage, IconNewItem, IconReset, IconSave } from '@/components/Icons';
import BadgeHelp from '@/components/info/BadgeHelp';
import MiniButton from '@/components/ui/MiniButton';
import { HelpTopic } from '@/models/miscellaneous';
import { PARAMETER } from '@/utils/constants';
import { prepareTooltip } from '@/utils/labels';

import { useOssEdit } from '../OssEditContext';

interface ToolbarOssGraphProps {
  isModified: boolean;
  onCreate: () => void;
  onDelete: () => void;
  onFitView: () => void;
  onSavePositions: () => void;
  onResetPositions: () => void;
}

function ToolbarOssGraph({
  isModified,
  onCreate,
  onDelete,
  onFitView,
  onSavePositions,
  onResetPositions
}: ToolbarOssGraphProps) {
  const controller = useOssEdit();

  return (
    <div className='cc-icons'>
      {controller.isMutable ? (
        <MiniButton
          titleHtml={prepareTooltip('Сохранить изменения', 'Ctrl + S')}
          icon={<IconSave size='1.25rem' className='icon-primary' />}
          disabled={controller.isProcessing || !isModified}
          onClick={onSavePositions}
        />
      ) : null}
      {controller.isMutable ? (
        <MiniButton
          title='Сбросить изменения'
          icon={<IconReset size='1.25rem' className='icon-primary' />}
          disabled={!isModified}
          onClick={onResetPositions}
        />
      ) : null}
      <MiniButton
        icon={<IconFitImage size='1.25rem' className='icon-primary' />}
        title='Сбросить вид'
        onClick={onFitView}
      />
      {controller.isMutable ? (
        <MiniButton
          title='Новая операция'
          icon={<IconNewItem size='1.25rem' className='icon-green' />}
          disabled={controller.isProcessing}
          onClick={onCreate}
        />
      ) : null}
      {controller.isMutable ? (
        <MiniButton
          title='Удалить выбранную'
          icon={<IconDestroy size='1.25rem' className='icon-red' />}
          disabled={controller.selected.length !== 1 || controller.isProcessing}
          onClick={onDelete}
        />
      ) : null}
      <BadgeHelp
        topic={HelpTopic.UI_OSS_GRAPH}
        className={clsx(PARAMETER.TOOLTIP_WIDTH, 'sm:max-w-[40rem]')}
        offset={4}
      />
    </div>
  );
}

export default ToolbarOssGraph;
