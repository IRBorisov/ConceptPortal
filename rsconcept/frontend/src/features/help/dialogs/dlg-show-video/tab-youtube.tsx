import { EmbedYoutube } from '@/components/view';

interface TabYoutubeProps {
  videoHeight: number;
  videoID: string;
}

export function TabYoutube({ videoHeight, videoID }: TabYoutubeProps) {
  return <EmbedYoutube videoID={videoID} pxHeight={videoHeight} />;
}
