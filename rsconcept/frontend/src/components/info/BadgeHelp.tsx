import clsx from 'clsx';

import TextURL from '@/components/ui/TextURL';
import Tooltip, { PlacesType } from '@/components/ui/Tooltip';
import { useConceptOptions } from '@/context/ConceptOptionsContext';
import { HelpTopic } from '@/models/miscellaneous';

import TopicPage from '../../pages/ManualsPage/TopicPage';
import { IconHelp } from '../Icons';
import { CProps } from '../props';

interface BadgeHelpProps extends CProps.Styling {
  topic: HelpTopic;
  offset?: number;
  padding?: string;
  place?: PlacesType;
}

function BadgeHelp({ topic, padding, ...restProps }: BadgeHelpProps) {
  const { showHelp } = useConceptOptions();

  if (!showHelp) {
    return null;
  }
  return (
    <div tabIndex={-1} id={`help-${topic}`} className={clsx('p-1', padding)}>
      <IconHelp size='1.25rem' className='icon-primary' />
      <Tooltip clickable anchorSelect={`#help-${topic}`} layer='z-modalTooltip' {...restProps}>
        <div className='relative' onClick={event => event.stopPropagation()}>
          <div className='absolute right-0 text-sm top-[0.4rem] clr-input'>
            <TextURL text='Справка...' href={`/manuals?topic=${topic}`} />
          </div>
        </div>
        <TopicPage topic={topic} />
      </Tooltip>
    </div>
  );
}

export default BadgeHelp;
