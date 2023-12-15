import ConceptTooltip from '@/components/Common/ConceptTooltip';
import TextURL from '@/components/Common/TextURL';
import { HelpIcon } from '@/components/Icons';
import { HelpTopic } from '@/models/miscelanious';

import InfoTopic from './InfoTopic';

interface HelpButtonProps {
  topic: HelpTopic
  offset?: number
  dimensions?: string
}

function HelpButton({ topic, offset, dimensions }: HelpButtonProps) {
  return (
  <>
    <div
      id={`help-${topic}`}
      className='p-1'
    >
      <HelpIcon color='clr-text-primary' size={5} />
    </div>
    <ConceptTooltip clickable
      anchorSelect={`#help-${topic}`}
      layer='z-modal-tooltip'
      className={dimensions}
      offset={offset}
    >
      <div className='relative'>
      <div className='absolute right-0 text-sm top-[0.4rem]'>
        <TextURL text='Справка...' href={`/manuals?topic=${topic}`} />
      </div>
      </div>
      <InfoTopic topic={topic} />
    </ConceptTooltip>
  </>);
}

export default HelpButton;