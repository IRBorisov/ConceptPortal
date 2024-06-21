import {
  addEdge,
  type Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  useEdgesState,
  useNodesState
} from '@reactflow/core';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { postSynthesisGraph, runSingleSynthesis } from '@/app/backendAPI.ts';
import { useOSS } from '@/context/OssContext.tsx';
import DlgSelectInputScheme from '@/dialogs/DlgOssGraph/DlgSelectInputScheme.tsx';
import DlgSynthesis from '@/dialogs/DlgOssGraph/DlgSynthesis.tsx';
import { IOperationSchemaData, IRunSynthesis, ISynthesisSubstitution } from '@/models/oss.ts';
import { ISubstitution } from '@/models/rsform.ts';

interface ISynthesisContext {
  synthesisSchemaID: string;
  singleSynthesis: (nodeId: number) => void;
  showSynthesis: () => void;
  showSelectInput: () => void;
  selectNode: (nodeId: string) => void;
  getSelectedNode: () => string | undefined;

  addLibrarySchema: () => void;
  addSynthesisOperation: () => void;
  removeItem: () => void;
  runSynthesisLayer: () => void;

  getNodes: () => Node[];
  getEdges: () => Edge[];

  setNodes: (nodes: Node[]) => void;
  setEdges: (nodes: Edge[]) => void;

  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onNodesDelete: (nodes: Node[]) => void;
  onConnect: (connection: Connection) => void;
  addBind: () => void;

  updateBounds: (nodeId: string, newRsform: number) => void;
  getBind: (nodeId: string) => number | undefined;
  getNodeParentsRsform: (nodeId: string) => number[];
  saveGraph: () => void;

  substitutions: ISynthesisSubstitution[];
  setSubstitutions: React.Dispatch<React.SetStateAction<ISynthesisSubstitution[]>>;
  getSubstitution: (id: string) => ISynthesisSubstitution[];
  updateSubstitution: (id: string, substitution: ISubstitution[]) => void;
}

interface IBoundMap {
  nodeId: string;
  rsformId: number;
}

const SynthesisContext = createContext<ISynthesisContext | null>(null);

interface SynthesisStateProps {
  synthesisSchemaID: string;
  children: React.ReactNode;
}

export const useSynthesis = () => {
  const context = useContext(SynthesisContext);
  if (context === null) {
    throw new Error('useSynthesis has to be used within <SynthesisState.Provider>');
  }
  return context;
};

export const SynthesisState = ({ synthesisSchemaID, children }: SynthesisStateProps) => {
  const [showSynthesisModal, setShowSynthesisModal] = useState(false);
  const [showSelectInputModal, setShowSelectInputModal] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [bounds, setBounds] = useState<IBoundMap[]>([]);
  // const [substitutionBounds, setSubstitutionBounds] = useState<IBoundMap[]>([]);
  const [substitutions, setSubstitutions] = useState<ISynthesisSubstitution[]>([]);

  const ossSchema = useOSS();

  const getSubstitution = (operation_id: string): ISynthesisSubstitution[] => {
    return substitutions.filter(substitution => substitution.operation_id === operation_id);
  };

  const updateSubstitution = (operation_id: string, newElements: ISubstitution[]) => {
    // TODO: Call backend API and reload OSS or use returned data for
    console.log(operation_id);
    console.log(newElements);
    toast('Saving substitution table not supported');
    return;

    // if (!Array.isArray(newElements)) {
    //   console.error('newElements should be an array.');
    //   return;
    // }

    // setSubstitutions(prevSubstitutions => {
    //   // Обновление существующих элементов
    //   const updatedSubstitutions = prevSubstitutions.map(substitution => {
    //     const newElement = newElements.find(el => el.id === substitution.id);
    //     if (newElement) {
    //       // Обновляем только соответствующие элементы
    //       return { ...substitution, ...newElement, operation_id: substitution.operation_id };
    //     }
    //     return substitution;
    //   });

    //   // Добавление новых элементов с присвоением operation_id
    //   const newSubstitutions = newElements
    //     .filter(newElement => !prevSubstitutions.some(sub => sub.id === newElement.id))
    //     .map(newElement => ({ ...newElement, operation_id }));

    //   return [...updatedSubstitutions, ...newSubstitutions];
    // });
  };

  const extractEdgeId = (edgeId: string) => {
    const matches = edgeId.match(/\d+/g);
    const combined = matches ? matches.join('') : '';
    return Number(combined);
  };

  const getBind = useCallback(
    (nodeId: string) => {
      const bound = bounds.find(item => item.nodeId == nodeId);
      return bound ? bound.rsformId : undefined;
    },
    [bounds]
  );

  const getBounds = useCallback(
    (nodeId: string[]) => {
      const parentBounds = bounds.filter(item => item.nodeId in nodeId);
      return parentBounds.map(item => item.rsformId);
    },
    [bounds]
  );

  const getNodeParentsRsform = useCallback(
    (nodeId: string) => {
      const parentEdges = edges.filter(edge => edge.source === nodeId);
      const parentNodeIds = parentEdges.map(edge => edge.target);
      return getBounds(parentNodeIds);
    },
    [getBounds, edges]
  );

  const saveGraph = useCallback(() => {
    if (!ossSchema.schema) {
      return;
    }
    const data: IOperationSchemaData = {
      graph: {
        id: ossSchema.schema?.id,
        status: 'Draft'
      },
      input_nodes: nodes
        .filter(node => node.type == 'input')
        .map(item => ({
          id: item.id,
          vertical_coordinate: item.position.y,
          horizontal_coordinate: item.position.x,
          rsform_id: getBind(item.id)
        })),
      operation_nodes: nodes
        .filter(node => node.type == 'custom')
        .map(item => ({
          id: item.id,
          vertical_coordinate: item.position.y,
          horizontal_coordinate: item.position.x,
          left_parent: getNodeParentsRsform(item.id)[0],
          right_parent: getNodeParentsRsform(item.id)[1],
          rsform_id: getBind(item.id),
          name: 'name',
          status: 'status'
        })),
      edges: edges.map(item => ({
        id: extractEdgeId(item.id),
        decoded_id: item.id,
        source_handle: item.sourceHandle,
        node_from: item.source,
        node_to: item.target
      })),
      substitutions: substitutions
    };

    postSynthesisGraph({
      data: data
    });
  }, [ossSchema, edges, nodes, getBind, substitutions, getNodeParentsRsform]);

  useEffect(() => {
    if (ossSchema.schema !== undefined) {
      const initialNodes = [
        ...ossSchema.schema.input_nodes.map(node => ({
          id: node.id?.toString() || 'null',
          data: { label: '123' },
          position: { x: node.horizontal_coordinate, y: node.vertical_coordinate },
          type: 'input'
        })),
        ...ossSchema.schema.operation_nodes.map(node => ({
          id: node.id?.toString() || 'null',
          data: { label: '123' },
          position: { x: node.horizontal_coordinate, y: node.vertical_coordinate },
          type: 'custom'
        }))
      ];

      const initialEdges = ossSchema.schema.edges.map(edge => ({
        id: edge.decoded_id,
        source: String(edge.node_from),
        sourceHandle: edge.source_handle,
        target: String(edge.node_to)
      }));
      // const initialEdges = [
      //   { id: 'reactflow__edge-2a-0', source: '2', target: '0' },
      //   { id: 'reactflow__edge-2b-1', sourceHandle: 'b', source: '2', target: '1' }
      // ];

      setNodes(initialNodes);
      setEdges(initialEdges);
      setSubstitutions(ossSchema.schema.substitutions);
      [...ossSchema.schema.input_nodes, ...ossSchema.schema.operation_nodes].forEach(node => {
        const nodeId = node.id?.toString() || 'null';
        const rsformId = node.rsform_id; // Предполагаем, что rsform_id есть в данных нод
        updateBounds(nodeId, rsformId);
      });
    }
  }, [ossSchema, setEdges, setNodes]);

  const updateBounds = (nodeId: string, newRsform: number) => {
    setBounds(prevItems => {
      const existingItem = prevItems.find(item => item.nodeId === nodeId);

      if (existingItem) {
        return prevItems.map(item => (item.nodeId === nodeId ? { ...item, rsformId: newRsform } : item));
      } else {
        return [...prevItems, { nodeId: nodeId, rsformId: newRsform }];
      }
    });
  };

  const onConnect = useCallback((params: Connection | Edge) => setEdges(eds => addEdge(params, eds)), [setEdges]);

  const onNodeDelete = useCallback(
    (nodeId: string) => {
      setNodes(nodes => nodes.filter(node => node.id !== nodeId));
      setEdges(edges => edges.filter(edge => edge.source !== nodeId && edge.target !== nodeId));
    },
    [setEdges, setNodes]
  );

  const singleSynthesis = useCallback((operationId: number) => {
    const data: IRunSynthesis = {
      operationId: Number(operationId)
    };
    runSingleSynthesis({ data: data });
  }, []);

  const newLibrarySchema = {
    id: String(nodes.length > 0 ? 1 + Math.max(...nodes.map(item => Number(item.id))) : 0),
    type: 'input',
    position: { x: 250, y: 5 },
    data: {
      label: 'Node 1',
      onDelete: onNodeDelete
    }
  };

  const newOperation = {
    id: String(nodes.length > 0 ? 1 + Math.max(...nodes.map(item => Number(item.id))) : 0),
    type: 'custom',
    position: { x: 350, y: 20 },
    data: {
      label: 'Node 1',
      onDelete: onNodeDelete
    }
  };

  const selectNode = useCallback(
    (nodeId: string) => {
      for (const node of nodes) {
        if (node.id === nodeId) {
          setSelectedNode(node);
          return;
        }
      }
    },
    [nodes]
  );
  return (
    <SynthesisContext.Provider
      value={{
        synthesisSchemaID: synthesisSchemaID,
        singleSynthesis: singleSynthesis,
        showSynthesis: () => setShowSynthesisModal(true),
        showSelectInput: () => setShowSelectInputModal(true),
        selectNode: nodeId => selectNode(nodeId),
        getSelectedNode: () => selectedNode?.id,
        addLibrarySchema: () => {
          setNodes([...nodes, newLibrarySchema]);
        },
        addSynthesisOperation: () => {
          setNodes([...nodes, newOperation]);
        },
        setNodes: (nodes: Node[]) => {
          setNodes(nodes);
        },
        setEdges: (edges: Edge[]) => {
          setEdges(edges);
        },
        getNodes: () => nodes,
        getEdges: () => edges,
        onNodesChange: onNodesChange,
        onEdgesChange: onEdgesChange,
        onConnect: onConnect,
        updateBounds: updateBounds,
        getNodeParentsRsform: getNodeParentsRsform,
        getBind: getBind,
        saveGraph: saveGraph,
        setSubstitutions: setSubstitutions,
        substitutions: substitutions,
        updateSubstitution: updateSubstitution,
        getSubstitution: getSubstitution
      }}
    >
      {showSynthesisModal ? (
        <DlgSynthesis
          hideWindow={() => setShowSynthesisModal(false)}
          nodeId={selectedNode!.id}
          onSynthesis={() => singleSynthesis}
        />
      ) : null}
      {showSelectInputModal ? (
        <DlgSelectInputScheme nodeId={selectedNode!.id} hideWindow={() => setShowSelectInputModal(false)} />
      ) : null}
      {children}
    </SynthesisContext.Provider>
  );
};
