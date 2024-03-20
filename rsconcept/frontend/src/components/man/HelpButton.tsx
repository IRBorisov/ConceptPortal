import { BiInfoCircle } from 'react-icons/bi';

import TextURL from '@/components/ui/TextURL';
import Tooltip, { PlacesType } from '@/components/ui/Tooltip';
import { HelpTopic } from '@/models/miscellaneous';

import InfoTopic from '../info/InfoTopic';
import { CProps } from '../props';

interface HelpButtonProps extends CProps.Styling {
  topic: HelpTopic;
  offset?: number;
  place?: PlacesType;
}

function HelpButton({ topic, ...restProps }: HelpButtonProps) {
  return (
    <div id={`help-${topic}`} className='p-1'>
      <BiInfoCircle size='1.25rem' className='icon-primary' />
      <Tooltip clickable anchorSelect={`#help-${topic}`} layer='z-modal-tooltip' {...restProps}>
        <div className='relative' onClick={event => event.stopPropagation()}>
          <div className='absolute right-0 text-sm top-[0.4rem] clr-input'>
            <TextURL text='Справка...' href={`/manuals?topic=${topic}`} />
          </div>
        </div>
        <InfoTopic topic={topic} />
      </Tooltip>
    </div>
  );
}

export default HelpButton;
