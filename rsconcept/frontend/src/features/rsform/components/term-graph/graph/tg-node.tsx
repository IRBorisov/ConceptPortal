'use client';

import { Handle, type NodeProps, Position } from '@xyflow/react';
import clsx from 'clsx';

import { type Constituenta } from '@/domain/library';
import { isBasicConcept } from '@/domain/library/rsform-api';
import { labelType } from '@/domain/rslang/labels';
import { useTx } from '@/i18n';

import { useValueTooltipStore } from '@/stores/value-tooltip';
import { APP_COLORS } from '@/styling/colors';
import { globalIDs } from '@/utils/constants';

import { colorBgGraphNode } from '../../../colors';
import { useTermGraphStore, useTGConnectionStore } from '../../../stores/term-graph';

import { type TGNode } from './tg-models';

const DESCRIPTION_THRESHOLD = 15;
const LABEL_THRESHOLD = 3;

export function TGNodeComponent(node: NodeProps<TGNode>) {
  const tx = useTx();
  const filter = useTermGraphStore(state => state.filter);
  const coloring = useTermGraphStore(state => state.coloring);
  const connectionStart = useTGConnectionStore(state => state.start);
  const setActiveTooltipText = useValueTooltipStore(state => state.setActiveText);
  const isConnecting = connectionStart !== null;

  const label = node.data.cst.alias;
  const description = filter.noText ? '' : node.data.cst.term_resolved || node.data.cst.definition_resolved;
  const tooltipText = describeCstNode(node.data.cst, tx);

  return (
    <>
      <div
        className='relative h-full w-full pointer-events-auto! border rounded-full cc-fade-in duration-transform delay-move'
        data-tooltip-id={globalIDs.value_tooltip}
        onPointerEnter={() => setActiveTooltipText(tooltipText)}
      >
        {connectionStart !== node.id ? (
          <Handle
            type='target'
            position={Position.Top}
            className='rf-handle rf-handle-target'
            isConnectableStart={false}
          />
        ) : null}
        {!isConnecting ? (
          <Handle
            type='source'
            position={Position.Bottom}
            className={clsx('rf-handle rf-handle-source', isConnecting && 'pointer-events-none')}
          />
        ) : null}
        <div
          className={clsx(
            'w-full h-full flex items-center justify-center rounded-full rf-node-outline',
            node.data.cst.crucial && 'text-primary',
            node.data.focused && 'border-2 border-selected',
            label.length > LABEL_THRESHOLD ? 'text-[12px]/[16px]' : 'text-[14px]/[20px]'
          )}
          style={{
            backgroundColor: node.selected
              ? APP_COLORS.bgActiveSelection
              : node.data.focused
                ? APP_COLORS.bgDefault
                : colorBgGraphNode(node.data.cst, coloring)
          }}
        >
          <div className='cc-node-label'>{label}</div>
        </div>
      </div>
      {description ? (
        <div
          className={clsx(
            node.data.cst.crucial && 'text-primary',
            'mt-[4px] w-[150px] px-[4px] text-center translate-x-[calc(-50%+20px)]',
            'pointer-events-none',
            'cc-fade-in duration-transform delay-move',
            description.length > DESCRIPTION_THRESHOLD ? 'text-[10px]/[12px]' : 'text-[12px]/[16px]'
          )}
        >
          <div className='absolute top-0 px-[4px] left-0 text-center w-full line-clamp-3 hover:line-clamp-none'>
            {description}
          </div>
          <div aria-hidden className='line-clamp-3 hover:line-clamp-none cc-text-outline'>
            {description}
          </div>
        </div>
      ) : null}
    </>
  );
}

// ====== INTERNAL ======
function describeCstNode(
  cst: Constituenta,
  tx: (id: string, values?: Record<string, string | number | boolean | Date | null | undefined>) => string
) {
  const contents = isBasicConcept(cst.cst_type)
    ? cst.convention
    : cst.definition_resolved || cst.definition_formal || cst.convention;
  const typification = labelType(cst.analysis?.type ?? null);
  return `${cst.alias}${tx('tx.general.colon')}${cst.term_resolved}\n${
    cst.analysis ? `${tx('tx.rslang.typification')}${tx('tx.general.colon')}${typification}\n` : ''
  }${tx('tx.lib.contents')}${tx('tx.general.colon')}${contents ? contents : tx('tx.general.none').toLocaleLowerCase()}`;
}
