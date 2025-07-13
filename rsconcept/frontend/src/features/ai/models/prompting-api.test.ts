import { extractPromptVariables } from './prompting-api';

describe('extractPromptVariables', () => {
  it('extracts a single variable', () => {
    expect(extractPromptVariables('Hello {{name}}!')).toEqual(['name']);
  });

  it('extracts multiple variables', () => {
    expect(extractPromptVariables('Hi {{firstName}}, your ID is {{user.id}}.')).toEqual(['firstName', 'user.id']);
  });

  it('extracts variables with hyphens and dots', () => {
    expect(extractPromptVariables('Welcome {{user-name}} and {{user.name}}!')).toEqual(['user-name', 'user.name']);
  });

  it('returns empty array if no variables', () => {
    expect(extractPromptVariables('No variables here!')).toEqual([]);
  });

  it('ignores invalid variable patterns', () => {
    expect(extractPromptVariables('Hello {name}, {{name!}}, {{123}}, {{user_name}}')).toEqual([]);
  });

  it('extracts repeated variables', () => {
    expect(extractPromptVariables('Repeat: {{foo}}, again: {{foo}}')).toEqual(['foo', 'foo']);
  });

  it('works with adjacent variables', () => {
    expect(extractPromptVariables('{{a}}{{b}}{{c}}')).toEqual(['a', 'b', 'c']);
  });

  it('returns empty array for empty string', () => {
    expect(extractPromptVariables('')).toEqual([]);
  });

  it('extracts variables at string boundaries', () => {
    expect(extractPromptVariables('{{start}} middle {{end}}')).toEqual(['start', 'end']);
  });
});
