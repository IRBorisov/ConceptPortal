import { useRSForm } from '../../context/RSFormContext';
import Card from '../../components/Common/Card';
import PrettyJson from '../../components/Common/PrettyJSON';

function RSFormStats() {
  const { schema } = useRSForm();
  
  return (
    <Card widthClass='max-w-sm flex-grow'>
      <div className='flex justify-start'>
        <label className='font-semibold'>Всего конституент:</label>
        <span className='ml-2'>{schema!.items!.length}</span>
      </div>
      <PrettyJson data={schema || ''}/>
    </Card>
  );
}

export default RSFormStats;