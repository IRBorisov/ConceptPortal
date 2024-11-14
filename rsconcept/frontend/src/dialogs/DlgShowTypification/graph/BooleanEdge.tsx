import { StraightEdge } from 'reactflow';

import { MGraphEdgeInternal } from '@/models/miscellaneous';

function BooleanEdge(props: MGraphEdgeInternal) {
  return (
    <>
      <StraightEdge {...props} />
    </>
  );
}

export default BooleanEdge;
