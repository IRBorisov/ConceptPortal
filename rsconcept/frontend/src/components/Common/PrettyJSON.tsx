interface PrettyJsonProps {
  data: unknown
}

function PrettyJson({ data }: PrettyJsonProps) {
  return (
  <pre>
    {JSON.stringify(data, null, 2)}
  </pre>);
}

export default PrettyJson;