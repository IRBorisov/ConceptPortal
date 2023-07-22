import { useRef } from 'react'
import Button from './Button'
import useClickedOutside from '../../hooks/useClickedOutside'

interface ModalProps {
  title?: string
  submitText?: string
  show: boolean
  canSubmit: boolean
  toggle: () => void
  onSubmit: () => void
  onCancel?: () => void
  children: React.ReactNode
}

function Modal({title, show, toggle, onSubmit, onCancel, canSubmit, children, submitText='Продолжить'}: ModalProps) {
  const ref = useRef(null);
  useClickedOutside({ref: ref, callback: toggle})

  if (!show) {
    return null;
  }

  const handleCancel = () => {
    toggle();
    if(onCancel) onCancel();
  };

  return (
    <>
    <div className='fixed top-0 left-0 w-full h-full clr-modal opacity-50 z-50'>
    </div>
    <div ref={ref} className='fixed bottom-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 px-6 py-4 flex flex-col w-fit z-[60] clr-card border shadow-md'>
      { title && <h1 className='mb-4 text-xl font-bold'>{title}</h1> }
      <div className='py-2'>
        {children}
      </div>
      <div className='pt-4 mt-2 border-t-4 flex justify-between w-full'>
        <Button
          text={submitText}
          widthClass='min-w-[6rem] w-fit h-fit'
          colorClass='clr-btn-primary'
          disabled={!canSubmit}
          onClick={onSubmit}
        />
        <Button 
          text='Отмена'
          onClick={handleCancel}
        />
      </div>
    </div>
    </>
  );
}

export default Modal;