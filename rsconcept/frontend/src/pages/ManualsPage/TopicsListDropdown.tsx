'use client';

import clsx from 'clsx';
import { motion } from 'framer-motion';
import { useCallback } from 'react';
import { RiMenuFoldFill, RiMenuUnfoldFill } from 'react-icons/ri';

import Button from '@/components/ui/Button';
import { useConceptOptions } from '@/context/OptionsContext';
import useDropdown from '@/hooks/useDropdown';
import { HelpTopic } from '@/models/miscellaneous';
import { animateSlideLeft } from '@/styling/animations';
import { prefixes } from '@/utils/constants';
import { describeHelpTopic, labelHelpTopic } from '@/utils/labels';

interface TopicsListDropDownProps {
  activeTopic: HelpTopic;
  onChangeTopic: (newTopic: HelpTopic) => void;
}

function TopicsListDropDown({ activeTopic, onChangeTopic }: TopicsListDropDownProps) {
  const menu = useDropdown();
  const { noNavigation } = useConceptOptions();

  const selectTheme = useCallback(
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
        'absolute left-0', // prettier: split-lines
        'flex flex-col',
        'z-modal-tooltip',
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
        icon={!menu.isOpen ? <RiMenuUnfoldFill size='1.25rem' /> : <RiMenuFoldFill size='1.25rem' />}
        className='w-[3rem] h-7'
        onClick={menu.toggle}
      />
      <motion.div
        className='border-x'
        initial={false}
        animate={menu.isOpen ? 'open' : 'closed'}
        variants={animateSlideLeft}
      >
        {Object.values(HelpTopic).map((topic, index) => (
          <div
            key={`${prefixes.topic_list}${index}`}
            className={clsx(
              'px-3 py-1',
              'border-y',
              'clr-controls clr-hover',
              'cursor-pointer',
              activeTopic === topic && 'clr-selected'
            )}
            title={describeHelpTopic(topic)}
            onClick={() => selectTheme(topic)}
          >
            {labelHelpTopic(topic)}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export default TopicsListDropDown;
