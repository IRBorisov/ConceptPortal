'use client';

import { useState } from 'react';

import { OssFlowContext } from './oss-flow-context';

export const OssFlowState = ({ children }: React.PropsWithChildren) => {
  const [dropTarget, setDropTarget] = useState<number | null>(null);
  const [containMovement, setContainMovement] = useState(false);

  return (
    <OssFlowContext
      value={{
        dropTarget,
        setDropTarget,

        containMovement,
        setContainMovement
      }}
    >
      {children}
    </OssFlowContext>
  );
};
