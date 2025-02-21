import { type EdgeProps, SimpleBezierEdge } from 'reactflow';

import { APP_COLORS } from '@/styling/colors';

/**
 * Represents graph TMGraph edge internal data.
 */
export interface MGraphEdgeProps extends EdgeProps {
  data?: { indices: number[] };
}

export function CartesianEdge({ data, ...restProps }: MGraphEdgeProps) {
  return (
    <>
      <SimpleBezierEdge
        {...restProps}
        label={data?.indices.join(', ')}
        labelBgStyle={{ fill: APP_COLORS.bgDefault }}
        labelStyle={{ fill: APP_COLORS.fgDefault }}
      />
    </>
  );
}
