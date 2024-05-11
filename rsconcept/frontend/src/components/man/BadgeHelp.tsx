import TextURL from '@/components/ui/TextURL';
import Tooltip, { PlacesType } from '@/components/ui/Tooltip';
import { useConceptOptions } from '@/context/OptionsContext';
import { HelpTopic } from '@/models/miscellaneous';

import { IconHelp } from '../Icons';
import InfoTopic from '../info/InfoTopic';
import { CProps } from '../props';

interface BadgeHelpProps extends CProps.Styling {
  topic: HelpTopic;
  offset?: number;
  place?: PlacesType;
}

function BadgeHelp({ topic, ...restProps }: BadgeHelpProps) {
  const { showHelp } = useConceptOptions();

  if (!showHelp) {
    return null;
  }
  return (
    <div tabIndex={-1} id={`help-${topic}`} className='p-1'>
      <IconHelp size='1.25rem' className='icon-primary' />
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

export default BadgeHelp;
