import clsx from 'clsx';

import SelectTree from '@/components/ui/SelectTree';
import { useConceptOptions } from '@/context/OptionsContext';
import { HelpTopic, topicParent } from '@/models/miscellaneous';
import { prefixes } from '@/utils/constants';
import { describeHelpTopic, labelHelpTopic } from '@/utils/labels';

interface TopicsStaticProps {
  activeTopic: HelpTopic;
  onChangeTopic: (newTopic: HelpTopic) => void;
}

function TopicsStatic({ activeTopic, onChangeTopic }: TopicsStaticProps) {
  const { calculateHeight } = useConceptOptions();
  return (
    <SelectTree
      items={Object.values(HelpTopic).map(item => item as HelpTopic)}
      value={activeTopic}
      setValue={onChangeTopic}
      prefix={prefixes.topic_list}
      getParent={item => topicParent.get(item) ?? item}
      getLabel={labelHelpTopic}
      getDescription={describeHelpTopic}
      className={clsx(
        'sticky top-0 left-0',
        'w-[14.5rem] cc-scroll-y',
        'self-start',
        'border divide-y rounded-none',
        'clr-controls',
        'text-xs sm:text-sm',
        'select-none'
      )}
      style={{ maxHeight: calculateHeight('2.25rem + 2px') }}
    />
  );
}

export default TopicsStatic;
