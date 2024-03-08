'use client';

import { useMemo } from 'react';
import { BiDownload, BiShareAlt, BiTrash } from 'react-icons/bi';
import { FiBell, FiBellOff, FiSave } from 'react-icons/fi';
import { LuCrown } from 'react-icons/lu';

import HelpButton from '@/components/Help/HelpButton';
import MiniButton from '@/components/ui/MiniButton';
import Overlay from '@/components/ui/Overlay';
import { HelpTopic } from '@/models/miscellaneous';

import { useRSEdit } from '../RSEditContext';

interface RSFormToolbarProps {
  modified: boolean;
  subscribed: boolean;
  anonymous: boolean;
  claimable: boolean;
  processing: boolean;
  onSubmit: () => void;
  onDestroy: () => void;
}

function RSFormToolbar({
  modified,
  anonymous,
  subscribed,
  claimable,
  processing,
  onSubmit,
  onDestroy
}: RSFormToolbarProps) {
  const controller = useRSEdit();
  const canSave = useMemo(() => modified && controller.isMutable, [modified, controller.isMutable]);
  return (
    <Overlay position='top-1 right-1/2 translate-x-1/2' className='flex'>
      {controller.isContentEditable ? (
        <MiniButton
          title='Сохранить изменения [Ctrl + S]'
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
          title={`Отслеживание ${subscribed ? 'включено' : 'выключено'}`}
          disabled={processing}
          icon={
            subscribed ? (
              <FiBell size='1.25rem' className='icon-primary' />
            ) : (
              <FiBellOff size='1.25rem' className='clr-text-controls' />
            )
          }
          onClick={controller.toggleSubscribe}
        />
      ) : null}
      {!anonymous && claimable ? (
        <MiniButton
          title='Стать владельцем'
          icon={<LuCrown size='1.25rem' className='icon-green' />}
          disabled={processing}
          onClick={controller.claim}
        />
      ) : null}
      {controller.isContentEditable ? (
        <MiniButton
          title='Удалить схему'
          disabled={!controller.isMutable}
          onClick={onDestroy}
          icon={<BiTrash size='1.25rem' className='icon-red' />}
        />
      ) : null}
      <HelpButton topic={HelpTopic.RSFORM} offset={4} />
    </Overlay>
  );
}

export default RSFormToolbar;
