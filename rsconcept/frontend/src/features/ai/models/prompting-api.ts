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
