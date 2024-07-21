import clsx from 'clsx';

import { IconNewItem } from '@/components/Icons';
import BadgeHelp from '@/components/info/BadgeHelp';
import MiniButton from '@/components/ui/MiniButton';
import { HelpTopic } from '@/models/miscellaneous';
import { PARAMETER } from '@/utils/constants';

import { useOssEdit } from '../OssEditContext';

interface ToolbarOssGraphProps {
  onCreate: () => void;
}

function ToolbarOssGraph({ onCreate }: ToolbarOssGraphProps) {
  const controller = useOssEdit();

  return (
    <div className='cc-icons'>
      {controller.isMutable ? (
        <MiniButton
          title='Новая операция'
          icon={<IconNewItem size='1.25rem' className='icon-green' />}
          disabled={controller.isProcessing}
          onClick={onCreate}
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
