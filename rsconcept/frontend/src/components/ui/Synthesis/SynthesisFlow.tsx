import {useCallback} from 'react';
import {
    ReactFlow,
    addEdge,
    useNodesState,
    useEdgesState,
    type Connection,
    type Edge,
    type Node,
} from '@reactflow/core';

import OperationNode from './OperationNode';
import InputNode from './InputNode';

// this is important! You need to import the styles from the lib to make it work
import '@reactflow/core/dist/style.css';

import './SynthesisFlow.css';
import DlgSynthesis from "@/dialogs/DlgSynthesis.tsx";

const nodeTypes = {
    custom: OperationNode,
    input: InputNode,
};

const initialNodes: Node[] = [
    {
        id: '1',
        type: 'input',
        data: {label: 'Node 1'},
        position: {x: 250, y: 5},
    },
    {
        type: 'input',
        id: '2',
        data: {label: 'Node 2'},
        position: {x: 100, y: 100},
    },
    {
        id: '3',
        data: {label: 'Node 3'},
        position: {x: 400, y: 100},
        type: 'custom',

    },
    {
        id: '4',
        data: {label: 'Node 4'},
        position: {x: 400, y: 200},
        type: 'custom',
    },
];

const initialEdges: Edge[] = [
    //{ id: 'e1-2', source: '1', target: '2', animated: true },
    //{ id: 'e1-3', source: '1', target: '3', animated: true },
];

function Flow() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const onConnect = useCallback(
        (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );


    return (
        <div className="Flow" style={{height: 800, width: 1000}}>
            <ReactFlow
                nodes={nodes}
                onNodesChange={onNodesChange}
                edges={edges}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
                nodeTypes={nodeTypes}
            />
        </div>
    );
}

export default Flow;
