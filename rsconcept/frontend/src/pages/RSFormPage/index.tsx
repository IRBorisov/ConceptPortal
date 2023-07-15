import { useParams } from 'react-router-dom';
import { RSFormState } from '../../context/RSFormContext';
import RSFormEditor from './RSFormEditor';

function RSFormPage() {
  const { id } = useParams();
  return (
    <RSFormState id={id || ''}>
      <RSFormEditor />
    </RSFormState>
  );
}

export default RSFormPage;