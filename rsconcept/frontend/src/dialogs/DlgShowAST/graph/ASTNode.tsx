'use client';

import { Handle, Position } from 'reactflow';

import { ISyntaxTreeNode } from '@/models/rslang';
import { APP_COLORS, colorBgSyntaxTree } from '@/styling/color';
import { labelSyntaxTree } from '@/utils/labels';

const FONT_SIZE_MAX = 14;
const FONT_SIZE_MED = 12;

const LABEL_THRESHOLD = 3;

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
  const label = labelSyntaxTree(node.data);

  return (
    <>
      <Handle type='target' position={Position.Top} style={{ opacity: 0 }} />
      <div
        className='w-full h-full cursor-default flex items-center justify-center rounded-full'
        style={{ backgroundColor: colorBgSyntaxTree(node.data) }}
      />
      <Handle type='source' position={Position.Bottom} style={{ opacity: 0 }} />
      <div
        className='font-math mt-1 w-fit text-center translate-x-[calc(-50%+20px)]'
        style={{ fontSize: label.length > LABEL_THRESHOLD ? FONT_SIZE_MED : FONT_SIZE_MAX }}
      >
        <div className='absolute top-0 left-0 text-center w-full'>{label}</div>
        <div
          aria-hidden='true'
          style={{
            WebkitTextStrokeWidth: 2,
            WebkitTextStrokeColor: APP_COLORS.bgDefault
          }}
        >
          {label}
        </div>
      </div>
    </>
  );
}

export default ASTNode;
