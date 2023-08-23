import HelpAPI from '../../components/Help/HelpAPI';
import HelpConstituenta from '../../components/Help/HelpConstituenta';
import HelpExteor from '../../components/Help/HelpExteor';
import HelpLibrary from '../../components/Help/HelpLibrary';
import HelpMain from '../../components/Help/HelpMain';
import HelpRSFormItems from '../../components/Help/HelpRSFormItems';
import HelpRSFormMeta from '../../components/Help/HelpRSFormMeta';
import HelpRSLang from '../../components/Help/HelpRSLang';
import HelpTermGraph from '../../components/Help/HelpTermGraph';
import { HelpTopic } from '../../utils/models';

interface ViewTopicProps {
  topic: HelpTopic
}

function ViewTopic({ topic }: ViewTopicProps) {
  return (
    <div className='px-2 py-2'>
      {topic === HelpTopic.MAIN && <HelpMain />}
      {topic === HelpTopic.RSLANG && <HelpRSLang />}
      {topic === HelpTopic.LIBRARY && <HelpLibrary />}
      {topic === HelpTopic.RSFORM && <HelpRSFormMeta />}
      {topic === HelpTopic.CSTLIST && <HelpRSFormItems />}
      {topic === HelpTopic.CONSTITUENTA && <HelpConstituenta />}
      {topic === HelpTopic.GRAPH_TERM && <HelpTermGraph />}
      {topic === HelpTopic.EXTEOR && <HelpExteor />}
      {topic === HelpTopic.API && <HelpAPI />}
    </div>
  );
}

export default ViewTopic;
