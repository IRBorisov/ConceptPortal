import { toast } from 'react-toastify';
import Modal from '../../components/Common/Modal';
import { CstType } from '../../utils/models';
import { useState } from 'react';

interface CreateCstModalProps {
  show: boolean
  toggle: () => void
  onCreate: (type: CstType) => void
}

function CreateCstModal({show, toggle, onCreate}: CreateCstModalProps) {
  const [validated, setValidated] = useState(false);

  const handleSubmit = () => {
    toast.info('Создание конституент');
  };

  return (
    <Modal 
      title='Создание конституенты'
      show={show}
      toggle={toggle}
      canSubmit={validated}
      onSubmit={handleSubmit}
    >
      <p>Выбор типа конституенты</p>
      <p>Добавить после выбранной или в конец</p>
    </Modal>
  )
}

export default CreateCstModal;