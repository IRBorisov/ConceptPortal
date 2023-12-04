import { HelpTopic } from '../../models/miscelanious';
import ConceptTooltip from '../Common/ConceptTooltip';
import TextURL from '../Common/TextURL';
import { HelpIcon } from '../Icons';
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
      className='px-1 py-1'
    >
      <HelpIcon color='text-primary' size={5} />
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
