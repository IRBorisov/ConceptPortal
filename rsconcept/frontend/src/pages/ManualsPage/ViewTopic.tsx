import AnimateFade from '@/components/wrap/AnimateFade';
import { HelpTopic } from '@/models/miscellaneous';
import TopicPage from '@/pages/ManualsPage/TopicPage';

interface ViewTopicProps {
  topic: HelpTopic;
}

function ViewTopic({ topic }: ViewTopicProps) {
  return (
    <AnimateFade key={topic} className='px-3 py-2 mx-auto'>
      <TopicPage topic={topic} />
    </AnimateFade>
  );
}

export default ViewTopic;
