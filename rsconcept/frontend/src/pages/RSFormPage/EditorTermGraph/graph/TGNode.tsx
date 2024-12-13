'use client';

import { Handle, Position } from 'reactflow';

import { useConceptOptions } from '@/context/ConceptOptionsContext';
import { truncateToLastWord } from '@/utils/utils';

const MAX_DESCRIPTION_LENGTH = 65;
const DESCRIPTION_THRESHOLD = 15;
const LABEL_THRESHOLD = 3;

const FONT_SIZE_MAX = 14;
const FONT_SIZE_MED = 12;
const FONT_SIZE_MIN = 10;

export interface TGNodeData {
  fill: string;
  label: string;
  description: string;
}

/**
 * Represents graph AST node internal data.
 */
interface TGNodeInternal {
  id: string;
  data: TGNodeData;
  selected: boolean;
  dragging: boolean;
  xPos: number;
  yPos: number;
}

function TGNode(node: TGNodeInternal) {
  const { colors } = useConceptOptions();
  const description = truncateToLastWord(node.data.description, MAX_DESCRIPTION_LENGTH);

  return (
    <>
      <Handle type='target' position={Position.Top} style={{ opacity: 0 }} />
      <div
        className='w-full h-full cursor-default flex items-center justify-center rounded-full'
        style={{
          backgroundColor: !node.selected ? node.data.fill : colors.bgActiveSelection,
          fontSize: node.data.label.length > LABEL_THRESHOLD ? FONT_SIZE_MED : FONT_SIZE_MAX
        }}
      >
        <div
          style={{
            fontWeight: 600,
            WebkitTextStrokeWidth: '0.6px',
            WebkitTextStrokeColor: colors.bgDefault
          }}
        >
          {node.data.label}
        </div>
      </div>
      <Handle type='source' position={Position.Bottom} style={{ opacity: 0 }} />
      {description ? (
        <div
          className='mt-1 w-[150px] px-1 text-center translate-x-[calc(-50%+20px)]'
          style={{
            fontSize: description.length > DESCRIPTION_THRESHOLD ? FONT_SIZE_MIN : FONT_SIZE_MED
          }}
        >
          <div className='absolute top-0 px-1 left-0 text-center w-full'>{description}</div>
          <div
            aria-hidden='true'
            style={{
              WebkitTextStrokeWidth: '3px',
              WebkitTextStrokeColor: colors.bgDefault
            }}
          >
            {description}
          </div>
        </div>
      ) : null}
    </>
  );
}

export default TGNode;
