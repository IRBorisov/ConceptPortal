import { EmbedVKVideo } from '@/components/view/embed-vkvideo';

interface TabVKProps {
  videoHeight: number;
  videoID: string;
}

export function TabVK({ videoHeight, videoID }: TabVKProps) {
  return <EmbedVKVideo videoID={videoID} pxHeight={videoHeight} />;
}
