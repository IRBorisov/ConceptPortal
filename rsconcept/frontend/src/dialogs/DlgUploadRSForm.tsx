import { useState } from 'react';
import { toast } from 'react-toastify';

import Checkbox from '../components/Common/Checkbox';
import FileInput from '../components/Common/FileInput';
import Modal from '../components/Common/Modal';
import { useRSForm } from '../context/RSFormContext';
import { IRSFormUploadData } from '../models/rsform';
import { EXTEOR_TRS_FILE } from '../utils/constants';

interface DlgUploadRSFormProps {
  hideWindow: () => void
}

function DlgUploadRSForm({ hideWindow }: DlgUploadRSFormProps) {
  const { upload } = useRSForm();
  const [loadMetadata, setLoadMetadata] = useState(false);
  const [file, setFile] = useState<File | undefined>()

  const handleSubmit = () => {
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
      setFile(undefined);
    }
  }

  return (
  <Modal
    title='Импорт схемы из Экстеора'
    hideWindow={hideWindow}
    canSubmit={!!file}
    onSubmit={handleSubmit}
    submitText='Загрузить'
    className='w-[20rem] px-6'
  >
    <FileInput
      label='Выбрать файл'
      dimensions='w-full flex items-center'
      acceptType={EXTEOR_TRS_FILE}
      onChange={handleFile}
    />
    <Checkbox
      label='Загружать название и комментарий'
      dimensions='w-fit py-2'
      value={loadMetadata}
      setValue={value => setLoadMetadata(value)}
    />
  </Modal>);
}

export default DlgUploadRSForm;
