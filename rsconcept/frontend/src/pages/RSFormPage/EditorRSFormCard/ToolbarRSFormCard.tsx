'use client';

import { useMemo } from 'react';

import { SubscribeIcon } from '@/components/DomainIcons';
import { IconDestroy, IconSave, IconShare } from '@/components/Icons';
import BadgeHelp from '@/components/info/BadgeHelp';
import MiniButton from '@/components/ui/MiniButton';
import Overlay from '@/components/ui/Overlay';
import { useAccessMode } from '@/context/AccessModeContext';
import { AccessPolicy } from '@/models/library';
import { HelpTopic } from '@/models/miscellaneous';
import { UserLevel } from '@/models/user';
import { PARAMETER } from '@/utils/constants';
import { prepareTooltip, tooltips } from '@/utils/labels';

import { useRSEdit } from '../RSEditContext';

interface ToolbarRSFormCardProps {
  modified: boolean;
  subscribed: boolean;
  anonymous: boolean;
  onSubmit: () => void;
  onDestroy: () => void;
}

function ToolbarRSFormCard({ modified, anonymous, subscribed, onSubmit, onDestroy }: ToolbarRSFormCardProps) {
  const controller = useRSEdit();
  const { accessLevel } = useAccessMode();
  const canSave = useMemo(() => modified && !controller.isProcessing, [modified, controller.isProcessing]);
  return (
    <Overlay position='top-1 right-1/2 translate-x-1/2' className='cc-icons'>
      {controller.isContentEditable || modified ? (
        <MiniButton
          titleHtml={prepareTooltip('Сохранить изменения', 'Ctrl + S')}
          disabled={!canSave}
          icon={<IconSave size='1.25rem' className='icon-primary' />}
          onClick={onSubmit}
        />
      ) : null}
      <MiniButton
        titleHtml={tooltips.shareItem(controller.schema?.access_policy)}
        icon={<IconShare size='1.25rem' className='icon-primary' />}
        onClick={controller.share}
        disabled={controller.schema?.access_policy !== AccessPolicy.PUBLIC}
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
          disabled={!controller.isContentEditable || controller.isProcessing || accessLevel < UserLevel.OWNER}
          onClick={onDestroy}
        />
      ) : null}
      <BadgeHelp topic={HelpTopic.UI_RS_CARD} offset={4} className={PARAMETER.TOOLTIP_WIDTH} />
    </Overlay>
  );
}

export default ToolbarRSFormCard;
