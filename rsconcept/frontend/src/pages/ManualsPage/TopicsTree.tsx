'use client';

import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useLayoutEffect, useState } from 'react';

import { IconDropArrow, IconPageRight } from '@/components/Icons';
import { CProps } from '@/components/props';
import MiniButton from '@/components/ui/MiniButton';
import Overlay from '@/components/ui/Overlay';
import { foldableTopics, HelpTopic, topicParent } from '@/models/miscellaneous';
import { animateSideAppear } from '@/styling/animations';
import { globals, prefixes } from '@/utils/constants';
import { describeHelpTopic, labelHelpTopic } from '@/utils/labels';

interface TopicsTreeProps {
  activeTopic: HelpTopic;
  onChangeTopic: (newTopic: HelpTopic) => void;
}

function TopicsTree({ activeTopic, onChangeTopic }: TopicsTreeProps) {
  const [topicFolded, setFolded] = useState<Map<HelpTopic, boolean>>(
    new Map(
      Object.values(HelpTopic).map(value => {
        const topic = value as HelpTopic;
        return [topic, true];
      })
    )
  );

  useLayoutEffect(() => {
    setFolded(
      new Map(
        Object.values(HelpTopic).map(value => {
          const topic = value as HelpTopic;
          return [
            topic,
            topicParent.get(activeTopic) !== topic && topicParent.get(topicParent.get(activeTopic)!) !== topic
          ];
        })
      )
    );
  }, [activeTopic]);

  const onFoldTopic = useCallback(
    (target: HelpTopic, showChildren: boolean) => {
      if (topicFolded.get(target) === !showChildren) {
        return;
      }
      setFolded(
        new Map(
          Object.values(HelpTopic).map(value => {
            const topic = value as HelpTopic;
            if (topic === target) {
              return [topic, !showChildren];
            }
            if (
              !showChildren &&
              (topicParent.get(topic) === target || topicParent.get(topicParent.get(topic)!) === target)
            ) {
              return [topic, true];
            }
            const oldValue = topicFolded.get(topic)!;
            return [topic, oldValue];
          })
        )
      );
    },
    [topicFolded]
  );

  const handleClickFold = useCallback(
    (event: CProps.EventMouse, topic: HelpTopic, showChildren: boolean) => {
      event.preventDefault();
      event.stopPropagation();
      onFoldTopic(topic, showChildren);
    },
    [onFoldTopic]
  );

  return (
    <AnimatePresence initial={false}>
      {Object.values(HelpTopic).map((topic, index) => {
        const parent = topicParent.get(topic);
        if (parent !== topic && topicFolded.get(topicParent.get(topic)!)) {
          return null;
        }
        const isFoldable = !!foldableTopics.find(id => id === topic);
        const isFolded = topicFolded.get(topic)!;
        return (
          <motion.div
            tabIndex={-1}
            key={`${prefixes.topic_list}${index}`}
            className={clsx(
              'pr-3 pl-6 py-1',
              'cc-scroll-row',
              'clr-controls clr-hover',
              'cursor-pointer',
              activeTopic === topic && 'clr-selected'
            )}
            data-tooltip-id={globals.tooltip}
            data-tooltip-content={describeHelpTopic(topic)}
            onClick={() => onChangeTopic(topic)}
            initial={{ ...animateSideAppear.initial }}
            animate={{ ...animateSideAppear.animate }}
            exit={{ ...animateSideAppear.exit }}
          >
            {isFoldable ? (
              <Overlay position='left-[-1.3rem]' className={clsx(!isFolded && 'top-[0.1rem]')}>
                <MiniButton
                  tabIndex={-1}
                  noPadding
                  noHover
                  icon={!isFolded ? <IconDropArrow size='1rem' /> : <IconPageRight size='1.25rem' />}
                  onClick={event => handleClickFold(event, topic, isFolded)}
                />
              </Overlay>
            ) : null}
            {topicParent.get(topic) === topic ? labelHelpTopic(topic) : `- ${labelHelpTopic(topic).toLowerCase()}`}
          </motion.div>
        );
      })}
    </AnimatePresence>
  );
}

export default TopicsTree;
