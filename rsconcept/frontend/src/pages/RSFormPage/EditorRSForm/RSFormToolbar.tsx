import { useMemo } from 'react'

import ConceptTooltip from '../../../components/Common/ConceptTooltip'
import MiniButton from '../../../components/Common/MiniButton'
import HelpRSFormMeta from '../../../components/Help/HelpRSFormMeta'
import { DownloadIcon, DumpBinIcon, HelpIcon, OwnerIcon, SaveIcon, ShareIcon } from '../../../components/Icons'

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
  <div className='relative flex items-start justify-center w-full'>
  <div className='absolute flex mt-1'>
    <MiniButton
      tooltip='Сохранить изменения'
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
    <div id='rsform-help' className='py-1 ml-1'>
      <HelpIcon color='text-primary' size={5} />
    </div>
    <ConceptTooltip anchorSelect='#rsform-help'>
      <HelpRSFormMeta />
    </ConceptTooltip>
  </div>
  </div>);
}

export default RSFormToolbar;