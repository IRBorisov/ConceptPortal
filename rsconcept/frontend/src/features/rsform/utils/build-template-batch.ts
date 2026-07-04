import {
  type ArgumentValue,
  type Constituenta,
  planTemplateInstantiation,
  type RSForm,
  type TemplateInstantiationItem
} from '@rsconcept/domain/library';

import {
  type CreateConstituentaBatchItem,
  type CreateConstituentaDTO,
  type CreateConstituentsBatchDTO
} from '../backend/types';

function toTemplateMainItem(mainItem: CreateConstituentaDTO): TemplateInstantiationItem {
  return {
    alias: mainItem.alias,
    cst_type: mainItem.cst_type,
    crucial: mainItem.crucial,
    convention: mainItem.convention,
    definition_formal: mainItem.definition_formal,
    definition_raw: mainItem.definition_raw,
    term_raw: mainItem.term_raw,
    term_forms: mainItem.term_forms,
    typification_manual: mainItem.typification_manual,
    value_is_property: mainItem.value_is_property
  };
}

/** Preview batch plan for template dialog validation. */
export function previewTemplateInstantiationPlan(
  targetSchema: RSForm,
  templateItems: Constituenta[],
  prototype: Constituenta | null,
  userArgs: ArgumentValue[],
  mainItem: CreateConstituentaDTO
) {
  if (!prototype) {
    return null;
  }
  return planTemplateInstantiation({
    targetSchema,
    templateItems,
    prototype,
    userArgs,
    mainItem: toTemplateMainItem(mainItem)
  });
}

export function getTemplateMainDuplicateAlias(
  targetSchema: RSForm,
  templateItems: Constituenta[],
  prototype: Constituenta | null,
  userArgs: ArgumentValue[],
  mainItem: CreateConstituentaDTO
): string | null {
  return (
    previewTemplateInstantiationPlan(targetSchema, templateItems, prototype, userArgs, mainItem)?.mainDuplicateAlias ??
    null
  );
}

function toBatchItem(item: TemplateInstantiationItem): CreateConstituentaBatchItem {
  return {
    alias: item.alias,
    cst_type: item.cst_type,
    term_raw: item.term_raw,
    typification_manual: item.typification_manual,
    value_is_property: item.value_is_property,
    definition_formal: item.definition_formal,
    definition_raw: item.definition_raw,
    convention: item.convention,
    crucial: item.crucial,
    term_forms: item.term_forms
  };
}

/** Build batch create payload for instantiating a template expression with its dependencies. */
export function buildTemplateConstituentsBatch(
  targetSchema: RSForm,
  templateItems: Constituenta[],
  prototype: Constituenta,
  userArgs: ArgumentValue[],
  mainItem: CreateConstituentaDTO
): CreateConstituentsBatchDTO {
  const plan = planTemplateInstantiation({
    targetSchema,
    templateItems,
    prototype,
    userArgs,
    mainItem: toTemplateMainItem(mainItem)
  });

  return {
    insert_after: mainItem.insert_after,
    items: plan.items.map(toBatchItem)
  };
}
