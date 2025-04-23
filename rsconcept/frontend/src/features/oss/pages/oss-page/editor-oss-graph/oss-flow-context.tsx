'use client';

import { createContext, use } from 'react';

interface IOssFlowContext {
  isDragging: boolean;
  setIsDragging: React.Dispatch<React.SetStateAction<boolean>>;
  dropTarget: number | null;
  setDropTarget: React.Dispatch<React.SetStateAction<number | null>>;
  containMovement: boolean;
  setContainMovement: React.Dispatch<React.SetStateAction<boolean>>;
}

export const OssFlowContext = createContext<IOssFlowContext | null>(null);
export const useOssFlow = () => {
  const context = use(OssFlowContext);
  if (context === null) {
    throw new Error('useOssFlow has to be used within <OssFlowState>');
  }
  return context;
};
