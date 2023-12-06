import { useMemo } from 'react';

import MiniButton from '../../../components/Common/MiniButton';
import Overlay from '../../../components/Common/Overlay';
import HelpButton from '../../../components/Help/HelpButton';
import { DownloadIcon, DumpBinIcon, OwnerIcon, SaveIcon, ShareIcon } from '../../../components/Icons';
import { HelpTopic } from '../../../models/miscelanious';

interface RSFormToolbarProps {
  isMutable: boolean
  modified: boolean
  claimable: boolean
  anonymous: boolean

  onSubmit: () => void
  onShare: () => void
  onDownload: () => void
  onClaim: () => void
  onDestroy: () => void
}

function RSFormToolbar({
  isMutable, modified, claimable, anonymous,
  onSubmit, onShare, onDownload,
  onClaim, onDestroy
}: RSFormToolbarProps) {
  const canSave = useMemo(() => (modified && isMutable), [modified, isMutable]);
  return (    
  <Overlay position='w-full top-1 flex items-start justify-center'>
    <MiniButton
      tooltip='Сохранить изменения [Ctrl + S]'
      disabled={!canSave}
      icon={<SaveIcon size={5} color={canSave ? 'text-primary' : ''}/>}
      onClick={onSubmit}
    />
    <MiniButton
      tooltip='Поделиться схемой'
      icon={<ShareIcon size={5} color='text-primary'/>}
      onClick={onShare}
    />
    <MiniButton
      tooltip='Скачать TRS файл'
      icon={<DownloadIcon size={5} color='text-primary'/>}
      onClick={onDownload}
    />
    <MiniButton
      tooltip={claimable ? 'Стать владельцем' : 'Невозможно стать владельцем' }
      icon={<OwnerIcon size={5} color={!claimable ? '' : 'text-success'}/>}
      disabled={!claimable || anonymous}
      onClick={onClaim}
    />
    <MiniButton
      tooltip='Удалить схему'
      disabled={!isMutable}
      onClick={onDestroy}
      icon={<DumpBinIcon size={5} color={isMutable ? 'text-warning' : ''} />}
    />
    <HelpButton topic={HelpTopic.RSFORM} offset={4} />
  </Overlay>);
}

export default RSFormToolbar;