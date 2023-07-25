import { useState } from 'react'

import { type ErrorInfo } from '../components/BackendError';
import { postNewRSForm } from '../utils/backendAPI';

function useNewRSForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorInfo>(undefined);

  async function createSchema({ data, file, onSuccess }: {
    data: any
    file?: File
    onSuccess: (newID: string) => void
  }) {
    setError(undefined);
    if (file) {
      data.file = file;
      data.fileName = file.name;
    }
    await postNewRSForm({
      data,
      showError: true,
      setLoading,
      onError: error => { setError(error); },
      onSucccess: response => { onSuccess(response.data.id); }
    });
  }

  return { createSchema, error, setError, loading };
}

export default useNewRSForm;
