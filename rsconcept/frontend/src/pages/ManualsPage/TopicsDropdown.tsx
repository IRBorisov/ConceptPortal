'use client';

import clsx from 'clsx';
import { useCallback } from 'react';

import { IconMenuFold, IconMenuUnfold } from '@/components/Icons';
import Button from '@/components/ui/Button';
import SelectTree from '@/components/ui/SelectTree';
import { useConceptOptions } from '@/context/ConceptOptionsContext';
import useDropdown from '@/hooks/useDropdown';
import { HelpTopic, topicParent } from '@/models/miscellaneous';
import { PARAMETER, prefixes } from '@/utils/constants';
import { describeHelpTopic, labelHelpTopic } from '@/utils/labels';

interface TopicsDropdownProps {
  activeTopic: HelpTopic;
  onChangeTopic: (newTopic: HelpTopic) => void;
}

function TopicsDropdown({ activeTopic, onChangeTopic }: TopicsDropdownProps) {
  const menu = useDropdown();
  const { noNavigation, calculateHeight } = useConceptOptions();

  const handleSelectTopic = useCallback(
    (topic: HelpTopic) => {
      menu.hide();
      onChangeTopic(topic);
    },
    [onChangeTopic, menu]
  );

  return (
    <div
      ref={menu.ref}
      className={clsx(
        'absolute left-0 w-[13.5rem]', // prettier: split-lines
        'flex flex-col',
        'z-modalTooltip',
        'text-xs sm:text-sm',
        'select-none',
        {
          'top-0': noNavigation,
          'top-[3rem]': !noNavigation
        }
      )}
    >
      <Button
        noOutline
        tabIndex={-1}
        title='Список тем'
        hideTitle={menu.isOpen}
        icon={!menu.isOpen ? <IconMenuUnfold size='1.25rem' /> : <IconMenuFold size='1.25rem' />}
        className={clsx('w-[3rem] h-7 rounded-none border-l-0', menu.isOpen && 'border-b-0')}
        onClick={menu.toggle}
      />
      <SelectTree
        items={Object.values(HelpTopic).map(item => item as HelpTopic)}
        value={activeTopic}
        onChangeValue={handleSelectTopic}
        prefix={prefixes.topic_list}
        getParent={item => topicParent.get(item) ?? item}
        getLabel={labelHelpTopic}
        getDescription={describeHelpTopic}
        className={clsx(
          'border-r border-t rounded-none', // prettier: split-lines
          'cc-scroll-y',
          'clr-controls'
        )}
        style={{
          maxHeight: calculateHeight('4rem + 2px'),
          transitionProperty: 'clip-path',
          transitionDuration: `${PARAMETER.moveDuration}ms`,
          clipPath: menu.isOpen ? 'inset(0% 0% 0% 0%)' : 'inset(0% 100% 0% 0%)'
        }}
      />
    </div>
  );
}

export default TopicsDropdown;
