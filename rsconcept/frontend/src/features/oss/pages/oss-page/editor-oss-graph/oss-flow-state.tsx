'use client';

import { useState } from 'react';

import { OssFlowContext } from './oss-flow-context';

export const OssFlowState = ({ children }: React.PropsWithChildren) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dropTarget, setDropTarget] = useState<number | null>(null);
  const [containMovement, setContainMovement] = useState(false);

  return (
    <OssFlowContext
      value={{
        isDragging,
        setIsDragging,

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
