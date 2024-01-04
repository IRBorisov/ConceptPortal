import { BiInfoCircle } from 'react-icons/bi';

import TextURL from '@/components/ui/TextURL';
import Tooltip from '@/components/ui/Tooltip';
import { HelpTopic } from '@/models/miscellaneous';

import { CProps } from '../props';
import InfoTopic from './InfoTopic';

interface HelpButtonProps extends CProps.Styling {
  topic: HelpTopic;
  offset?: number;
}

function HelpButton({ topic, ...restProps }: HelpButtonProps) {
  return (
    <div id={`help-${topic}`} className='p-1'>
      <BiInfoCircle size='1.25rem' className='clr-text-primary' />
      <Tooltip clickable anchorSelect={`#help-${topic}`} layer='z-modal-tooltip' {...restProps}>
        <div className='relative'>
          <div className='absolute right-0 text-sm top-[0.4rem]'>
            <TextURL text='Справка...' href={`/manuals?topic=${topic}`} />
          </div>
        </div>
        <InfoTopic topic={topic} />
      </Tooltip>
    </div>
  );
}

export default HelpButton;
