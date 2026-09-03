'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';

import { useTx } from '@/i18n';

import { Checkbox, FileInput } from '@/components/input';
import { ModalForm } from '@/components/modal';
import { EXTEOR_TRS_FILE } from '@/utils/constants';
import { assertImportFileSize } from '@/utils/utils';

import { type RSFormUploadDTO } from '../backend/types';

import { useRsformDialogsStore } from './rsform-dialog-store';

export interface DlgUploadRSFormProps {
  onUpload: (data: RSFormUploadDTO) => void;
}

export function DlgUploadRSForm() {
  const tx = useTx();
  const { onUpload } = useRsformDialogsStore(state => state.props as DlgUploadRSFormProps);
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
    const selected = event.target.files?.[0] ?? null;
    if (!selected) {
      setFile(null);
      return;
    }
    try {
      assertImportFileSize(selected);
    } catch (error) {
      toast.error((error as Error).message);
      event.target.value = '';
      setFile(null);
      return;
    }
    setFile(selected);
  };

  return (
    <ModalForm
      header={tx('tx.schema')}
      canSubmit={!!file}
      validationHint={!!file ? '' : tx('tx.general.file.choose.hint')}
      onSubmit={handleSubmit}
      submitText={tx('tx.general.load')}
      className='w-100 px-6 text-sm flex flex-col'
    >
      <FileInput label={tx('tx.general.file.choose')} acceptType={EXTEOR_TRS_FILE} onChange={handleFile} />
      <Checkbox
        label={tx('tx.schema.upload.attributes')}
        className='py-3'
        value={loadMetadata}
        onChange={value => setLoadMetadata(value)}
      />
      <div className='text-destructive'>
        <b>{tx('tx.general.attention')}</b> {tx('tx.schema.upload.constituents')}
      </div>
    </ModalForm>
  );
}
