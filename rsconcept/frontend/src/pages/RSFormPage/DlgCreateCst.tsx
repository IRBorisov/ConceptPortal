import { useEffect, useState } from 'react';

import ConceptSelect from '../../components/Common/ConceptSelect';
import Modal from '../../components/Common/Modal';
import { type CstType } from '../../utils/models';
import { CstTypeSelector, getCstTypeLabel } from '../../utils/staticUI';

interface DlgCreateCstProps {
  hideWindow: () => void
  defaultType?: CstType
  onCreate: (type: CstType) => void
}

function DlgCreateCst({ hideWindow, defaultType, onCreate }: DlgCreateCstProps) {
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
      hideWindow={hideWindow}
      canSubmit={validated}
      onSubmit={handleSubmit}
    >
      <ConceptSelect
        options={CstTypeSelector}
        placeholder='Выберите тип'
        values={selectedType ? [{ value: selectedType, label: getCstTypeLabel(selectedType) }] : []}
        onChange={data => { setSelectedType(data.length > 0 ? data[0].value : undefined); }}
      />
    </Modal>
  );
}

export default DlgCreateCst;
