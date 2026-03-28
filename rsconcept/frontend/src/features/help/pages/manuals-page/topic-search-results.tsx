'use client';

import { useDeferredValue, useMemo } from 'react';
import clsx from 'clsx';

import { type Styling } from '@/components/props';

import { labelHelpTopic } from '../../labels';
import { searchHelpTopics } from '../../models/help-search';
import { type HelpTopic } from '../../models/help-topic';

interface TopicSearchResultsProps extends Styling {
  activeTopic: HelpTopic;
  query: string;
  onSelectTopic: (topic: HelpTopic) => void;
}

export function TopicSearchResults({ activeTopic, query, onSelectTopic, className, style }: TopicSearchResultsProps) {
  const deferredQuery = useDeferredValue(query);
  const results = useMemo(
    () => searchHelpTopics(deferredQuery, activeTopic),
    [activeTopic, deferredQuery]
  );

  if (!query.trim()) {
    return null;
  }

  return (
    <div className={clsx('overflow-y-auto', className)} style={style}>
      {results.length > 0 ? (
        results.map(result => (
          <button
            key={result.topic}
            type='button'
            className={clsx(
              'w-full px-3 py-2 text-left border-b cc-hover-bg',
              'flex flex-col gap-1',
              result.topic === activeTopic && 'cc-selected'
            )}
            onClick={() => onSelectTopic(result.topic)}
          >
            <span className='truncate'>{result.title}</span>
            <span className='text-xs opacity-75'>{result.description}</span>
            {result.section !== result.topic ? (
              <span className='text-[0.7rem] uppercase tracking-wide opacity-60'>{labelHelpTopic(result.section)}</span>
            ) : null}
          </button>
        ))
      ) : (
        <div className='px-3 py-2 text-xs opacity-70'>No matching topics</div>
      )}
    </div>
  );
}
