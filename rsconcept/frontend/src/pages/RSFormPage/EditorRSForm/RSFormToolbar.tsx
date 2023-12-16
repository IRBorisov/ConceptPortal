'use client';

import { useMemo } from 'react';
import { BiDownload, BiTrash } from 'react-icons/bi';
import { FiSave } from 'react-icons/fi';
import { LuCrown } from 'react-icons/lu';

import MiniButton from '@/components/Common/MiniButton';
import Overlay from '@/components/Common/Overlay';
import HelpButton from '@/components/Help/HelpButton';
import { NotSubscribedIcon, ShareIcon, SubscribedIcon } from '@/components/Icons';
import { HelpTopic } from '@/models/miscelanious';

interface RSFormToolbarProps {
  isMutable: boolean
  isSubscribed: boolean
  modified: boolean
  claimable: boolean
  anonymous: boolean
  processing: boolean

  onSubmit: () => void
  onShare: () => void
  onDownload: () => void
  onClaim: () => void
  onDestroy: () => void
  onToggleSubscribe: () => void
}

function RSFormToolbar({
  isMutable, modified, claimable, anonymous,
  isSubscribed, onToggleSubscribe, processing,
  onSubmit, onShare, onDownload,
  onClaim, onDestroy
}: RSFormToolbarProps) {
  const canSave = useMemo(() => (modified && isMutable), [modified, isMutable]);
  return (    
  <Overlay position='w-full top-1 flex items-start justify-center'>
    <MiniButton
      tooltip='Сохранить изменения [Ctrl + S]'
      disabled={!canSave}
      icon={<FiSave size='1.25rem' className={canSave ? 'clr-text-primary' : ''}/>}
      onClick={onSubmit}
    />
    <MiniButton
      tooltip='Поделиться схемой'
      icon={<ShareIcon size='1.25rem' className='clr-text-primary'/>}
      onClick={onShare}
    />
    <MiniButton
      tooltip='Скачать TRS файл'
      icon={<BiDownload size='1.25rem' className='clr-text-primary'/>}
      onClick={onDownload}
    />
    <MiniButton
      tooltip={'отслеживание: ' + (isSubscribed ? '[включено]' : '[выключено]')}
      disabled={anonymous || processing}
      icon={isSubscribed
        ? <SubscribedIcon size='1.25rem' className='clr-text-primary' />
        : <NotSubscribedIcon size='1.25rem' className='clr-text-controls' />
      }
      dimensions='h-full w-fit pr-2'
      style={{outlineColor: 'transparent'}}
      onClick={onToggleSubscribe}
      />
    <MiniButton
      tooltip={claimable ? 'Стать владельцем' : 'Невозможно стать владельцем' }
      icon={<LuCrown size='1.25rem' className={!claimable ? '' : 'clr-text-success'}/>}
      disabled={!claimable || anonymous || processing}
      onClick={onClaim}
    />
    <MiniButton
      tooltip='Удалить схему'
      disabled={!isMutable}
      onClick={onDestroy}
      icon={<BiTrash size='1.25rem' className={isMutable ? 'clr-text-warning' : ''} />}
    />
    <HelpButton topic={HelpTopic.RSFORM} offset={4} />
  </Overlay>);
}

export default RSFormToolbar;