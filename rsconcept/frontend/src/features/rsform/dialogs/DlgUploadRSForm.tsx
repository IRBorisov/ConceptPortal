'use client';

import { useState } from 'react';

import { Checkbox, FileInput } from '@/components/Input';
import { ModalForm } from '@/components/Modal';
import { useDialogsStore } from '@/stores/dialogs';
import { EXTEOR_TRS_FILE } from '@/utils/constants';

import { useUploadTRS } from '../backend/useUploadTRS';

export interface DlgUploadRSFormProps {
  itemID: number;
}

function DlgUploadRSForm() {
  const { itemID } = useDialogsStore(state => state.props as DlgUploadRSFormProps);
  const { upload } = useUploadTRS();
  const [loadMetadata, setLoadMetadata] = useState(false);
  const [file, setFile] = useState<File | undefined>();

  const handleSubmit = () => {
    if (file) {
      void upload({
        itemID: itemID,
        load_metadata: loadMetadata,
        file: file,
        fileName: file.name
      });
    }
    return true;
  };

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    } else {
      setFile(undefined);
    }
  };

  return (
    <ModalForm
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
        onChange={value => setLoadMetadata(value)}
      />
    </ModalForm>
  );
}

export default DlgUploadRSForm;
