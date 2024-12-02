'use client';

import { useMemo } from 'react';
import { Handle, Position } from 'reactflow';

import { useConceptOptions } from '@/context/ConceptOptionsContext';
import { ISyntaxTreeNode } from '@/models/rslang';
import { colorBgSyntaxTree } from '@/styling/color';
import { labelSyntaxTree } from '@/utils/labels';

/**
 * Represents graph AST node internal data.
 */
interface ASTNodeInternal {
  id: string;
  data: ISyntaxTreeNode;
  dragging: boolean;
  selected: boolean;
  xPos: number;
  yPos: number;
}

function ASTNode(node: ASTNodeInternal) {
  const { colors } = useConceptOptions();
  const label = useMemo(() => labelSyntaxTree(node.data), [node.data]);

  return (
    <>
      <Handle type='target' position={Position.Top} style={{ opacity: 0 }} />
      <div
        className='w-full h-full cursor-default flex items-center justify-center rounded-full'
        style={{ backgroundColor: colorBgSyntaxTree(node.data, colors) }}
      />
      <Handle type='source' position={Position.Bottom} style={{ opacity: 0 }} />
      <div
        className='font-math mt-1 w-fit text-center translate-x-[calc(-50%+20px)]'
        style={{ fontSize: label.length > 3 ? 12 : 14 }}
      >
        <div className='absolute top-0 left-0 text-center w-full'>{label}</div>
        <div
          style={{
            WebkitTextStrokeWidth: 2,
            WebkitTextStrokeColor: colors.bgDefault
          }}
        >
          {label}
        </div>
      </div>
    </>
  );
}

export default ASTNode;
