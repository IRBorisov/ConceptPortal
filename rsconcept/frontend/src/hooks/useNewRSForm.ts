import { useState } from 'react'

import { type ErrorInfo } from '../components/BackendError';
import { DataCallback, postNewRSForm } from '../utils/backendAPI';
import { IRSFormCreateData, IRSFormMeta } from '../utils/models';

function useNewRSForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorInfo>(undefined);

  function createSchema(data: IRSFormCreateData, onSuccess: DataCallback<IRSFormMeta>) {
    setError(undefined);
    postNewRSForm({
      data: data,
      showError: true,
      setLoading: setLoading,
      onError: error => { setError(error); },
      onSuccess: onSuccess
    });
  }

  return { createSchema, error, setError, loading };
}

export default useNewRSForm;
