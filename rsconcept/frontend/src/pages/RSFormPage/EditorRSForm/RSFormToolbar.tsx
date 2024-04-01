'use client';

import { useMemo } from 'react';
import { BiDownload, BiShareAlt, BiTrash } from 'react-icons/bi';
import { FiBell, FiBellOff, FiSave } from 'react-icons/fi';
import { LuCrown } from 'react-icons/lu';

import BadgeHelp from '@/components/man/BadgeHelp';
import MiniButton from '@/components/ui/MiniButton';
import Overlay from '@/components/ui/Overlay';
import { HelpTopic } from '@/models/miscellaneous';
import { prepareTooltip } from '@/utils/labels';

import { useRSEdit } from '../RSEditContext';

interface RSFormToolbarProps {
  modified: boolean;
  subscribed: boolean;
  anonymous: boolean;
  claimable: boolean;
  onSubmit: () => void;
  onDestroy: () => void;
}

function RSFormToolbar({ modified, anonymous, subscribed, claimable, onSubmit, onDestroy }: RSFormToolbarProps) {
  const controller = useRSEdit();
  const canSave = useMemo(() => modified && !controller.isProcessing, [modified, controller.isProcessing]);
  return (
    <Overlay position='top-1 right-1/2 translate-x-1/2' className='flex'>
      {controller.isContentEditable ? (
        <MiniButton
          titleHtml={prepareTooltip('Сохранить изменения', 'Ctrl + S')}
          disabled={!canSave}
          icon={<FiSave size='1.25rem' className='icon-primary' />}
          onClick={onSubmit}
        />
      ) : null}
      <MiniButton
        title='Поделиться схемой'
        icon={<BiShareAlt size='1.25rem' className='icon-primary' />}
        onClick={controller.share}
      />
      <MiniButton
        title='Скачать TRS файл'
        icon={<BiDownload size='1.25rem' className='icon-primary' />}
        onClick={controller.download}
      />
      {!anonymous ? (
        <MiniButton
          titleHtml={`Отслеживание <b>${subscribed ? 'включено' : 'выключено'}</b>`}
          icon={
            subscribed ? (
              <FiBell size='1.25rem' className='icon-primary' />
            ) : (
              <FiBellOff size='1.25rem' className='clr-text-controls' />
            )
          }
          disabled={controller.isProcessing}
          onClick={controller.toggleSubscribe}
        />
      ) : null}
      {!anonymous && claimable ? (
        <MiniButton
          title='Стать владельцем'
          icon={<LuCrown size='1.25rem' className='icon-green' />}
          disabled={controller.isProcessing}
          onClick={controller.claim}
        />
      ) : null}
      {controller.isMutable ? (
        <MiniButton
          title='Удалить схему'
          icon={<BiTrash size='1.25rem' className='icon-red' />}
          disabled={!controller.isContentEditable || controller.isProcessing}
          onClick={onDestroy}
        />
      ) : null}
      <BadgeHelp topic={HelpTopic.RSFORM} offset={4} className='max-w-[32rem]' />
    </Overlay>
  );
}

export default RSFormToolbar;
