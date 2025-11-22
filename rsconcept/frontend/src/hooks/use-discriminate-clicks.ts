import { useRef } from 'react';

import { PARAMETER } from '@/utils/constants';

export function useSingleAndDoubleClick<EventType extends React.SyntheticEvent, ArgsType extends unknown[] = []>(
  onClick: (event: EventType, ...args: ArgsType) => void,
  onDoubleClick: (event: EventType, ...args: ArgsType) => void,
  delay = PARAMETER.clickDelay
) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleClick(event: EventType, ...args: ArgsType) {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      onClick(event, ...args);
      timeoutRef.current = null;
    }, delay);
  }

  function handleDoubleClick(event: EventType, ...args: ArgsType) {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    onDoubleClick(event, ...args);
  }

  return { handleClick, handleDoubleClick };
}
