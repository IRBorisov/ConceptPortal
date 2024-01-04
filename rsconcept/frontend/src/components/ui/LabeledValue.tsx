interface LabeledValueProps {
  id?: string;
  label: string;
  text: string | number;
  title?: string;
}

function LabeledValue({ id, label, text, title }: LabeledValueProps) {
  return (
    <div className='flex justify-between gap-3'>
      <label title={title} htmlFor={id}>
        {label}
      </label>
      <span id={id}>{text}</span>
    </div>
  );
}

export default LabeledValue;
