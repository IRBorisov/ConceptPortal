import { type IBlock, type IOperationSchema, NodeType } from '@/features/oss/models/oss';
import { type IConstituenta, type IRSForm } from '@/features/rsform';
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
export function varSchema(schema: IRSForm): string {
  let result = stringifySchemaIntro(schema);
  result += '\n\nКонституенты:';
  schema.items.forEach(item => {
    result += `\n${item.alias} - "${labelType(item.analysis.type)}" - "${item.term_resolved}" - "${item.definition_formal
      }" - "${item.definition_resolved}" - "${item.convention}"`;
  });
  result += `\n${stringifyCrucial(schema.items.filter(cst => cst.crucial))}`;
  result += '\n\nСвязи "атрибутирован":';
  const attributionGraph = stringifyGraph(schema.attribution_graph, schema);
  result += attributionGraph ? attributionGraph : ' отсутствуют';
  return result;
}

/** Generates a prompt for a schema thesaurus variable. */
export function varSchemaThesaurus(schema: IRSForm): string {
  let result = stringifySchemaIntro(schema);
  result += '\n\nТермины:';
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
export function varSchemaTypeGraph(schema: IRSForm): string {
  const graph = new TypificationGraph();
  schema.items.forEach(item => {
    if (item.analysis.type !== null && isTypification(item.analysis.type)) {
      graph.addElement(item.alias, item.analysis.type);
    }
  });

  let result = stringifySchemaIntro(schema);
  result += '\n\nСтупени\n';
  result += JSON.stringify(graph.nodes, null, PARAMETER.indentJSON);
  return result;
}

/** Generates a prompt for a OSS variable. */
export function varOSS(oss: IOperationSchema): string {
  let result = stringifyOSSIntro(oss);
  result += `\n\nБлоки: ${oss.blocks.length}\n`;
  oss.hierarchy.topologicalOrder().forEach(blockID => {
    const block = oss.itemByNodeID.get(blockID);
    if (block?.nodeType !== NodeType.BLOCK) {
      return;
    }
    result += `\n\nБлок ${block.id}: ${block.title}`;
    result += `\nОписание: ${block.description}`;
    result += `\nПредок: "${block.parent ?? 'отсутствует'}"`;
  });
  result += `\n\nОперации: ${oss.operations.length}`;
  oss.operations.forEach(operation => {
    result += `\n\nОперация ${operation.id}: ${operation.alias}`;
    result += `\nНазвание: ${operation.title}`;
    result += `\nОписание: ${operation.description}`;
    result += `\nБлок: ${operation.parent ?? 'отсутствует'}`;
  });
  return result;
}

/** Generates a prompt for a block variable. */
export function varBlock(target: IBlock, oss: IOperationSchema): string {
  const blocks = oss.blocks.filter(block => block.parent === target.id);
  const operations = oss.operations.filter(operation => operation.parent === target.id);
  let result = `Название блока: ${target.title}`;
  result += `\nОписание: "${target.description}"`;
  result += '\n\nСодержание';
  result += `\nБлоки: ${blocks.length}`;
  blocks.forEach(block => {
    result += `\n\nБлок ${block.id}: ${block.title}`;
    result += `\nОписание: "${block.description}"`;
  });
  result += `\n\nОперации: ${operations.length}`;
  operations.forEach(operation => {
    result += `\n\nОперация ${operation.id}: ${operation.alias}`;
    result += `\nНазвание: "${operation.title}"`;
    result += `\nОписание: "${operation.description}"`;
  });
  return result;
}

/** Generates a prompt for a constituenta variable. */
export function varConstituenta(cst: IConstituenta): string {
  return JSON.stringify(cst, null, PARAMETER.indentJSON);
}

/** Generates a prompt for a constituenta syntax tree variable. */
export function varSyntaxTree(cst: IConstituenta): string {
  let result = `Конституента: ${cst.alias}`;
  result += `\nФормальное выражение: ${cst.definition_formal}`;
  result += `\nДерево синтаксического разбора:\n`;
  result += cst.analysis ? JSON.stringify(cst.analysis.ast, null, PARAMETER.indentJSON) : 'не определено';
  return result;
}

// ==== Internal functions ====
function stringifyGraph(graph: Graph<number>, schema: IRSForm): string {
  let result = '';
  graph.nodes.forEach(node => {
    if (node.outputs.length > 0) {
      result += `\n${schema.items.find(cst => cst.id === node.id)!.alias} -> ${node.outputs
        .map(id => schema.items.find(cst => cst.id === id)!.alias)
        .join(', ')}`;
    }
  });
  return result;
}

function stringifySchemaIntro(schema: IRSForm): string {
  let result = `Концептуальная схема: ${schema.title}`;
  result += `\nКраткое название: ${schema.alias}`;
  if (schema.description) {
    result += `\nОписание: "${schema.description}"`;
  }
  return result;
}

function stringifyOSSIntro(schema: IOperationSchema): string {
  let result = `Операционная схема: ${schema.title}`;
  result += `\nКраткое название: ${schema.alias}`;
  if (schema.description) {
    result += `\nОписание: "${schema.description}"`;
  }
  return result;
}

function stringifyCrucial(cstList: IConstituenta[]): string {
  let result = 'Ключевые конституенты: ';
  if (cstList.length === 0) {
    return result + 'отсутствуют';
  }
  result += cstList.map(cst => cst.alias).join(', ');
  return result;
}
