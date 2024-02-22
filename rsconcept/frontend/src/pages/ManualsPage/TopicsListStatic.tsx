import clsx from 'clsx';

import { HelpTopic } from '@/models/miscellaneous';
import { prefixes } from '@/utils/constants';
import { describeHelpTopic, labelHelpTopic } from '@/utils/labels';

interface TopicsListStaticProps {
  activeTopic: HelpTopic;
  onChangeTopic: (newTopic: HelpTopic) => void;
}

function TopicsListStatic({ activeTopic, onChangeTopic }: TopicsListStaticProps) {
  return (
    <div
      className={clsx(
        'sticky top-0 left-0',
        'self-start',
        'border-x',
        'clr-controls',
        'text-xs sm:text-sm',
        'select-none'
      )}
    >
      {Object.values(HelpTopic).map((topic, index) => (
        <div
          key={`${prefixes.topic_list}${index}`}
          className={clsx(
            'px-3 py-1',
            'border-y',
            'clr-hover',
            'cursor-pointer',
            activeTopic === topic && 'clr-selected'
          )}
          title={describeHelpTopic(topic)}
          onClick={() => onChangeTopic(topic)}
        >
          {labelHelpTopic(topic)}
        </div>
      ))}
    </div>
  );
}

export default TopicsListStatic;
