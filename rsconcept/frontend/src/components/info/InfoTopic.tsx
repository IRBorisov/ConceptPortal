import { HelpTopic } from '@/models/miscellaneous';

import HelpAPI from '../man/HelpAPI';
import HelpConcept from '../man/HelpConcept';
import HelpConceptRelations from '../man/HelpConceptRelations';
import HelpConceptSystem from '../man/HelpConceptSystem';
import HelpCstAttributes from '../man/HelpCstAttributes';
import HelpCstClass from '../man/HelpCstClass';
import HelpCstEditor from '../man/HelpCstEditor';
import HelpCstStatus from '../man/HelpCstStatus';
import HelpExteor from '../man/HelpExteor';
import HelpInterface from '../man/HelpInterface';
import HelpLibrary from '../man/HelpLibrary';
import HelpMain from '../man/HelpMain';
import HelpPrivacy from '../man/HelpPrivacy';
import HelpRSFormItems from '../man/HelpRSFormItems';
import HelpRSFormMeta from '../man/HelpRSFormMeta';
import HelpRSFormUI from '../man/HelpRSFormUI';
import HelpRSLang from '../man/HelpRSLang';
import HelpRSLangCorrect from '../man/HelpRSLangCorrect';
import HelpRSLangInterpret from '../man/HelpRSLangInterpret';
import HelpRSLangOperations from '../man/HelpRSLangOperations';
import HelpRSLangTypes from '../man/HelpRSLangTypes';
import HelpRSTemplates from '../man/HelpRSTemplates';
import HelpTermGraph from '../man/HelpTermGraph';
import HelpTerminologyControl from '../man/HelpTerminologyControl';
import HelpVersions from '../man/HelpVersions';

interface InfoTopicProps {
  topic: HelpTopic;
}

function InfoTopic({ topic }: InfoTopicProps) {
  if (topic === HelpTopic.MAIN) return <HelpMain />;

  if (topic === HelpTopic.INTERFACE) return <HelpInterface />;
  if (topic === HelpTopic.UI_LIBRARY) return <HelpLibrary />;
  if (topic === HelpTopic.UI_RSFORM) return <HelpRSFormUI />;
  if (topic === HelpTopic.UI_RSFORM_CARD) return <HelpRSFormMeta />;
  if (topic === HelpTopic.UI_RSFORM_LIST) return <HelpRSFormItems />;
  if (topic === HelpTopic.UI_RSFORM_EDITOR) return <HelpCstEditor />;
  if (topic === HelpTopic.UI_GRAPH_TERM) return <HelpTermGraph />;
  if (topic === HelpTopic.UI_CST_STATUS) return <HelpCstStatus />;
  if (topic === HelpTopic.UI_CST_CLASS) return <HelpCstClass />;

  if (topic === HelpTopic.CONCEPTUAL) return <HelpConcept />;
  if (topic === HelpTopic.CC_SYSTEM) return <HelpConceptSystem />;
  if (topic === HelpTopic.CC_CONSTITUENTA) return <HelpCstAttributes />;
  if (topic === HelpTopic.CC_RELATIONS) return <HelpConceptRelations />;

  if (topic === HelpTopic.RSLANG) return <HelpRSLang />;
  if (topic === HelpTopic.RSL_TYPES) return <HelpRSLangTypes />;
  if (topic === HelpTopic.RSL_CORRECT) return <HelpRSLangCorrect />;
  if (topic === HelpTopic.RSL_INTERPRET) return <HelpRSLangInterpret />;
  if (topic === HelpTopic.RSL_TEMPLATES) return <HelpRSTemplates />;
  if (topic === HelpTopic.RSL_OPERATIONS) return <HelpRSLangOperations />;

  if (topic === HelpTopic.TERM_CONTROL) return <HelpTerminologyControl />;
  if (topic === HelpTopic.VERSIONS) return <HelpVersions />;
  if (topic === HelpTopic.EXTEOR) return <HelpExteor />;
  if (topic === HelpTopic.API) return <HelpAPI />;
  if (topic === HelpTopic.PRIVACY) return <HelpPrivacy />;
  return null;
}

export default InfoTopic;
