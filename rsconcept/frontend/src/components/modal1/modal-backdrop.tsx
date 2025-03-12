'use client';

interface ModalBackdropProps {
  onHide?: () => void;
}

export function ModalBackdrop({ onHide }: ModalBackdropProps) {
  return (
    <>
      <div className='z-bottom fixed inset-0 backdrop-blur-[3px] opacity-50' />
      <div className='z-bottom fixed inset-0 bg-prim-0 opacity-25' onClick={onHide} />
    </>
  );
}
