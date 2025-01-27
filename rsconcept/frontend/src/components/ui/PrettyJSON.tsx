interface PrettyJsonProps {
  data: unknown;
}

/**
 * Displays JSON data in a formatted string.
 */
function PrettyJson({ data }: PrettyJsonProps) {
  const text = JSON.stringify(data, null, 2);
  return <pre>{text === '{}' ? '' : text}</pre>;
}

export default PrettyJson;
