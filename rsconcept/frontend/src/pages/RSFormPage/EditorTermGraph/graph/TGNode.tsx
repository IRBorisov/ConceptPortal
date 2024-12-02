'use client';

import { useMemo } from 'react';
import { Handle, Position } from 'reactflow';

import { useConceptOptions } from '@/context/ConceptOptionsContext';
import { truncateToLastWord } from '@/utils/utils';

const MAX_LABEL_LENGTH = 65;

export interface TGNodeData {
  fill: string;
  label: string;
  subLabel: string;
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
  const subLabel = useMemo(() => truncateToLastWord(node.data.subLabel, MAX_LABEL_LENGTH), [node.data.subLabel]);

  return (
    <>
      <Handle type='target' position={Position.Top} style={{ opacity: 0 }} />
      <div
        className='w-full h-full cursor-default flex items-center justify-center rounded-full'
        style={{
          backgroundColor: !node.selected ? node.data.fill : colors.bgActiveSelection,
          outlineOffset: '4px',
          outlineStyle: 'solid',
          outlineColor: node.selected ? colors.bgActiveSelection : 'transparent'
        }}
      >
        <div className='absolute top-[9px] left-0 text-center w-full'>{node.data.label}</div>
        <div
          style={{
            WebkitTextStrokeWidth: 2,
            WebkitTextStrokeColor: colors.bgDefault
          }}
        >
          {node.data.label}
        </div>
      </div>
      <Handle type='source' position={Position.Bottom} style={{ opacity: 0 }} />
      {subLabel ? (
        <div
          className='mt-1 w-[150px] px-1 text-center translate-x-[calc(-50%+20px)]'
          style={{
            fontSize: subLabel.length > 15 ? 10 : 12
          }}
        >
          <div
            style={{
              WebkitTextStrokeWidth: 3,
              WebkitTextStrokeColor: colors.bgDefault
            }}
          >
            {subLabel}
          </div>
          <div className='absolute top-0 px-1 left-0 text-center w-full'>{subLabel}</div>
        </div>
      ) : null}
    </>
  );
}

export default TGNode;
