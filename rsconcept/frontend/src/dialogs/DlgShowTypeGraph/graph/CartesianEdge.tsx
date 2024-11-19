import { SimpleBezierEdge } from 'reactflow';

import { useConceptOptions } from '@/context/ConceptOptionsContext';
import { MGraphEdgeInternal } from '@/models/miscellaneous';

function CartesianEdge({ data, ...restProps }: MGraphEdgeInternal) {
  const { colors } = useConceptOptions();
  return (
    <>
      <SimpleBezierEdge
        {...restProps}
        label={data?.indices.join(', ')}
        labelBgStyle={{ fill: colors.bgDefault }}
        labelStyle={{ fill: colors.fgDefault }}
      />
    </>
  );
}

export default CartesianEdge;
