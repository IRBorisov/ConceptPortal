'use client';

import { useState } from 'react';
import clsx from 'clsx';

import { SearchBar, SelectTree } from '@/components/input';
import { useFitHeight } from '@/stores/app-layout';
import { prefixes } from '@/utils/constants';

import { describeHelpTopic, labelHelpTopic } from '../../labels';
import { HelpTopic, topicParent } from '../../models/help-topic';

import { TopicSearchResults } from './topic-search-results';

interface TopicsStaticProps {
  activeTopic: HelpTopic;
  onChangeTopic: (newTopic: HelpTopic) => void;
}

export function TopicsStatic({ activeTopic, onChangeTopic }: TopicsStaticProps) {
  const topicsHeight = useFitHeight('1rem + 2px');

  const [query, setQuery] = useState('');

  function handleSelectTopic(newTopic: HelpTopic) {
    setQuery('');
    onChangeTopic(newTopic);
  }

  return (
    <div
      className={clsx(
        'sticky top-0 left-0',
        'flex flex-col',
        'min-w-60 max-w-60',
        'self-start',
        'border-x border-t rounded-none',
        'bg-secondary',
        'select-none'
      )}
      style={{ maxHeight: topicsHeight }}
    >
      <SearchBar
        id='help_topics_search'
        query={query}
        onChangeQuery={setQuery}
        noBorder
        className='border-b px-1'
      />
      {query.trim() ? (
        <TopicSearchResults
          activeTopic={activeTopic}
          query={query}
          onSelectTopic={handleSelectTopic}
          className='flex-1'
        />
      ) : (
        <SelectTree
          items={Object.values(HelpTopic).map(item => item as HelpTopic)}
          value={activeTopic}
          onChange={handleSelectTopic}
          prefix={prefixes.topic_list}
          getParent={item => topicParent.get(item) ?? item}
          getLabel={labelHelpTopic}
          getDescription={describeHelpTopic}
          className='cc-scroll-y flex-1 text-xs sm:text-sm'
        />
      )}
    </div>
  );
}
