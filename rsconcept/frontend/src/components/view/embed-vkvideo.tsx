interface EmbedVKVideoProps {
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
export function EmbedVKVideo({ videoID, pxHeight, pxWidth }: EmbedVKVideoProps) {
  if (!pxWidth) {
    pxWidth = (pxHeight * 16) / 9;
  }
  return (
    <div
      className='relative h-0 mt-1'
      style={{
        paddingBottom: `${pxHeight}px`,
        paddingLeft: `${pxWidth}px`
      }}
    >
      <iframe
        allowFullScreen
        title='Встроенное видео ВКонтакте'
        allow='autoplay; encrypted-media; fullscreen; picture-in-picture; screen-wake-lock;'
        className='absolute top-0 left-0 border'
        style={{
          minHeight: `${pxHeight}px`,
          minWidth: `${pxWidth}px`
        }}
        width={`${pxWidth}px`}
        height={`${pxHeight}px`}
        src={`https://vk.com/video_ext.php?${videoID}&hd=1`}
      />
    </div>
  );
}
