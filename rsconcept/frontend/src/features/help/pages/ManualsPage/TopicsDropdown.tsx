'use client';

import clsx from 'clsx';

import { Button } from '@/components/Control';
import { useDropdown } from '@/components/Dropdown';
import { IconMenuFold, IconMenuUnfold } from '@/components/Icons';
import { SelectTree } from '@/components/Input';
import { useAppLayoutStore, useFitHeight } from '@/stores/appLayout';
import { PARAMETER, prefixes } from '@/utils/constants';

import { describeHelpTopic, labelHelpTopic } from '../../labels';
import { HelpTopic, topicParent } from '../../models/helpTopic';

interface TopicsDropdownProps {
  activeTopic: HelpTopic;
  onChangeTopic: (newTopic: HelpTopic) => void;
}

export function TopicsDropdown({ activeTopic, onChangeTopic }: TopicsDropdownProps) {
  const menu = useDropdown();
  const noNavigation = useAppLayoutStore(state => state.noNavigation);
  const treeHeight = useFitHeight('4rem + 2px');

  function handleSelectTopic(topic: HelpTopic) {
    menu.hide();
    onChangeTopic(topic);
  }

  return (
    <div
      ref={menu.ref}
      className={clsx(
        'absolute left-0 w-54', //
        'flex flex-col',
        'z-topmost',
        'text-xs sm:text-sm',
        'select-none',
        {
          'top-0': noNavigation,
          'top-12': !noNavigation
        }
      )}
    >
      <Button
        noOutline
        tabIndex={-1}
        title='Список тем'
        hideTitle={menu.isOpen}
        icon={!menu.isOpen ? <IconMenuUnfold size='1.25rem' /> : <IconMenuFold size='1.25rem' />}
        className={clsx('w-12 h-7 rounded-none border-l-0', menu.isOpen && 'border-b-0')}
        onClick={menu.toggle}
      />
      <SelectTree
        items={Object.values(HelpTopic).map(item => item as HelpTopic)}
        value={activeTopic}
        onChange={handleSelectTopic}
        prefix={prefixes.topic_list}
        getParent={item => topicParent.get(item) ?? item}
        getLabel={labelHelpTopic}
        getDescription={describeHelpTopic}
        className='border-r border-t rounded-none cc-scroll-y bg-prim-200'
        style={{
          maxHeight: treeHeight,
          willChange: 'clip-path',
          transitionProperty: 'clip-path',
          transitionDuration: `${PARAMETER.moveDuration}ms`,
          clipPath: menu.isOpen ? 'inset(0% 0% 0% 0%)' : 'inset(0% 100% 0% 0%)'
        }}
      />
    </div>
  );
}
