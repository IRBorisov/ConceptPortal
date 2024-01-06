import AnimateFadeIn from '@/components/AnimateFadeIn';
import InfoTopic from '@/components/InfoTopic';
import { HelpTopic } from '@/models/miscellaneous';

interface ViewTopicProps {
  topic: HelpTopic;
}

function ViewTopic({ topic }: ViewTopicProps) {
  return (
    <AnimateFadeIn key={topic} className='px-2 py-2 mx-auto'>
      <InfoTopic topic={topic} />
    </AnimateFadeIn>
  );
}

export default ViewTopic;
