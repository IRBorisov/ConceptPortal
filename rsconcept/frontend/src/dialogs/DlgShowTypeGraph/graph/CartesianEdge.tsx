import { SimpleBezierEdge } from 'reactflow';

import { MGraphEdgeInternal } from '@/models/miscellaneous';
import { APP_COLORS } from '@/styling/color';

function CartesianEdge({ data, ...restProps }: MGraphEdgeInternal) {
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

export default CartesianEdge;
