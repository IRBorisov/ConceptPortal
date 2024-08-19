import useWindowSize from '@/hooks/useWindowSize';
import { HelpTopic } from '@/models/miscellaneous';

import HelpConceptOSS from './items/cc/HelpConceptOSS';
import HelpConceptPropagation from './items/cc/HelpConceptPropagation';
import HelpConceptRelations from './items/cc/HelpConceptRelations';
import HelpConceptSynthesis from './items/cc/HelpConceptSynthesis';
import HelpConceptSystem from './items/cc/HelpConceptSystem';
import HelpCstAttributes from './items/cc/HelpCstAttributes';
import HelpAccess from './items/HelpAccess';
import HelpConcept from './items/HelpConcept';
import HelpExteor from './items/HelpExteor';
import HelpInfo from './items/HelpInfo';
import HelpInterface from './items/HelpInterface';
import HelpMain from './items/HelpMain';
import HelpRSLang from './items/HelpRSLang';
import HelpTerminologyControl from './items/HelpTerminologyControl';
import HelpVersions from './items/HelpVersions';
import HelpAPI from './items/info/HelpAPI';
import HelpContributors from './items/info/HelpContributors';
import HelpPrivacy from './items/info/HelpPrivacy';
import HelpRules from './items/info/HelpRules';
import HelpRSLangCorrect from './items/rslang/HelpRSLangCorrect';
import HelpRSLangInterpret from './items/rslang/HelpRSLangInterpret';
import HelpRSLangOperations from './items/rslang/HelpRSLangOperations';
import HelpRSLangTemplates from './items/rslang/HelpRSLangTemplates';
import HelpRSLangTypes from './items/rslang/HelpRSLangTypes';
import HelpCstClass from './items/ui/HelpCstClass';
import HelpCstStatus from './items/ui/HelpCstStatus';
import HelpFormulaTree from './items/ui/HelpFormulaTree';
import HelpLibrary from './items/ui/HelpLibrary';
import HelpOssGraph from './items/ui/HelpOssGraph';
import HelpRSCard from './items/ui/HelpRSCard';
import HelpRSEditor from './items/ui/HelpRSEditor';
import HelpRSGraphTerm from './items/ui/HelpRSGraphTerm';
import HelpRSList from './items/ui/HelpRSList';
import HelpRSMenu from './items/ui/HelpRSMenu';

// PDF Viewer setup
const OFFSET_X_SMALL = 32;
const OFFSET_X_LARGE = 280;

const MIN_SIZE_SMALL = 300;
const MIN_SIZE_LARGE = 600;

interface TopicPageProps {
  topic: HelpTopic;
}

function TopicPage({ topic }: TopicPageProps) {
  const size = useWindowSize();

  if (topic === HelpTopic.MAIN) return <HelpMain />;

  if (topic === HelpTopic.INTERFACE) return <HelpInterface />;
  if (topic === HelpTopic.UI_LIBRARY) return <HelpLibrary />;
  if (topic === HelpTopic.UI_RS_MENU) return <HelpRSMenu />;
  if (topic === HelpTopic.UI_RS_CARD) return <HelpRSCard />;
  if (topic === HelpTopic.UI_RS_LIST) return <HelpRSList />;
  if (topic === HelpTopic.UI_RS_EDITOR) return <HelpRSEditor />;
  if (topic === HelpTopic.UI_GRAPH_TERM) return <HelpRSGraphTerm />;
  if (topic === HelpTopic.UI_FORMULA_TREE) return <HelpFormulaTree />;
  if (topic === HelpTopic.UI_CST_STATUS) return <HelpCstStatus />;
  if (topic === HelpTopic.UI_CST_CLASS) return <HelpCstClass />;
  if (topic === HelpTopic.UI_OSS_GRAPH) return <HelpOssGraph />;

  if (topic === HelpTopic.CONCEPTUAL) return <HelpConcept />;
  if (topic === HelpTopic.CC_SYSTEM) return <HelpConceptSystem />;
  if (topic === HelpTopic.CC_CONSTITUENTA) return <HelpCstAttributes />;
  if (topic === HelpTopic.CC_RELATIONS) return <HelpConceptRelations />;
  if (topic === HelpTopic.CC_SYNTHESIS) return <HelpConceptSynthesis />;
  if (topic === HelpTopic.CC_OSS) return <HelpConceptOSS />;
  if (topic === HelpTopic.CC_PROPAGATION) return <HelpConceptPropagation />;

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
  if (topic === HelpTopic.INFO_PRIVACY)
    return (
      <HelpPrivacy
        offsetXpx={size.isSmall ? OFFSET_X_SMALL : OFFSET_X_LARGE}
        minWidth={size.isSmall ? MIN_SIZE_SMALL : MIN_SIZE_LARGE}
      />
    );
  if (topic === HelpTopic.INFO_API) return <HelpAPI />;

  if (topic === HelpTopic.EXTEOR) return <HelpExteor />;
  return null;
}

export default TopicPage;
