import { HelpTopic } from '@/models/miscellaneous';

import HelpAPI from './Help/HelpAPI';
import HelpConstituenta from './Help/HelpConstituenta';
import HelpExteor from './Help/HelpExteor';
import HelpLibrary from './Help/HelpLibrary';
import HelpMain from './Help/HelpMain';
import HelpPrivacy from './Help/HelpPrivacy';
import HelpRSFormItems from './Help/HelpRSFormItems';
import HelpRSFormMeta from './Help/HelpRSFormMeta';
import HelpRSLang from './Help/HelpRSLang';
import HelpRSTemplates from './Help/HelpRSTemplates';
import HelpTermGraph from './Help/HelpTermGraph';
import HelpTerminologyControl from './Help/HelpTerminologyControl';
import HelpVersions from './Help/HelpVersions';

interface InfoTopicProps {
  topic: HelpTopic;
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
  if (topic === HelpTopic.VERSIONS) return <HelpVersions />;
  if (topic === HelpTopic.EXTEOR) return <HelpExteor />;
  if (topic === HelpTopic.API) return <HelpAPI />;
  if (topic === HelpTopic.PRIVACY) return <HelpPrivacy />;
  return null;
}

export default InfoTopic;
