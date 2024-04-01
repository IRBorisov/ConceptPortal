import { HelpTopic } from '@/models/miscellaneous';

import HelpAPI from '../man/HelpAPI';
import HelpConstituenta from '../man/HelpConstituenta';
import HelpCstAttributes from '../man/HelpCstAttributes';
import HelpExteor from '../man/HelpExteor';
import HelpLibrary from '../man/HelpLibrary';
import HelpMain from '../man/HelpMain';
import HelpPrivacy from '../man/HelpPrivacy';
import HelpRSFormItems from '../man/HelpRSFormItems';
import HelpRSFormMeta from '../man/HelpRSFormMeta';
import HelpRSLang from '../man/HelpRSLang';
import HelpRSTemplates from '../man/HelpRSTemplates';
import HelpTermGraph from '../man/HelpTermGraph';
import HelpTerminologyControl from '../man/HelpTerminologyControl';
import HelpVersions from '../man/HelpVersions';

interface InfoTopicProps {
  topic: HelpTopic;
}

function InfoTopic({ topic }: InfoTopicProps) {
  if (topic === HelpTopic.MAIN) return <HelpMain />;
  if (topic === HelpTopic.LIBRARY) return <HelpLibrary />;
  if (topic === HelpTopic.RSFORM) return <HelpRSFormMeta />;
  if (topic === HelpTopic.CST_ATTRIBUTES) return <HelpCstAttributes />;
  if (topic === HelpTopic.CST_LIST) return <HelpRSFormItems />;
  if (topic === HelpTopic.CST_EDITOR) return <HelpConstituenta />;
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
