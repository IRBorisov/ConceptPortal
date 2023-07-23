import Modal from '../../components/Common/Modal';
import { CstType } from '../../utils/models';
import Select from 'react-select';
import { CstTypeSelector } from '../../utils/staticUI';
import { useEffect, useState } from 'react';

interface CreateCstModalProps {
  show: boolean
  toggle: () => void
  onCreate: (type: CstType) => void
}

function CreateCstModal({show, toggle, onCreate}: CreateCstModalProps) {
  const [validated, setValidated] = useState(false);
  const [selectedType, setSelectedType] = useState<CstType|undefined>(undefined);

  const handleSubmit = () => {
    if (selectedType) onCreate(selectedType);
  };

  useEffect(() => {
    setValidated(selectedType !== undefined);
  }, [selectedType]
  );

  return (
    <Modal 
      title='Создание конституенты'
      show={show}
      toggle={toggle}
      canSubmit={validated}
      onSubmit={handleSubmit}
    >
      <Select 
        options={CstTypeSelector}
        placeholder='Выберите тип'
        onChange={(data) => setSelectedType(data?.value)}
      />
    </Modal>
  )
}

export default CreateCstModal;