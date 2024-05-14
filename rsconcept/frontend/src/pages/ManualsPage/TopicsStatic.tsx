import clsx from 'clsx';

import { useConceptOptions } from '@/context/OptionsContext';
import { HelpTopic } from '@/models/miscellaneous';

import TopicsTree from './TopicsTree';

interface TopicsStaticProps {
  activeTopic: HelpTopic;
  topicFolded: Map<HelpTopic, boolean>;
  onChangeTopic: (newTopic: HelpTopic) => void;
  onFoldTopic: (target: HelpTopic, showChildren: boolean) => void;
}

function TopicsStatic({ activeTopic, topicFolded, onChangeTopic, onFoldTopic }: TopicsStaticProps) {
  const { calculateHeight } = useConceptOptions();
  return (
    <div
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
    >
      <TopicsTree
        activeTopic={activeTopic}
        onChangeTopic={onChangeTopic}
        topicFolded={topicFolded}
        onFoldTopic={onFoldTopic}
      />
    </div>
  );
}

export default TopicsStatic;
