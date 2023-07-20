import { useLocation } from 'react-router-dom';
import BackendError from '../../components/BackendError'
import { Loader } from '../../components/Common/Loader'
import { FilterType, RSFormsFilter, useRSForms } from '../../hooks/useRSForms'
import RSFormsTable from './RSFormsTable';
import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

function RSFormsPage() {
  const search = useLocation().search;
  const { user } = useAuth();
  const { rsforms, error, loading, loadList } = useRSForms();

  useEffect(() => {
    const filterQuery = new URLSearchParams(search).get('filter');
    const type = (!user || !filterQuery ? FilterType.COMMON : filterQuery as FilterType);
    let filter: RSFormsFilter = {type: type};
    if (type === FilterType.PERSONAL) {
      filter.data = user?.id;
    }
    loadList(filter);
  }, [search, user, loadList]);
  
  return (
    <div className='w-full'>
      { loading && <Loader /> }
      { error && <BackendError error={error} />}
      { !loading && rsforms && <RSFormsTable schemas={rsforms} /> }
    </div>
  );
}

export default RSFormsPage;