import HelpAPI from '../../components/Help/HelpAPI';
import HelpConstituenta from '../../components/Help/HelpConstituenta';
import HelpExteor from '../../components/Help/HelpExteor';
import HelpLibrary from '../../components/Help/HelpLibrary';
import HelpMain from '../../components/Help/HelpMain';
import HelpRSFormItems from '../../components/Help/HelpRSFormItems';
import HelpRSFormMeta from '../../components/Help/HelpRSFormMeta';
import HelpRSLang from '../../components/Help/HelpRSLang';
import HelpRSTemplates from '../../components/Help/HelpRSTemplates';
import HelpTermGraph from '../../components/Help/HelpTermGraph';
import HelpTerminologyControl from '../../components/Help/HelpTerminologyControl';
import { HelpTopic } from '../../models/miscelanious';

interface ViewTopicProps {
  topic: HelpTopic
}

function ViewTopic({ topic }: ViewTopicProps) {
  return (
  <div className='w-full px-2 py-2'>
    {topic === HelpTopic.MAIN ? <HelpMain /> : null}
    {topic === HelpTopic.LIBRARY ? <HelpLibrary /> : null}
    {topic === HelpTopic.RSFORM ? <HelpRSFormMeta /> : null}
    {topic === HelpTopic.CSTLIST ? <HelpRSFormItems /> : null}
    {topic === HelpTopic.CONSTITUENTA ? <HelpConstituenta /> : null}
    {topic === HelpTopic.GRAPH_TERM ? <HelpTermGraph /> : null}
    {topic === HelpTopic.RSTEMPLATES ? <HelpRSTemplates /> : null}
    {topic === HelpTopic.RSLANG ? <HelpRSLang /> : null}
    {topic === HelpTopic.TERM_CONTROL ? <HelpTerminologyControl /> : null}
    {topic === HelpTopic.EXTEOR ? <HelpExteor /> : null}
    {topic === HelpTopic.API ? <HelpAPI /> : null}
  </div>);
}

export default ViewTopic;
