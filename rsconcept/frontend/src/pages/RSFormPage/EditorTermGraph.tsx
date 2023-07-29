import PrettyJson from '../../components/Common/PrettyJSON';
import { useRSForm } from '../../context/RSFormContext';
import { GraphNode } from '../../utils/Graph';

function EditorTermGraph() {
  const { schema } = useRSForm();

  const data: GraphNode[] = [];
  schema?.graph.visitDFS(node => data.push(node));

  return (
    <div>
      <PrettyJson data={data} />
    </div>
  );
}

export default EditorTermGraph;
