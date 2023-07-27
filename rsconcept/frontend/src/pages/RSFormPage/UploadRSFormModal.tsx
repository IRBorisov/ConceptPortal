import { useState } from 'react';
import { toast } from 'react-toastify';

import Checkbox from '../../components/Common/Checkbox';
import FileInput from '../../components/Common/FileInput';
import Modal from '../../components/Common/Modal';
import { useRSForm } from '../../context/RSFormContext';
import { IRSFormUploadData } from '../../utils/models';

interface UploadRSFormModalProps {
  show: boolean
  hideWindow: () => void
}

function UploadRSFormModal({ show, hideWindow }: UploadRSFormModalProps) {
  const { upload } = useRSForm();
  const [loadMetadata, setLoadMetadata] = useState(false);
  const [file, setFile] = useState<File | undefined>()

  const handleSubmit = () => {
    hideWindow();
    if (!file) {
      return;
    }
    const data: IRSFormUploadData = {
      load_metadata: loadMetadata,
      file: file,
      fileName: file.name
    };
    upload(data, () => toast.success('Схема загружена из файла'));
  };

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    } else {
      setFile(undefined)
    }
  }

  return (
    <Modal
      title='Загрузка схемы из Экстеор'
      show={show}
      hideWindow={hideWindow}
      canSubmit={!!file}
      onSubmit={handleSubmit}
    >
      <div className='max-w-[20rem]'>
      <FileInput label='Загрузить файл'
          acceptType='.trs'
          onChange={handleFile}
        />
      <Checkbox label='Загружать метаданные'
        value={loadMetadata}
        onChange={event => { setLoadMetadata(event.target.checked); }}
      />
      </div>
    </Modal>
  )
}

export default UploadRSFormModal;
