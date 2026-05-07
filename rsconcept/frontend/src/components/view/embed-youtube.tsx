'use client';

import { useTx } from '@/i18n';

interface EmbedYoutubeProps {
  /** Video ID to embed. */
  videoID: string;

  /** Display height in pixels. */
  pxHeight: number;

  /** Display width in pixels. */
  pxWidth?: number;
}

/**
 * Embeds a YouTube video into the page using the given video ID and dimensions.
 */
export function EmbedYoutube({ videoID, pxHeight, pxWidth }: EmbedYoutubeProps) {
  const tx = useTx();
  const width = pxWidth ?? (pxHeight * 16) / 9;
  return (
    <div
      className='relative h-0'
      style={{
        paddingBottom: `${pxHeight}px`,
        paddingLeft: `${width}px`
      }}
    >
      <iframe
        allowFullScreen
        title={tx('tx.shell.embed.youtube')}
        allow='accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
        className='absolute top-0 left-0 border'
        style={{
          minHeight: `${pxHeight}px`,
          minWidth: `${width}px`
        }}
        width={`${width}px`}
        height={`${pxHeight}px`}
        src={`https://www.youtube.com/embed/${videoID}`}
      />
    </div>
  );
}
