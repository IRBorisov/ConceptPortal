import TextURL from '@/components/ui/TextURL';
import Tooltip, { PlacesType } from '@/components/ui/Tooltip';
import { useConceptOptions } from '@/context/ConceptOptionsContext';
import { HelpTopic } from '@/models/miscellaneous';
import TopicPage from '@/pages/ManualsPage/TopicPage';

import { IconHelp } from '../Icons';
import { CProps } from '../props';

interface BadgeHelpProps extends CProps.Styling {
  /** Topic to display in a tooltip. */
  topic: HelpTopic;

  /** Offset from the cursor to the tooltip. */
  offset?: number;

  /** Classname for padding. */
  padding?: string;

  /** Place of the tooltip in relation to the cursor. */
  place?: PlacesType;
}

/**
 * Display help icon with a manual page tooltip.
 */
function BadgeHelp({ topic, padding = 'p-1', ...restProps }: BadgeHelpProps) {
  const { showHelp } = useConceptOptions();

  if (!showHelp) {
    return null;
  }
  return (
    <div tabIndex={-1} id={`help-${topic}`} className={padding}>
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
