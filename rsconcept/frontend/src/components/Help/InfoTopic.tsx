import { HelpTopic } from '../../models/miscelanious';
import HelpAPI from './HelpAPI';
import HelpConstituenta from './HelpConstituenta';
import HelpExteor from './HelpExteor';
import HelpLibrary from './HelpLibrary';
import HelpMain from './HelpMain';
import HelpRSFormItems from './HelpRSFormItems';
import HelpRSFormMeta from './HelpRSFormMeta';
import HelpRSLang from './HelpRSLang';
import HelpRSTemplates from './HelpRSTemplates';
import HelpTermGraph from './HelpTermGraph';
import HelpTerminologyControl from './HelpTerminologyControl';

interface InfoTopicProps {
  topic: HelpTopic
}

function InfoTopic({ topic }: InfoTopicProps) {
  if (topic === HelpTopic.MAIN) return <HelpMain />;
  if (topic === HelpTopic.LIBRARY) return <HelpLibrary />;
  if (topic === HelpTopic.RSFORM) return <HelpRSFormMeta />;
  if (topic === HelpTopic.CSTLIST) return <HelpRSFormItems />;
  if (topic === HelpTopic.CONSTITUENTA) return <HelpConstituenta />;
  if (topic === HelpTopic.GRAPH_TERM) return <HelpTermGraph />;
  if (topic === HelpTopic.RSTEMPLATES) return <HelpRSTemplates />;
  if (topic === HelpTopic.RSLANG) return <HelpRSLang />;
  if (topic === HelpTopic.TERM_CONTROL) return <HelpTerminologyControl />;
  if (topic === HelpTopic.EXTEOR) return <HelpExteor />;
  if (topic === HelpTopic.API) return <HelpAPI />;
  return null;
}

export default InfoTopic;
