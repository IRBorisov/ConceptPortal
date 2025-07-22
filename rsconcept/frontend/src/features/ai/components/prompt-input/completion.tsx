import { type CompletionContext } from '@codemirror/autocomplete';

import { describePromptVariable } from '../../labels';
import { type PromptVariableType } from '../../models/prompting';

export function variableCompletions(variables: string[]) {
  return (context: CompletionContext) => {
    let word = context.matchBefore(/\{\{[a-zA-Z.-]*/);
    if (!word && context.explicit) {
      word = { from: context.pos, to: context.pos, text: '' };
    }
    if (!word || (word.from == word.to && !context.explicit)) {
      return null;
    }
    return {
      from: word.from,
      to: word.to,
      options: variables.map(name => ({
        label: `{{${name}}}`,
        info: describePromptVariable(name as PromptVariableType)
      }))
    };
  };
}
