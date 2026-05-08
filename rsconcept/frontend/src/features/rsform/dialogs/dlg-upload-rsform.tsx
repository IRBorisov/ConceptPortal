'use client';

import { useState } from 'react';

import { useTx } from '@/i18n';

import { Checkbox, FileInput } from '@/components/input';
import { ModalForm } from '@/components/modal';
import { useDialogsStore } from '@/stores/dialogs';
import { EXTEOR_TRS_FILE } from '@/utils/constants';

import { type RSFormUploadDTO } from '../backend/types';

export interface DlgUploadRSFormProps {
  onUpload: (data: RSFormUploadDTO) => void;
}

export function DlgUploadRSForm() {
  const tx = useTx();
  const { onUpload } = useDialogsStore(state => state.props as DlgUploadRSFormProps);
  const [loadMetadata, setLoadMetadata] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = () => {
    if (file) {
      onUpload({
        load_metadata: loadMetadata,
        file: file
      });
    }
  };

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    } else {
      setFile(null);
    }
  };

  return (
    <ModalForm
      header={tx('tx.schema')}
      canSubmit={!!file}
      validationHint={!!file ? '' : tx('tx.general.file.choose.hint')}
      onSubmit={handleSubmit}
      submitText={tx('tx.general.load')}
      className='w-100 px-6'
    >
      <FileInput label={tx('tx.general.file.choose')} acceptType={EXTEOR_TRS_FILE} onChange={handleFile} />
      <Checkbox
        label={tx('tx.schema.upload.attributes')}
        className='py-2'
        value={loadMetadata}
        onChange={value => setLoadMetadata(value)}
      />
      <div className='text-destructive'>
        <b>{tx('tx.general.attention')}</b> {tx('tx.schema.upload.constituents')}
      </div>
    </ModalForm>
  );
}
