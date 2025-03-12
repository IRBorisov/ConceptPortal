'use client';

import { useWindowSize } from '@/hooks/use-window-size';

import { type HelpTopic } from '../../models/help-topic';

import { TopicsDropdown } from './topics-dropdown';
import { TopicsStatic } from './topics-static';

interface TopicsListProps {
  activeTopic: HelpTopic;
  onChangeTopic: (newTopic: HelpTopic) => void;
}

export function TopicsList({ activeTopic, onChangeTopic }: TopicsListProps) {
  const size = useWindowSize();

  if (!size.isSmall) {
    return <TopicsStatic activeTopic={activeTopic} onChangeTopic={onChangeTopic} />;
  } else {
    return <TopicsDropdown activeTopic={activeTopic} onChangeTopic={onChangeTopic} />;
  }
}
