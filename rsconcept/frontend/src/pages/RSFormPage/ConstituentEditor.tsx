import Card from '../../components/Common/Card';
import PrettyJson from '../../components/Common/PrettyJSON';
import { useRSForm } from '../../context/RSFormContext';

function ConstituentEditor() {
  const { active } = useRSForm();

  return (
    <Card>
      {active && <PrettyJson data={active}/>}
    </Card>
  );
}

export default ConstituentEditor;