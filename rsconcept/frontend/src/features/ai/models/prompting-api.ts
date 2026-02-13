import { type Block, NodeType, type OperationSchema } from '@/features/oss/models/oss';
import { type Constituenta, type RSForm } from '@/features/rsform';
import { CstType } from '@/features/rsform/models/rsform';
import { isBasicConcept } from '@/features/rsform/models/rsform-api';
import { TypificationGraph } from '@/features/rsform/models/typification-graph';
import { labelType } from '@/features/rslang/labels';
import { isTypification } from '@/features/rslang/semantic/typification';

import { type Graph } from '@/models/graph';
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
export function varSchema(schema: RSForm): string {
  let result = stringifySchemaIntro(schema);
  result += '\n\nКонституенты:';
  for (const item of schema.items) {
    result += `\n${item.alias} - "${labelType(item.analysis.type)}" - "${item.term_resolved}" - "${item.definition_formal
      }" - "${item.definition_resolved}" - "${item.convention}"`;
  }

  const crucial = schema.items.filter(cst => cst.crucial);
  if (crucial.length > 0) {
    result += `\n${stringifyCrucial(schema.items.filter(cst => cst.crucial))}`;
  }

  const attributionGraph = stringifyGraph(schema.attribution_graph, schema);
  if (attributionGraph) {
    result += '\n\nСвязи "атрибутирования":';
    result += attributionGraph ? attributionGraph : ' отсутствуют';
  }
  return result;
}

/** Generates a prompt for a schema thesaurus variable. */
export function varSchemaThesaurus(schema: RSForm): string {
  let result = stringifySchemaIntro(schema);
  result += '\n\nТермины:';
  for (const item of schema.items) {
    if (item.cst_type === CstType.AXIOM || item.cst_type === CstType.THEOREM) {
      continue;
    }
    if (isBasicConcept(item.cst_type)) {
      result += `\n${item.term_resolved} - "${item.convention}"`;
    } else {
      result += `\n${item.term_resolved} - "${item.definition_resolved}"`;
    }
  }
  return result;
}

/** Generates a prompt for a schema graph variable. */
export function varSchemaGraph(schema: RSForm): string {
  let result = stringifySchemaIntro(schema);
  result += '\n\nУзлы графа\n';
  result += JSON.stringify(
    schema.items.map(cst => ({
      alias: cst.alias,
      term: cst.term_resolved,
      definition: cst.definition_resolved,
      convention: cst.convention,
      crucial: cst.crucial
    })),
    null,
    PARAMETER.indentJSON
  );

  result += '\n\nСвязи "входит в определение"';
  const definitionGraph = stringifyGraph(schema.graph, schema);
  result += definitionGraph ? definitionGraph : ' отсутствуют';

  result += '\n\nСвязи "атрибутирован"';
  const attributionGraph = stringifyGraph(schema.attribution_graph, schema);
  result += attributionGraph ? attributionGraph : ' отсутствуют';
  return result;
}

/** Generates a prompt for a schema type graph variable. */
export function varSchemaTypeGraph(schema: RSForm): string {
  const graph = new TypificationGraph();
  for (const item of schema.items) {
    if (item.analysis.type !== null && isTypification(item.analysis.type)) {
      graph.addElement(item.alias, item.analysis.type);
    }
  }

  let result = stringifySchemaIntro(schema);
  result += '\n\nСтупени\n';
  result += JSON.stringify(graph.nodes, null, PARAMETER.indentJSON);
  return result;
}

/** Generates a prompt for a OSS variable. */
export function varOSS(oss: OperationSchema): string {
  let result = stringifyOSSIntro(oss);
  result += `\n\nБлоки: ${oss.blocks.length}\n`;
  for (const blockID of oss.hierarchy.topologicalOrder()) {
    const block = oss.itemByNodeID.get(blockID);
    if (block?.nodeType !== NodeType.BLOCK) {
      continue;
    }
    result += `\n\nБлок ${block.id}: ${block.title}`;
    result += `\nОписание: ${block.description}`;
    result += `\nПредок: "${block.parent ?? 'отсутствует'}"`;
  }
  result += `\n\nОперации: ${oss.operations.length}`;
  for (const operation of oss.operations) {
    result += `\n\nОперация ${operation.id}: ${operation.alias}`;
    result += `\nНазвание: ${operation.title}`;
    result += `\nОписание: ${operation.description}`;
    result += `\nБлок: ${operation.parent ?? 'отсутствует'}`;
  }
  return result;
}

/** Generates a prompt for a block variable. */
export function varBlock(target: Block, oss: OperationSchema): string {
  const blocks = oss.blocks.filter(block => block.parent === target.id);
  const operations = oss.operations.filter(operation => operation.parent === target.id);
  let result = `Название блока: ${target.title}`;
  result += `\nОписание: "${target.description}"`;
  result += '\n\nСодержание';
  result += `\nБлоки: ${blocks.length}`;
  for (const block of blocks) {
    result += `\n\nБлок ${block.id}: ${block.title}`;
    result += `\nОписание: "${block.description}"`;
  }
  result += `\n\nОперации: ${operations.length}`;
  for (const operation of operations) {
    result += `\n\nОперация ${operation.id}: ${operation.alias}`;
    result += `\nНазвание: "${operation.title}"`;
    result += `\nОписание: "${operation.description}"`;
  }
  return result;
}

/** Generates a prompt for a constituenta variable. */
export function varConstituenta(cst: Constituenta): string {
  return JSON.stringify(cst, null, PARAMETER.indentJSON);
}

/** Generates a prompt for a constituenta syntax tree variable. */
export function varSyntaxTree(cst: Constituenta, schema: RSForm): string {
  const ast = schema.analyzer.checkFull(cst.definition_formal).ast;
  let result = `Конституента: ${cst.alias}`;
  result += `\nФормальное выражение: ${cst.definition_formal}`;
  result += `\nДерево синтаксического разбора:\n`;
  result += ast ? JSON.stringify(ast, null, PARAMETER.indentJSON) : 'не определено';
  return result;
}

// ==== Internal functions ====
function stringifyGraph(graph: Graph<number>, schema: RSForm): string {
  let result = '';
  for (const node of graph.nodes.values()) {
    if (node.outputs.length > 0) {
      result += `\n${schema.items.find(cst => cst.id === node.id)!.alias} -> ${node.outputs
        .map(id => schema.items.find(cst => cst.id === id)!.alias)
        .join(', ')}`;
    }
  }
  return result;
}

function stringifySchemaIntro(schema: RSForm): string {
  let result = `Концептуальная схема: ${schema.title}`;
  result += `\nКраткое название: ${schema.alias}`;
  if (schema.description) {
    result += `\nОписание: "${schema.description}"`;
  }
  return result;
}

function stringifyOSSIntro(schema: OperationSchema): string {
  let result = `Операционная схема: ${schema.title}`;
  result += `\nКраткое название: ${schema.alias}`;
  if (schema.description) {
    result += `\nОписание: "${schema.description}"`;
  }
  return result;
}

function stringifyCrucial(cstList: Constituenta[]): string {
  let result = 'Ключевые конституенты: ';
  if (cstList.length === 0) {
    return result + 'отсутствуют';
  }
  result += cstList.map(cst => cst.alias).join(', ');
  return result;
}
