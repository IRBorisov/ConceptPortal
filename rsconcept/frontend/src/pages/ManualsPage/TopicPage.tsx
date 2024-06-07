import { HelpTopic } from '@/models/miscellaneous';

import HelpAccess from './items/HelpAccess';
import HelpAPI from './items/HelpAPI';
import HelpConcept from './items/HelpConcept';
import HelpConceptRelations from './items/HelpConceptRelations';
import HelpConceptSynthesis from './items/HelpConceptSynthesis';
import HelpConceptSystem from './items/HelpConceptSystem';
import HelpContributors from './items/HelpContributors';
import HelpCstAttributes from './items/HelpCstAttributes';
import HelpCstClass from './items/HelpCstClass';
import HelpCstEditor from './items/HelpCstEditor';
import HelpCstStatus from './items/HelpCstStatus';
import HelpExteor from './items/HelpExteor';
import HelpFormulaTree from './items/HelpFormulaTree';
import HelpInfo from './items/HelpInfo';
import HelpInterface from './items/HelpInterface';
import HelpLibrary from './items/HelpLibrary';
import HelpOSS from './items/HelpOSS';
import HelpPortal from './items/HelpPortal';
import HelpPrivacy from './items/HelpPrivacy';
import HelpRSFormCard from './items/HelpRSFormCard';
import HelpRSFormItems from './items/HelpRSFormItems';
import HelpRSFormMenu from './items/HelpRSFormMenu';
import HelpRSLang from './items/HelpRSLang';
import HelpRSLangCorrect from './items/HelpRSLangCorrect';
import HelpRSLangInterpret from './items/HelpRSLangInterpret';
import HelpRSLangOperations from './items/HelpRSLangOperations';
import HelpRSLangTemplates from './items/HelpRSLangTemplates';
import HelpRSLangTypes from './items/HelpRSLangTypes';
import HelpRules from './items/HelpRules';
import HelpTermGraph from './items/HelpTermGraph';
import HelpTerminologyControl from './items/HelpTerminologyControl';
import HelpVersions from './items/HelpVersions';

interface TopicPageProps {
  topic: HelpTopic;
}

function TopicPage({ topic }: TopicPageProps) {
  if (topic === HelpTopic.MAIN) return <HelpPortal />;

  if (topic === HelpTopic.INTERFACE) return <HelpInterface />;
  if (topic === HelpTopic.UI_LIBRARY) return <HelpLibrary />;
  if (topic === HelpTopic.UI_RS_MENU) return <HelpRSFormMenu />;
  if (topic === HelpTopic.UI_RS_CARD) return <HelpRSFormCard />;
  if (topic === HelpTopic.UI_RS_LIST) return <HelpRSFormItems />;
  if (topic === HelpTopic.UI_RS_EDITOR) return <HelpCstEditor />;
  if (topic === HelpTopic.UI_GRAPH_TERM) return <HelpTermGraph />;
  if (topic === HelpTopic.UI_FORMULA_TREE) return <HelpFormulaTree />;
  if (topic === HelpTopic.UI_CST_STATUS) return <HelpCstStatus />;
  if (topic === HelpTopic.UI_CST_CLASS) return <HelpCstClass />;

  if (topic === HelpTopic.CONCEPTUAL) return <HelpConcept />;
  if (topic === HelpTopic.CC_SYSTEM) return <HelpConceptSystem />;
  if (topic === HelpTopic.CC_CONSTITUENTA) return <HelpCstAttributes />;
  if (topic === HelpTopic.CC_RELATIONS) return <HelpConceptRelations />;
  if (topic === HelpTopic.CC_SYNTHESIS) return <HelpConceptSynthesis />;
  if (topic === HelpTopic.CC_OSS) return <HelpOSS />;

  if (topic === HelpTopic.RSLANG) return <HelpRSLang />;
  if (topic === HelpTopic.RSL_TYPES) return <HelpRSLangTypes />;
  if (topic === HelpTopic.RSL_CORRECT) return <HelpRSLangCorrect />;
  if (topic === HelpTopic.RSL_INTERPRET) return <HelpRSLangInterpret />;
  if (topic === HelpTopic.RSL_OPERATIONS) return <HelpRSLangOperations />;
  if (topic === HelpTopic.RSL_TEMPLATES) return <HelpRSLangTemplates />;

  if (topic === HelpTopic.TERM_CONTROL) return <HelpTerminologyControl />;
  if (topic === HelpTopic.ACCESS) return <HelpAccess />;
  if (topic === HelpTopic.VERSIONS) return <HelpVersions />;

  if (topic === HelpTopic.INFO) return <HelpInfo />;
  if (topic === HelpTopic.INFO_RULES) return <HelpRules />;
  if (topic === HelpTopic.INFO_CONTRIB) return <HelpContributors />;
  if (topic === HelpTopic.INFO_PRIVACY) return <HelpPrivacy />;
  if (topic === HelpTopic.INFO_API) return <HelpAPI />;

  if (topic === HelpTopic.EXTEOR) return <HelpExteor />;
  return null;
}

export default TopicPage;
