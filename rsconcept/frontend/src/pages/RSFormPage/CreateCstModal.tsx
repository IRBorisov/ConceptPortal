import { useEffect, useState } from 'react';
import Select from 'react-select';

import Modal from '../../components/Common/Modal';
import { type CstType } from '../../utils/models';
import { CstTypeSelector, getCstTypeLabel } from '../../utils/staticUI';

interface CreateCstModalProps {
  show: boolean
  toggle: () => void
  defaultType?: CstType
  onCreate: (type: CstType) => void
}

function CreateCstModal({ show, toggle, defaultType, onCreate }: CreateCstModalProps) {
  const [validated, setValidated] = useState(false);
  const [selectedType, setSelectedType] = useState<CstType | undefined>(undefined);

  const handleSubmit = () => {
    if (selectedType) onCreate(selectedType);
  };

  useEffect(() => {
    setSelectedType(defaultType);
  }, [defaultType]);

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
        filterOption={null}
        value={selectedType && { value: selectedType, label: getCstTypeLabel(selectedType) }}
        onChange={(data) => { setSelectedType(data?.value); }}
      />
    </Modal>
  )
}

export default CreateCstModal;
