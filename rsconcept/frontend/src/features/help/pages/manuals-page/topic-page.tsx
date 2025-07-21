import { useWindowSize } from '@/hooks/use-window-size';

import { HelpConceptOSS } from '../../items/cc/help-concept-oss';
import { HelpConceptPropagation } from '../../items/cc/help-concept-propagation';
import { HelpConceptRelations } from '../../items/cc/help-concept-relations';
import { HelpConceptStructuring } from '../../items/cc/help-concept-structuring';
import { HelpConceptSynthesis } from '../../items/cc/help-concept-synthesis';
import { HelpConceptSystem } from '../../items/cc/help-concept-system';
import { HelpCstAttributes } from '../../items/cc/help-cst-attributes';
import { HelpAccess } from '../../items/help-access';
import { HelpAssistant } from '../../items/help-assistant';
import { HelpConcept } from '../../items/help-concept';
import { HelpExteor } from '../../items/help-exteor';
import { HelpInfo } from '../../items/help-info';
import { HelpInterface } from '../../items/help-interface';
import { HelpMain } from '../../items/help-main';
import { HelpRSLang } from '../../items/help-rslang';
import { HelpTerminologyControl } from '../../items/help-terminology-control';
import { HelpThesaurus } from '../../items/help-thesaurus';
import { HelpVersions } from '../../items/help-versions';
import { HelpAPI } from '../../items/info/help-api';
import { HelpContributors } from '../../items/info/help-contributors';
import { HelpPrivacy } from '../../items/info/help-privacy';
import { HelpRules } from '../../items/info/help-rules';
import { HelpRSLangCorrect } from '../../items/rslang/help-rslang-correct';
import { HelpRSLangInterpret } from '../../items/rslang/help-rslang-interpret';
import { HelpRSLangOperations } from '../../items/rslang/help-rslang-operations';
import { HelpRSLangTemplates } from '../../items/rslang/help-rslang-templates';
import { HelpRSLangTypes } from '../../items/rslang/help-rslang-types';
import { HelpCstClass } from '../../items/ui/help-cst-class';
import { HelpCstStatus } from '../../items/ui/help-cst-status';
import { HelpFormulaTree } from '../../items/ui/help-formula-tree';
import { HelpLibrary } from '../../items/ui/help-library';
import { HelpOssGraph } from '../../items/ui/help-oss-graph';
import { HelpRelocateCst } from '../../items/ui/help-relocate-cst';
import { HelpRSCard } from '../../items/ui/help-rscard';
import { HelpRSEditor } from '../../items/ui/help-rseditor';
import { HelpRSGraphTerm } from '../../items/ui/help-rsgraph-term';
import { HelpRSList } from '../../items/ui/help-rslist';
import { HelpRSMenu } from '../../items/ui/help-rsmenu';
import { HelpSubstitutions } from '../../items/ui/help-substitutions';
import { HelpTypeGraph } from '../../items/ui/help-type-graph';
import { HelpTopic } from '../../models/help-topic';

// PDF Viewer setup
const OFFSET_X_SMALL = 32;
const OFFSET_X_LARGE = 280;

const MIN_SIZE_SMALL = 300;
const MIN_SIZE_LARGE = 600;

interface TopicPageProps {
  topic: HelpTopic;
}

export function TopicPage({ topic }: TopicPageProps) {
  const size = useWindowSize();

  if (topic === HelpTopic.MAIN) return <HelpMain />;
  if (topic === HelpTopic.THESAURUS) return <HelpThesaurus />;

  if (topic === HelpTopic.INTERFACE) return <HelpInterface />;
  if (topic === HelpTopic.UI_LIBRARY) return <HelpLibrary />;
  if (topic === HelpTopic.UI_RS_MENU) return <HelpRSMenu />;
  if (topic === HelpTopic.UI_RS_CARD) return <HelpRSCard />;
  if (topic === HelpTopic.UI_RS_LIST) return <HelpRSList />;
  if (topic === HelpTopic.UI_RS_EDITOR) return <HelpRSEditor />;
  if (topic === HelpTopic.UI_GRAPH_TERM) return <HelpRSGraphTerm />;
  if (topic === HelpTopic.UI_FORMULA_TREE) return <HelpFormulaTree />;
  if (topic === HelpTopic.UI_TYPE_GRAPH) return <HelpTypeGraph />;
  if (topic === HelpTopic.UI_CST_STATUS) return <HelpCstStatus />;
  if (topic === HelpTopic.UI_CST_CLASS) return <HelpCstClass />;
  if (topic === HelpTopic.UI_OSS_GRAPH) return <HelpOssGraph />;
  if (topic === HelpTopic.UI_SUBSTITUTIONS) return <HelpSubstitutions />;
  if (topic === HelpTopic.UI_RELOCATE_CST) return <HelpRelocateCst />;

  if (topic === HelpTopic.CONCEPTUAL) return <HelpConcept />;
  if (topic === HelpTopic.CC_SYSTEM) return <HelpConceptSystem />;
  if (topic === HelpTopic.CC_CONSTITUENTA) return <HelpCstAttributes />;
  if (topic === HelpTopic.CC_RELATIONS) return <HelpConceptRelations />;
  if (topic === HelpTopic.CC_SYNTHESIS) return <HelpConceptSynthesis />;
  if (topic === HelpTopic.CC_STRUCTURING) return <HelpConceptStructuring />;
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
  if (topic === HelpTopic.ASSISTANT) return <HelpAssistant />;

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
