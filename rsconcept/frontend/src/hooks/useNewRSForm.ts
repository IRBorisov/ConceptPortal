import { useState } from 'react'
import { ErrorInfo } from '../components/BackendError';
import { postNewRSForm } from '../backendAPI';

function useNewRSForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorInfo>(undefined);
  
  async function createSchema({data, file, onSuccess}: { 
    data: any, file?: File, 
    onSuccess: (newID: string) => void
  }) {
    setError(undefined);
    if (file) {
      data['file'] = file;
      data['fileName'] = file.name;
    }
    postNewRSForm({
      data: data,
      showError: true,
      setLoading: setLoading,
      onError: error => setError(error),
      onSucccess: response => onSuccess(response.data.id)
    });
  }

  return { createSchema, error, setError, loading };
}

export default useNewRSForm;