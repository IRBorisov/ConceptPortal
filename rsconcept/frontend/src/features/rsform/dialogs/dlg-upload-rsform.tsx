'use client';

import { useState } from 'react';

import { useTx } from '@/i18n/use-tx';

import { Checkbox, FileInput } from '@/components/input';
import { ModalForm } from '@/components/modal';
import { useDialogsStore } from '@/stores/dialogs';
import { EXTEOR_TRS_FILE } from '@/utils/constants';
import { formatLabel, lid } from '@/utils/labels';

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
      header={tx('ui.dlg.uploadRsform.header', 'Import schema from Exteor')}
      canSubmit={!!file}
      validationHint={!!file ? '' : formatLabel(lid.hint.fileEmpty)}
      onSubmit={handleSubmit}
      submitText={tx('ui.action.upload', 'Upload')}
      className='w-100 px-6'
    >
      <FileInput
        label={tx('ui.dlg.uploadRsform.pickFile', 'Choose file')}
        acceptType={EXTEOR_TRS_FILE}
        onChange={handleFile}
      />
      <Checkbox
        label={tx('ui.dlg.uploadRsform.loadMetadata', 'Load title and comment from file')}
        className='py-2'
        value={loadMetadata}
        onChange={value => setLoadMetadata(value)}
      />
      <div className='text-destructive'>
        <b>{tx('ui.dlg.uploadRsform.attention', 'Warning!')}</b>{' '}
        {tx(
          'ui.dlg.uploadRsform.warningBody',
          'Loading from a file will remove all constituents of the current conceptual schema.'
        )}
      </div>
    </ModalForm>
  );
}
