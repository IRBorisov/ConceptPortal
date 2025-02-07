import clsx from 'clsx';

import { SelectTree } from '@/components/ui/Input';
import { HelpTopic, topicParent } from '@/models/miscellaneous';
import { useFitHeight } from '@/stores/appLayout';
import { prefixes } from '@/utils/constants';
import { describeHelpTopic, labelHelpTopic } from '@/utils/labels';

interface TopicsStaticProps {
  activeTopic: HelpTopic;
  onChangeTopic: (newTopic: HelpTopic) => void;
}

function TopicsStatic({ activeTopic, onChangeTopic }: TopicsStaticProps) {
  const topicsHeight = useFitHeight('1rem + 2px');
  return (
    <SelectTree
      items={Object.values(HelpTopic).map(item => item as HelpTopic)}
      value={activeTopic}
      onChange={onChangeTopic}
      prefix={prefixes.topic_list}
      getParent={item => topicParent.get(item) ?? item}
      getLabel={labelHelpTopic}
      getDescription={describeHelpTopic}
      className={clsx(
        'sticky top-0 left-0',
        'min-w-[14.5rem] max-w-[14.5rem] sm:min-w-[12.5rem] sm:max-w-[12.5rem] md:min-w-[14.5rem] md:max-w-[14.5rem]',
        'cc-scroll-y',
        'self-start',
        'border-x border-t rounded-none',
        'text-xs sm:text-sm bg-prim-200',
        'select-none'
      )}
      style={{ maxHeight: topicsHeight }}
    />
  );
}

export default TopicsStatic;
