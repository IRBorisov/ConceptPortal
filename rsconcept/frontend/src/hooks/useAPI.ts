import axios from 'axios'
import { IUserProfile } from '../models'
import { config } from '../constants'
import { ErrorInfo } from '../components/BackendError'

function useAPI() {
  async function getProfile(
    args?: {onSucccess: Function, onError: Function}) {
    // setError(undefined);
    // setLoading(true);
    // console.log('Profile requested');
    // axios.get<IUserProfile>(`${config.url.AUTH}profile`)
    // .then(function (response) {
    //   setLoading(false);
    //   return response.data;
    // })
    // .catch(function (error) {
    //   setLoading(false);
    //   setError(error);
    //   return undefined;
    // });
  }

  return { 
    getProfile
  };
}

export default useAPI;