/**
 * Module: Schema of Synthesis Operations.
 */

import { ISubstitution } from '@/models/rsform.ts';

import { ILibraryItemData } from './library';
import { UserID } from './user';

/**
 * Represents backend data for Schema of Synthesis Operations.
 */
export interface IOperationSchemaData extends ILibraryItemData {
  input_nodes: IInputNode[];
  operation_nodes: ISynthesisNode[];
  edges: ISynthesisEdge[];
  substitutions: ISynthesisSubstitution[];
  graph: ISynthesisGraph;
}

interface ISynthesisGraph {
  id: number;
  status: string;
}

interface IInputNode {
  id: number | null;
  graph_id: number;
  vertical_coordinate: number;
  horizontal_coordinate: number;
  rsform_id: number;
}

interface ISynthesisNode extends IInputNode {
  id: number | null;
  name: string;
  status: string;
}

interface ISynthesisEdge {
  id: number | null;
  decoded_id: string;
  source_handle: string;
  graph_id: number;
  node_from: string;
  node_to: string;
}

export interface ISynthesisSubstitution extends ISubstitution {
  id: number | null;
  graph_id: number;
  operation_id: string;
}

export interface IRunSynthesis {
  operationId: number;
}

export interface IRunSynthesisResponse {
  rsformId: number;
}

/**
 * Represents Schema of Synthesis Operations.
 */
export interface IOperationSchema extends IOperationSchemaData {
  subscribers: UserID[];
  editors: UserID[];
}
