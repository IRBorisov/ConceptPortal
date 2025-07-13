/** Represents AI prompt. */
export interface IPromptTemplate {
  id: number;
  owner: number | null;
  is_shared: boolean;
  label: string;
  description: string;
  text: string;
}

// ========= SCHEMAS ========
