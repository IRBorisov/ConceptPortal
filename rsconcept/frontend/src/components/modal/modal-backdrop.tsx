'use client';

interface ModalBackdropProps {
  /** Called when the backdrop is clicked. */
  onHide?: () => void;
}

/** Blurred overlay behind a modal; clicking it invokes {@link onHide}. */
export function ModalBackdrop({ onHide }: ModalBackdropProps) {
  return (
    <>
      <div className='z-bottom fixed inset-0 backdrop-blur-[3px] opacity-50' />
      <div className='z-bottom fixed inset-0 bg-foreground opacity-5' onClick={onHide} />
    </>
  );
}
