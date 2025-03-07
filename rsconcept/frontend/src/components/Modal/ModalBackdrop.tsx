'use client';

import clsx from 'clsx';

interface ModalBackdropProps {
  onHide: () => void;
}

export function ModalBackdrop({ onHide }: ModalBackdropProps) {
  return (
    <>
      <div className={clsx('z-bottom', 'fixed top-0 left-0', 'w-full h-full', 'backdrop-blur-[3px] opacity-50')} />
      <div
        className={clsx('z-bottom', 'fixed top-0 left-0', 'w-full h-full', 'bg-prim-0 opacity-25')}
        onClick={onHide}
      />
    </>
  );
}
