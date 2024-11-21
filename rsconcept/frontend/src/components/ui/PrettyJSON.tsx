interface PrettyJsonProps {
  data: unknown;
}

/**
 * Displays JSON data in a formatted string.
 */
function PrettyJson({ data }: PrettyJsonProps) {
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}

export default PrettyJson;
