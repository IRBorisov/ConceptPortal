import axios from 'axios'
import { useState } from 'react'
import { config } from '../constants'
import { ErrorInfo } from '../components/BackendError';

function useNewRSForm({callback}: {callback: (newID: string) => void}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorInfo>(undefined);
  
  async function createNew({data, file}: {data: any, file?: File}) {
    setError(undefined);
    setLoading(true);
    if (file) {
      data['file']=file;
      data['fileName']=file.name;
    }
    axios.post(`${config.url.BASE}rsforms/create-detailed/`, data)
    .then(function (response) {
      setLoading(false);
      if(callback) {
        callback(response.data.id);
      }
    })
    .catch(function (error) {
      setLoading(false);
      setError(error);
    });
  }

  return { createNew, error, setError, loading };
}

export default useNewRSForm;