'use client';

import { IconVideo } from '@/components/icons';
import { type Styling } from '@/components/props';
import { cn } from '@/components/utils';
import { useDialogsStore } from '@/stores/dialogs';
import { globalIDs, type IVideo } from '@/utils/constants';

interface BadgeVideoProps extends Styling {
  video: IVideo;
}

/** Displays a badge with a video icon to click and open the video. */
export function BadgeVideo({ video, className, ...restProps }: BadgeVideoProps) {
  const showVideo = useDialogsStore(state => state.showVideo);

  function handleShowExplication() {
    showVideo({ video: video });
  }

  return (
    <IconVideo
      className={cn('cursor-pointer', className)}
      onClick={handleShowExplication}
      data-tooltip-id={globalIDs.tooltip}
      data-tooltip-content='Просмотр видео'
      {...restProps}
    />
  );
}
