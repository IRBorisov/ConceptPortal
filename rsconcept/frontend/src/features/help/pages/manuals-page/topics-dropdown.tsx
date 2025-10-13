'use client';

import clsx from 'clsx';

import { Button } from '@/components/control';
import { useDropdown } from '@/components/dropdown';
import { IconMenuFold, IconMenuUnfold } from '@/components/icons';
import { SelectTree } from '@/components/input';
import { useAppLayoutStore, useFitHeight } from '@/stores/app-layout';
import { prefixes } from '@/utils/constants';

import { describeHelpTopic, labelHelpTopic } from '../../labels';
import { HelpTopic, topicParent } from '../../models/help-topic';

interface TopicsDropdownProps {
  activeTopic: HelpTopic;
  onChangeTopic: (newTopic: HelpTopic) => void;
}

export function TopicsDropdown({ activeTopic, onChangeTopic }: TopicsDropdownProps) {
  const { elementRef, isOpen, toggle, handleBlur, hide } = useDropdown();
  const noNavigation = useAppLayoutStore(state => state.noNavigation);
  const treeHeight = useFitHeight('4rem + 2px');

  function handleSelectTopic(topic: HelpTopic) {
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
      <SelectTree
        items={Object.values(HelpTopic).map(item => item as HelpTopic)}
        value={activeTopic}
        onChange={handleSelectTopic}
        prefix={prefixes.topic_list}
        getParent={item => topicParent.get(item) ?? item}
        getLabel={labelHelpTopic}
        getDescription={describeHelpTopic}
        className={clsx('cc-topic-dropdown border-r border-t rounded-none cc-scroll-y bg-secondary', isOpen && 'open')}
        style={{ maxHeight: treeHeight }}
      />
    </div>
  );
}
