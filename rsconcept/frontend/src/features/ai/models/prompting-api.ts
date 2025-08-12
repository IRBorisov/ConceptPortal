import { type IBlock, type IOperationSchema, NodeType } from '@/features/oss/models/oss';
import { CstType, type IConstituenta, type IRSForm } from '@/features/rsform';
import { labelCstTypification } from '@/features/rsform/labels';
import { isBasicConcept } from '@/features/rsform/models/rsform-api';
import { TypificationGraph } from '@/features/rsform/models/typification-graph';

import { PARAMETER } from '@/utils/constants';

import { mockPromptVariable } from '../labels';

/** Extracts a list of variables (as string[]) from a target string.
 * Note: Variables are wrapped in {{...}} and can include a-zA-Z, hyphen, and dot inside curly braces.
 * */
export function extractPromptVariables(target: string): string[] {
  const regex = /\{\{([a-zA-Z.-]+)\}\}/g;
  const result: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(target)) !== null) {
    result.push(match[1]);
  }
  return result;
}

/** Generates a sample text from a target templates. */
export function generateSample(target: string): string {
  const variables = extractPromptVariables(target);
  if (variables.length === 0) {
    return target;
  }
  let result = target;
  for (const variable of variables) {
    const mockText = mockPromptVariable(variable);
    const escapedVar = variable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    result = result.replace(new RegExp(`\\{\\{${escapedVar}\\}\\}`, 'g'), mockText);
  }
  return result;
}

/** Generates a prompt for a schema variable. */
export function varSchema(schema: IRSForm): string {
  let result = `Название концептуальной схемы: ${schema.title}\n`;
  result += `[${schema.alias}] Описание: "${schema.description}"\n\n`;
  result += 'Конституенты:\n';
  schema.items.forEach(item => {
    result += `\n${item.alias} - "${labelCstTypification(item)}" - "${item.term_resolved}" - "${
      item.definition_formal
    }" - "${item.definition_resolved}" - "${item.convention}"`;
  });
  if (schema.stats.count_crucial > 0) {
    result +=
      '\nКлючевые конституенты: ' +
      schema.items
        .filter(cst => cst.crucial)
        .map(cst => cst.alias)
        .join(', ');
  }
  return result;
}

/** Generates a prompt for a schema thesaurus variable. */
export function varSchemaThesaurus(schema: IRSForm): string {
  let result = `Название концептуальной схемы: ${schema.title}\n`;
  result += `[${schema.alias}] Описание: "${schema.description}"\n\n`;
  result += 'Термины:\n';
  schema.items.forEach(item => {
    if (item.cst_type === CstType.AXIOM || item.cst_type === CstType.THEOREM) {
      return;
    }
    if (isBasicConcept(item.cst_type)) {
      result += `\n${item.term_resolved} - "${item.convention}"`;
    } else {
      result += `\n${item.term_resolved} - "${item.definition_resolved}"`;
    }
  });
  return result;
}

/** Generates a prompt for a schema graph variable. */
export function varSchemaGraph(schema: IRSForm): string {
  let result = `Название концептуальной схемы: ${schema.title}\n`;
  result += `[${schema.alias}] Описание: "${schema.description}"\n\n`;
  result += 'Узлы графа\n';
  result += JSON.stringify(schema.items, null, PARAMETER.indentJSON);
  result += '\n\nСвязи графа';
  schema.graph.nodes.forEach(node => (result += `\n${node.id} -> ${node.outputs.join(', ')}`));
  return result;
}

/** Generates a prompt for a schema type graph variable. */
export function varSchemaTypeGraph(schema: IRSForm): string {
  const graph = new TypificationGraph();
  schema.items.forEach(item => {
    if (item.parse) graph.addConstituenta(item.alias, item.parse.typification, item.parse.args);
  });

  let result = `Название концептуальной схемы: ${schema.title}\n`;
  result += `[${schema.alias}] Описание: "${schema.description}"\n\n`;
  result += 'Ступени\n';
  result += JSON.stringify(graph.nodes, null, PARAMETER.indentJSON);
  return result;
}

/** Generates a prompt for a OSS variable. */
export function varOSS(oss: IOperationSchema): string {
  let result = `Название операционной схемы: ${oss.title}\n`;
  result += `Сокращение: ${oss.alias}\n`;
  result += `Описание: ${oss.description}\n`;
  result += `Блоки: ${oss.blocks.length}\n`;
  oss.hierarchy.topologicalOrder().forEach(blockID => {
    const block = oss.itemByNodeID.get(blockID);
    if (block?.nodeType !== NodeType.BLOCK) {
      return;
    }
    result += `\nБлок ${block.id}: ${block.title}\n`;
    result += `Описание: ${block.description}\n`;
    result += `Предок: "${block.parent}"\n`;
  });
  result += `Операции: ${oss.operations.length}\n`;
  oss.operations.forEach(operation => {
    result += `\nОперация ${operation.id}: ${operation.alias}\n`;
    result += `Название: ${operation.title}\n`;
    result += `Описание: ${operation.description}\n`;
    result += `Блок: ${operation.parent}`;
  });
  return result;
}

/** Generates a prompt for a block variable. */
export function varBlock(target: IBlock, oss: IOperationSchema): string {
  const blocks = oss.blocks.filter(block => block.parent === target.id);
  const operations = oss.operations.filter(operation => operation.parent === target.id);
  let result = `Название блока: ${target.title}\n`;
  result += `Описание: "${target.description}"\n`;
  result += '\nСодержание\n';
  result += `Блоки: ${blocks.length}\n`;
  blocks.forEach(block => {
    result += `\nБлок ${block.id}: ${block.title}\n`;
    result += `Описание: "${block.description}"\n`;
  });
  result += `Операции: ${operations.length}\n`;
  operations.forEach(operation => {
    result += `\nОперация ${operation.id}: ${operation.alias}\n`;
    result += `Название: "${operation.title}"\n`;
    result += `Описание: "${operation.description}"`;
  });
  return result;
}

/** Generates a prompt for a constituenta variable. */
export function varConstituenta(cst: IConstituenta): string {
  return JSON.stringify(cst, null, PARAMETER.indentJSON);
}

/** Generates a prompt for a constituenta syntax tree variable. */
export function varSyntaxTree(cst: IConstituenta): string {
  let result = `Конституента: ${cst.alias}\n`;
  result += `Формальное выражение: ${cst.definition_formal}\n`;
  result += `Дерево синтаксического разбора:\n`;
  result += cst.parse ? JSON.stringify(cst.parse.syntaxTree, null, PARAMETER.indentJSON) : 'не определено';
  return result;
}
