import { useParams } from 'react-router-dom';

import { RSFormState } from '../../context/RSFormContext';
import RSTabs from './RSTabs';

function RSFormPage() {
  const { id } = useParams();
  return (
    <RSFormState schemaID={id ?? ''}>
      <RSTabs />
    </RSFormState>
  );
}

export default RSFormPage;
