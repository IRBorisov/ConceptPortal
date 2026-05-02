'use client';

import { useState } from 'react';

import { formatLabel, lid, useTx } from '@/i18n';

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
      header={tx('ui.dlg.uploadRsform.header')}
      canSubmit={!!file}
      validationHint={!!file ? '' : formatLabel(lid.hint.fileEmpty)}
      onSubmit={handleSubmit}
      submitText={tx('ui.action.upload')}
      className='w-100 px-6'
    >
      <FileInput
        label={tx('ui.dlg.uploadRsform.pickFile')}
        acceptType={EXTEOR_TRS_FILE}
        onChange={handleFile}
      />
      <Checkbox
        label={tx('ui.dlg.uploadRsform.loadMetadata')}
        className='py-2'
        value={loadMetadata}
        onChange={value => setLoadMetadata(value)}
      />
      <div className='text-destructive'>
        <b>{tx('ui.dlg.uploadRsform.attention')}</b>{' '}
        {tx('ui.dlg.uploadRsform.warningBody')}
      </div>
    </ModalForm>
  );
}
