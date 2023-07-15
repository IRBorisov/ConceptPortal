import BackendError from '../../components/BackendError'
import { Loader } from '../../components/Common/Loader'
import { useRSForms } from '../../hooks/useRSForms'
import RSFormsTable from './RSFormsTable';

function RSFormsPage() {
  const { rsforms, error, loading } = useRSForms();
  
  return (
    <div className='container'>
      { loading && <Loader /> }
      { error && <BackendError error={error} />}
      { !loading && rsforms && <RSFormsTable schemas={rsforms} /> }
    </div>
  );
}

export default RSFormsPage;