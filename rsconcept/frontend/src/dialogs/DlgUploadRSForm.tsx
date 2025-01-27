'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';

import { IRSFormUploadDTO } from '@/backend/rsform/api';
import { useUploadTRS } from '@/backend/rsform/useUploadTRS';
import Checkbox from '@/components/ui/Checkbox';
import FileInput from '@/components/ui/FileInput';
import Modal from '@/components/ui/Modal';
import { LibraryItemID } from '@/models/library';
import { useDialogsStore } from '@/stores/dialogs';
import { EXTEOR_TRS_FILE } from '@/utils/constants';

export interface DlgUploadRSFormProps {
  itemID: LibraryItemID;
}

function DlgUploadRSForm() {
  const { itemID } = useDialogsStore(state => state.props as DlgUploadRSFormProps);
  const { upload } = useUploadTRS();
  const [loadMetadata, setLoadMetadata] = useState(false);
  const [file, setFile] = useState<File | undefined>();

  const handleSubmit = () => {
    if (!file) {
      return;
    }
    const data: IRSFormUploadDTO = {
      itemID: itemID,
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
  };

  return (
    <Modal
      header='Импорт схемы из Экстеора'
      canSubmit={!!file}
      onSubmit={handleSubmit}
      submitText='Загрузить'
      className='w-[25rem] px-6'
    >
      <FileInput label='Выбрать файл' acceptType={EXTEOR_TRS_FILE} onChange={handleFile} />
      <Checkbox
        label='Загружать название и комментарий'
        className='py-2'
        value={loadMetadata}
        setValue={value => setLoadMetadata(value)}
      />
    </Modal>
  );
}

export default DlgUploadRSForm;
