// Module: Natural language model declarations.


// ====== Text morphology ========


// ====== Reference resolution =====
export interface IRefsText {
  text: string
}

export enum ReferenceType {
  ENTITY = 'entity',
  SYNTACTIC = 'syntax'
}
export interface IEntityReference {
  entity: string
  form: string
}

export interface ISyntacticReference {
  offset: number
  nominal: string
}

export interface ITextPosition {
  start: number
  finish: number
}

export interface IResolvedReference {
  type: ReferenceType
  data: IEntityReference | ISyntacticReference
  pos_input: ITextPosition
  pos_output: ITextPosition
}

export interface IReferenceData {
  input: string
  output: string
  refs: IResolvedReference[]
}
