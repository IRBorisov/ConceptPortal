'use client';

import clsx from 'clsx';

import { SelectTree } from '@/components/input';
import { useFitHeight } from '@/stores/app-layout';
import { prefixes } from '@/utils/constants';

import { describeHelpTopic, labelHelpTopic } from '../../labels';
import { HelpTopic, topicParent } from '../../models/help-topic';

interface TopicsStaticProps {
  activeTopic: HelpTopic;
  onChangeTopic: (newTopic: HelpTopic) => void;
}

export function TopicsStatic({ activeTopic, onChangeTopic }: TopicsStaticProps) {
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
        'min-w-58 max-w-58 sm:min-w-50 sm:max-w-50 md:min-w-58 md:max-w-58',
        'cc-scroll-y',
        'self-start',
        'border-x border-t rounded-none',
        'text-xs sm:text-sm bg-secondary',
        'select-none'
      )}
      style={{ maxHeight: topicsHeight }}
    />
  );
}
