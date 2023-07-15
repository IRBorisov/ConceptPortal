import { useRSForm } from '../../context/RSFormContext';
import Card from '../../components/Common/Card';

function RSFormStats() {
  const { schema } = useRSForm();
  
  return (
    <Card widthClass='max-w-sm flex-grow'>
      <div className='flex justify-start'>
        <label className='font-semibold'>Всего конституент:</label>
        <span className='ml-2'>{schema!.items!.length}</span>
      </div>
    </Card>
  );
}

export default RSFormStats;