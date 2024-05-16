import TopicPage from '@/pages/ManualsPage/TopicPage';
import AnimateFade from '@/components/wrap/AnimateFade';
import { HelpTopic } from '@/models/miscellaneous';

interface ViewTopicProps {
  topic: HelpTopic;
}

function ViewTopic({ topic }: ViewTopicProps) {
  return (
    <AnimateFade key={topic} className='py-2 pl-6 pr-3 mx-auto'>
      <TopicPage topic={topic} />
    </AnimateFade>
  );
}

export default ViewTopic;
