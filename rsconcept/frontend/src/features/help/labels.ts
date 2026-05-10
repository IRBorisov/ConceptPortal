import { globalTx } from '@/i18n';

import { HelpTopic } from './models/help-topic';

const helpTopicLabelId: Record<HelpTopic, string> = {
  [HelpTopic.MAIN]: 'tx.shell.app',
  [HelpTopic.THESAURUS]: 'tx.lang.thesaurus',
  [HelpTopic.INTERFACE]: 'tx.general.ui',
  [HelpTopic.UI_LIBRARY]: 'tx.lib.library',
  [HelpTopic.UI_SCHEMA_MENU]: 'tx.schema.menu',
  [HelpTopic.UI_SCHEMA_CARD]: 'tx.schema.passport',
  [HelpTopic.UI_SCHEMA_LIST]: 'tx.schema.list',
  [HelpTopic.UI_SCHEMA_EDITOR]: 'tx.cst.edit.ui',
  [HelpTopic.UI_STRUCTURE_PLANNER]: 'tx.concept.expandStructure.noun',
  [HelpTopic.UI_MODEL_MENU]: 'tx.model.menu',
  [HelpTopic.UI_MODEL_CARD]: 'tx.model.passport',
  [HelpTopic.UI_MODEL_LIST]: 'tx.model.list',
  [HelpTopic.UI_MODEL_VALUE]: 'tx.model.data',
  [HelpTopic.UI_MODEL_VALUE_EDIT]: 'tx.rslang.value.edit',
  [HelpTopic.UI_MODEL_EVALUATOR]: 'tx.evaluation',
  [HelpTopic.UI_EVAL_STATUS]: 'tx.evaluation.status',
  [HelpTopic.UI_MODEL_BINDING]: 'tx.rslang.binding',
  [HelpTopic.UI_GRAPH_TERM]: 'tx.termGraph',
  [HelpTopic.UI_FORMULA_TREE]: 'tx.rsexpression.ast',
  [HelpTopic.UI_TYPE_GRAPH]: 'tx.typeGraph',
  [HelpTopic.UI_CST_STATUS]: 'tx.parse.status',
  [HelpTopic.UI_CST_CLASS]: 'tx.cst.class',
  [HelpTopic.UI_OSS_CARD]: 'tx.oss.passport',
  [HelpTopic.UI_OSS_GRAPH]: 'tx.oss',
  [HelpTopic.UI_OSS_SIDEBAR]: 'tx.oss.sidebar.contents',
  [HelpTopic.UI_SUBSTITUTIONS]: 'tx.substitution.plural',
  [HelpTopic.UI_RELOCATE_CST]: 'tx.oss.relocate',
  [HelpTopic.CONCEPTUAL]: 'tx.concept.framework',
  [HelpTopic.CC_SYSTEM]: 'tx.concept.system',
  [HelpTopic.CC_RSMODEL]: 'tx.model',
  [HelpTopic.CC_CONSTITUENTA]: 'tx.cst',
  [HelpTopic.CC_RELATIONS]: 'tx.concept.relation.plural',
  [HelpTopic.CC_SYNTHESIS]: 'tx.synthesis',
  [HelpTopic.CC_STRUCTURING]: 'tx.oss.structuring',
  [HelpTopic.CC_OSS]: 'tx.oss',
  [HelpTopic.CC_PROPAGATION]: 'tx.oss.change.propagation',
  [HelpTopic.RSLANG]: 'tx.rslang.short',
  [HelpTopic.RSL_LITERALS]: 'tx.rslang.identifiers',
  [HelpTopic.RSL_TYPIFICATION]: 'tx.rslang.typification',
  [HelpTopic.RSL_EXPRESSION_LOGIC]: 'tx.rsexpression.logic',
  [HelpTopic.RSL_EXPRESSION_SET]: 'tx.rsexpression.set',
  [HelpTopic.RSL_EXPRESSION_STRUCTURE]: 'tx.rsexpression.structure',
  [HelpTopic.RSL_EXPRESSION_ARITHMETIC]: 'tx.rsexpression.arithmetic',
  [HelpTopic.RSL_EXPRESSION_QUANTOR]: 'tx.rsexpression.quantifier',
  [HelpTopic.RSL_EXPRESSION_DECLARATIVE]: 'tx.rsexpression.declarative',
  [HelpTopic.RSL_EXPRESSION_IMPERATIVE]: 'tx.rsexpression.imperative',
  [HelpTopic.RSL_EXPRESSION_RECURSIVE]: 'tx.rsexpression.recursive',
  [HelpTopic.RSL_EXPRESSION_PARAMETER]: 'tx.rsexpression.parameter',
  [HelpTopic.RSL_CORRECT]: 'tx.concept.system.portability',
  [HelpTopic.RSL_INTERPRET]: 'tx.concept.system.evaluability',
  [HelpTopic.RSL_OPERATIONS]: 'tx.schema.operation.plural',
  [HelpTopic.RSL_TEMPLATES]: 'tx.rsexpression.templateBank',
  [HelpTopic.TERM_CONTROL]: 'tx.lang.terminologyControl',
  [HelpTopic.ACCESS]: 'tx.lib.access.plural',
  [HelpTopic.VERSIONS]: 'tx.lib.versioning',
  [HelpTopic.ASSISTANT]: 'tx.ai',
  [HelpTopic.INFO]: 'tx.general.documentation',
  [HelpTopic.INFO_RULES]: 'tx.shell.rules',
  [HelpTopic.INFO_PRIVACY]: 'tx.shell.privacy',
  [HelpTopic.INFO_API]: 'tx.general.restApi',
  [HelpTopic.CONTRIBUTORS]: 'tx.general.developer.plural',
  [HelpTopic.EXTEOR]: 'tx.shell.app.exteor'
};

const helpTopicManualHintId: Record<HelpTopic, string> = {
  [HelpTopic.MAIN]: 'tx.shell.app.hint',
  [HelpTopic.THESAURUS]: 'tx.lang.thesaurus.hint',
  [HelpTopic.INTERFACE]: 'tx.general.ui.hint',
  [HelpTopic.UI_LIBRARY]: 'tx.lib.library.hint',
  [HelpTopic.UI_SCHEMA_MENU]: 'tx.schema.menu.hint',
  [HelpTopic.UI_SCHEMA_CARD]: 'tx.schema.passport.hint',
  [HelpTopic.UI_SCHEMA_LIST]: 'tx.schema.list.hint',
  [HelpTopic.UI_SCHEMA_EDITOR]: 'tx.cst.edit.ui.hint',
  [HelpTopic.UI_STRUCTURE_PLANNER]: 'tx.concept.expandStructure.hint',
  [HelpTopic.UI_MODEL_MENU]: 'tx.model.menu.hint',
  [HelpTopic.UI_MODEL_CARD]: 'tx.model.passport.hint',
  [HelpTopic.UI_MODEL_LIST]: 'tx.model.list.hint',
  [HelpTopic.UI_MODEL_VALUE]: 'tx.model.data.hint',
  [HelpTopic.UI_MODEL_VALUE_EDIT]: 'tx.rslang.value.edit.hint',
  [HelpTopic.UI_MODEL_EVALUATOR]: 'tx.evaluation.hint',
  [HelpTopic.UI_EVAL_STATUS]: 'tx.evaluation.status.hint',
  [HelpTopic.UI_MODEL_BINDING]: 'tx.rslang.binding.hint',
  [HelpTopic.UI_GRAPH_TERM]: 'tx.termGraph.hint',
  [HelpTopic.UI_FORMULA_TREE]: 'tx.rsexpression.ast.hint',
  [HelpTopic.UI_TYPE_GRAPH]: 'tx.typeGraph.hint',
  [HelpTopic.UI_CST_STATUS]: 'tx.parse.status.hint',
  [HelpTopic.UI_CST_CLASS]: 'tx.cst.class.hint',
  [HelpTopic.UI_OSS_CARD]: 'tx.oss.passport.hint',
  [HelpTopic.UI_OSS_GRAPH]: 'tx.oss.graph.hint',
  [HelpTopic.UI_OSS_SIDEBAR]: 'tx.oss.sidebar.contents.hint',
  [HelpTopic.UI_SUBSTITUTIONS]: 'tx.substitution.table.hint',
  [HelpTopic.UI_RELOCATE_CST]: 'tx.oss.relocate.hint',
  [HelpTopic.CONCEPTUAL]: 'tx.concept.framework.hint',
  [HelpTopic.CC_SYSTEM]: 'tx.schema.hint',
  [HelpTopic.CC_RSMODEL]: 'tx.model.hint',
  [HelpTopic.CC_CONSTITUENTA]: 'tx.cst.hint',
  [HelpTopic.CC_RELATIONS]: 'tx.concept.relation.hint',
  [HelpTopic.CC_SYNTHESIS]: 'tx.synthesis.hint',
  [HelpTopic.CC_STRUCTURING]: 'tx.oss.structuring.hint',
  [HelpTopic.CC_OSS]: 'tx.oss.hint',
  [HelpTopic.CC_PROPAGATION]: 'tx.oss.change.propagation.hint',
  [HelpTopic.RSLANG]: 'tx.rslang.hint',
  [HelpTopic.RSL_LITERALS]: 'tx.rslang.identifiers.hint',
  [HelpTopic.RSL_TYPIFICATION]: 'tx.rslang.typification.hint',
  [HelpTopic.RSL_EXPRESSION_LOGIC]: 'tx.rsexpression.logic.hint',
  [HelpTopic.RSL_EXPRESSION_SET]: 'tx.rsexpression.set.hint',
  [HelpTopic.RSL_EXPRESSION_STRUCTURE]: 'tx.rsexpression.structure.hint',
  [HelpTopic.RSL_EXPRESSION_ARITHMETIC]: 'tx.rsexpression.arithmetic.hint',
  [HelpTopic.RSL_EXPRESSION_QUANTOR]: 'tx.rsexpression.quantifier.hint',
  [HelpTopic.RSL_EXPRESSION_DECLARATIVE]: 'tx.rsexpression.declarative.hint',
  [HelpTopic.RSL_EXPRESSION_IMPERATIVE]: 'tx.rsexpression.imperative.hint',
  [HelpTopic.RSL_EXPRESSION_RECURSIVE]: 'tx.rsexpression.recursive.hint',
  [HelpTopic.RSL_EXPRESSION_PARAMETER]: 'tx.rsexpression.parameter.hint',
  [HelpTopic.RSL_CORRECT]: 'tx.concept.system.portability.hint',
  [HelpTopic.RSL_INTERPRET]: 'tx.concept.system.evaluability.hint',
  [HelpTopic.RSL_OPERATIONS]: 'tx.schema.operation.hint',
  [HelpTopic.RSL_TEMPLATES]: 'tx.rsexpression.templateBank.hint',
  [HelpTopic.TERM_CONTROL]: 'tx.lang.terminologyControl.hint',
  [HelpTopic.ACCESS]: 'tx.lib.access.hint',
  [HelpTopic.VERSIONS]: 'tx.lib.versioning.hint',
  [HelpTopic.ASSISTANT]: 'tx.ai.hint',
  [HelpTopic.INFO]: 'tx.general.documentation.hint',
  [HelpTopic.INFO_RULES]: 'tx.shell.rules.hint',
  [HelpTopic.INFO_PRIVACY]: 'tx.shell.privacy.hint',
  [HelpTopic.INFO_API]: 'tx.general.restApi.hint',
  [HelpTopic.CONTRIBUTORS]: 'tx.general.developer.hint',
  [HelpTopic.EXTEOR]: 'tx.shell.app.exteor.hint'
};

const helpTopicLabelEmoji: Partial<Record<HelpTopic, string>> = {
  [HelpTopic.MAIN]: '🏠',
  [HelpTopic.THESAURUS]: '📖',
  [HelpTopic.INTERFACE]: '🌀',
  [HelpTopic.CONCEPTUAL]: '♨️',
  [HelpTopic.RSLANG]: '🚀',
  [HelpTopic.TERM_CONTROL]: '🪸',
  [HelpTopic.ACCESS]: '🔐',
  [HelpTopic.VERSIONS]: '🏺',
  [HelpTopic.ASSISTANT]: '🤖',
  [HelpTopic.INFO]: '📰',
  [HelpTopic.CONTRIBUTORS]: '👷',
  [HelpTopic.EXTEOR]: '🖥️'
};

/** Retrieves label for {@link HelpTopic}. */
export function labelHelpTopic(topic: HelpTopic): string {
  const id = helpTopicLabelId[topic];
  if (!id) {
    return 'UNKNOWN TOPIC';
  }
  const text = globalTx(id);
  const emoji = helpTopicLabelEmoji[topic];
  return emoji ? `${emoji} ${text}` : text;
}

/** Retrieves description for {@link HelpTopic}. */
export function describeHelpTopic(topic: HelpTopic): string {
  const id = helpTopicManualHintId[topic];
  if (!id) {
    return 'UNKNOWN TOPIC';
  }
  return globalTx(id);
}
