import HelpAPI from '../../components/Help/HelpAPI';
import HelpConstituenta from '../../components/Help/HelpConstituenta';
import HelpExteor from '../../components/Help/HelpExteor';
import HelpLibrary from '../../components/Help/HelpLibrary';
import HelpMain from '../../components/Help/HelpMain';
import HelpRSFormItems from '../../components/Help/HelpRSFormItems';
import HelpRSFormMeta from '../../components/Help/HelpRSFormMeta';
import HelpRSLang from '../../components/Help/HelpRSLang';
import HelpTermGraph from '../../components/Help/HelpTermGraph';
import HelpTerminologyControl from '../../components/Help/HelpTerminologyControl';
import { HelpTopic } from '../../models/miscelanious';

interface ViewTopicProps {
  topic: HelpTopic
}

function ViewTopic({ topic }: ViewTopicProps) {
  return (
    <div className='w-full px-2 py-2'>
      {topic === HelpTopic.MAIN && <HelpMain />}
      {topic === HelpTopic.LIBRARY && <HelpLibrary />}
      {topic === HelpTopic.RSFORM && <HelpRSFormMeta />}
      {topic === HelpTopic.CSTLIST && <HelpRSFormItems />}
      {topic === HelpTopic.CONSTITUENTA && <HelpConstituenta />}
      {topic === HelpTopic.GRAPH_TERM && <HelpTermGraph />}
      {topic === HelpTopic.RSLANG && <HelpRSLang />}
      {topic === HelpTopic.TERM_CONTROL && <HelpTerminologyControl />}
      {topic === HelpTopic.EXTEOR && <HelpExteor />}
      {topic === HelpTopic.API && <HelpAPI />}
    </div>
  );
}

export default ViewTopic;
