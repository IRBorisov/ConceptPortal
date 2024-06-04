'use client';

import { useMemo } from 'react';

import { SubscribeIcon } from '@/components/DomainIcons';
import { IconDestroy, IconSave, IconShare } from '@/components/Icons';
import BadgeHelp from '@/components/info/BadgeHelp';
import MiniButton from '@/components/ui/MiniButton';
import Overlay from '@/components/ui/Overlay';
import { useAccessMode } from '@/context/AccessModeContext';
import { HelpTopic } from '@/models/miscellaneous';
import { UserLevel } from '@/models/user';
import { prepareTooltip } from '@/utils/labels';

import { useOssEdit } from '../OssEditContext';

interface RSFormToolbarProps {
  modified: boolean;
  subscribed: boolean;
  anonymous: boolean;
  onSubmit: () => void;
  onDestroy: () => void;
}

function RSFormToolbar({ modified, anonymous, subscribed, onSubmit, onDestroy }: RSFormToolbarProps) {
  const controller = useOssEdit();
  const { accessLevel } = useAccessMode();
  const canSave = useMemo(() => modified && !controller.isProcessing, [modified, controller.isProcessing]);
  return (
    <Overlay position='top-1 right-1/2 translate-x-1/2' className='cc-icons'>
      {controller.isMutable || modified ? (
        <MiniButton
          titleHtml={prepareTooltip('Сохранить изменения', 'Ctrl + S')}
          disabled={!canSave}
          icon={<IconSave size='1.25rem' className='icon-primary' />}
          onClick={onSubmit}
        />
      ) : null}
      <MiniButton
        title='Поделиться схемой'
        icon={<IconShare size='1.25rem' className='icon-primary' />}
        onClick={controller.share}
      />
      {!anonymous ? (
        <MiniButton
          titleHtml={`Отслеживание <b>${subscribed ? 'включено' : 'выключено'}</b>`}
          icon={<SubscribeIcon value={subscribed} className={subscribed ? 'icon-primary' : 'clr-text-controls'} />}
          disabled={controller.isProcessing}
          onClick={controller.toggleSubscribe}
        />
      ) : null}
      {controller.isMutable ? (
        <MiniButton
          title='Удалить схему'
          icon={<IconDestroy size='1.25rem' className='icon-red' />}
          disabled={!controller.isMutable || controller.isProcessing || accessLevel < UserLevel.OWNER}
          onClick={onDestroy}
        />
      ) : null}
      <BadgeHelp topic={HelpTopic.UI_RS_CARD} offset={4} className='max-w-[30rem]' />
    </Overlay>
  );
}

export default RSFormToolbar;
