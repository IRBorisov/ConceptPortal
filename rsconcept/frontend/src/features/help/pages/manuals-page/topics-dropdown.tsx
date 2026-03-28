'use client';

import { useState } from 'react';
import clsx from 'clsx';

import { Button } from '@/components/control';
import { useDropdown } from '@/components/dropdown';
import { IconMenuFold, IconMenuUnfold } from '@/components/icons';
import { SearchBar, SelectTree } from '@/components/input';
import { useAppLayoutStore, useFitHeight } from '@/stores/app-layout';
import { prefixes } from '@/utils/constants';

import { describeHelpTopic, labelHelpTopic } from '../../labels';
import { HelpTopic, topicParent } from '../../models/help-topic';

import { TopicSearchResults } from './topic-search-results';

interface TopicsDropdownProps {
  activeTopic: HelpTopic;
  onChangeTopic: (newTopic: HelpTopic) => void;
}

export function TopicsDropdown({ activeTopic, onChangeTopic }: TopicsDropdownProps) {
  const { elementRef, isOpen, toggle, handleBlur, hide } = useDropdown();
  const noNavigation = useAppLayoutStore(state => state.noNavigation);
  const treeHeight = useFitHeight('4rem + 2px');
  const [query, setQuery] = useState('');

  function handleSelectTopic(topic: HelpTopic) {
    setQuery('');
    hide();
    onChangeTopic(topic);
  }

  return (
    <div
      ref={elementRef}
      onBlur={handleBlur}
      className={clsx(
        'absolute left-0 w-54', //
        noNavigation ? 'top-0' : 'top-12',
        'flex flex-col',
        'z-topmost',
        'text-xs sm:text-sm',
        'select-none'
      )}
    >
      <Button
        noOutline
        title='Список тем'
        hideTitle={isOpen}
        icon={!isOpen ? <IconMenuUnfold size='1.25rem' /> : <IconMenuFold size='1.25rem' />}
        className={clsx('w-12 h-7 rounded-none border-l-0', isOpen && 'border-b-0')}
        onClick={toggle}
      />
      <div
        className={clsx(
          'cc-topic-dropdown border-r border-t rounded-none bg-secondary overflow-hidden',
          isOpen && 'open',
          'flex flex-col'
        )}
        style={{ maxHeight: treeHeight }}
      >
        <SearchBar
          id='help_topics_search_mobile'
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
            className='cc-scroll-y flex-1'
          />
        )}
      </div>
    </div>
  );
}
