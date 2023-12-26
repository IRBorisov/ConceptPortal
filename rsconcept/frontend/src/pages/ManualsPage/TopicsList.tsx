import clsx from 'clsx';

import { HelpTopic } from '@/models/miscellaneous';
import { prefixes } from '@/utils/constants';
import { describeHelpTopic, labelHelpTopic } from '@/utils/labels';

interface TopicsListProps {
  activeTopic: HelpTopic
  onChangeTopic: (newTopic: HelpTopic) => void
}

function TopicsList({ activeTopic, onChangeTopic }: TopicsListProps) {
  return (
  <div className={clsx(
    'sticky top-0 left-0',
    'min-w-[13rem] self-start',
    'border-x',
    'clr-controls',
    'small-caps',
    'select-none'
  )}>
    <h1 className='my-1'>Справка</h1>
    {Object.values(HelpTopic).map(
    (topic, index) => 
        <div key={`${prefixes.topic_list}${index}`}
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
    )}
  </div>);
}

export default TopicsList;