'use client';

import { useMemo } from 'react';
import { BiDownload, BiShareAlt, BiTrash } from 'react-icons/bi';
import { FiBell, FiBellOff, FiSave } from 'react-icons/fi';
import { LuCrown } from 'react-icons/lu';

import MiniButton from '@/components/Common/MiniButton';
import Overlay from '@/components/Common/Overlay';
import HelpButton from '@/components/Help/HelpButton';
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
  <Overlay position='top-1 right-1/2 translate-x-1/2' className='flex'>
    <MiniButton
      title='Сохранить изменения [Ctrl + S]'
      disabled={!canSave}
      icon={<FiSave size='1.25rem' className={canSave ? 'clr-text-primary' : ''}/>}
      onClick={onSubmit}
    />
    <MiniButton
      title='Поделиться схемой'
      icon={<BiShareAlt size='1.25rem' className='clr-text-primary'/>}
      onClick={onShare}
    />
    <MiniButton
      title='Скачать TRS файл'
      icon={<BiDownload size='1.25rem' className='clr-text-primary'/>}
      onClick={onDownload}
    />
    <MiniButton
      title={'отслеживание: ' + (isSubscribed ? '[включено]' : '[выключено]')}
      disabled={anonymous || processing}
      icon={isSubscribed
        ? <FiBell size='1.25rem' className='clr-text-primary' />
        : <FiBellOff size='1.25rem' className='clr-text-controls' />
      }
      style={{outlineColor: 'transparent'}}
      onClick={onToggleSubscribe}
      />
    <MiniButton
      title={claimable ? 'Стать владельцем' : 'Невозможно стать владельцем' }
      icon={<LuCrown size='1.25rem' className={!claimable || anonymous ? '' : 'clr-text-success'}/>}
      disabled={!claimable || anonymous || processing}
      onClick={onClaim}
    />
    <MiniButton
      title='Удалить схему'
      disabled={!isMutable}
      onClick={onDestroy}
      icon={<BiTrash size='1.25rem' className={isMutable ? 'clr-text-warning' : ''} />}
    />
    <HelpButton topic={HelpTopic.RSFORM} offset={4} />
  </Overlay>);
}

export default RSFormToolbar;