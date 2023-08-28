interface EmbedYoutubeProps {
  videoID: string
  pxHeight: number
  pxWidth?: number
}

function EmbedYoutube({ videoID, pxHeight, pxWidth }: EmbedYoutubeProps) {
  if (!pxWidth) {
    pxWidth = pxHeight * 16 / 9;
  }
  return (
    <div 
      className='relative'
      style={{height: 0, paddingBottom: `${pxHeight}px`, paddingLeft: `${pxWidth}px`}}
    >
      <iframe
        className='absolute top-0 left-0 clr-border'
        style={{minHeight: `${pxHeight}px`, minWidth: `${pxWidth}px`}}
        width={`${pxWidth}px`}
        height={`${pxHeight}px`}
        src={`https://www.youtube.com/embed/${videoID}`}
        allow='accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
        allowFullScreen
        title='Встроенное видео Youtube'
      />
    </div>
  );
}

export default EmbedYoutube;
