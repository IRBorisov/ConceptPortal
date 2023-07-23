import { useParams } from 'react-router-dom';
import { RSFormState } from '../../context/RSFormContext';
import RSFormTabs from './RSFormTabs';

function RSFormPage() {
  const { id } = useParams();
  return (
    <RSFormState schemaID={id || ''}>
      <RSFormTabs />
    </RSFormState>
  );
}

export default RSFormPage;