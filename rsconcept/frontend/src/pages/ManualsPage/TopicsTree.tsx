'use client';

import clsx from 'clsx';
import { AnimatePresence } from 'framer-motion';

import { HelpTopic } from '@/models/miscellaneous';
import { prefixes } from '@/utils/constants';
import { describeHelpTopic, labelHelpTopic } from '@/utils/labels';

interface TopicsTreeProps {
  activeTopic: HelpTopic;
  onChangeTopic: (newTopic: HelpTopic) => void;
}

function TopicsTree({ activeTopic, onChangeTopic }: TopicsTreeProps) {
  return (
    <AnimatePresence initial={false}>
      {Object.values(HelpTopic).map((topic, index) => (
        <div
          key={`${prefixes.topic_list}${index}`}
          className={clsx(
            'px-3 py-1 cc-scroll-row',
            'clr-controls clr-hover',
            'cursor-pointer',
            activeTopic === topic && 'clr-selected'
          )}
          title={describeHelpTopic(topic)}
          onClick={() => onChangeTopic(topic)}
        >
          {labelHelpTopic(topic)}
        </div>
      ))}
    </AnimatePresence>
  );
}

export default TopicsTree;
