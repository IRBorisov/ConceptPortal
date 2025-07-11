/** Represents AI prompt. */
export interface IPromptTemplate {
  id: number;
  owner: number | null;
  label: string;
  description: string;
  text: string;
}
