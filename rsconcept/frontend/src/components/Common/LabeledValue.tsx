interface LabeledValueProps {
  id?: string
  label: string
  text: string | number
  tooltip?: string
}

function LabeledValue({ id, label, text, tooltip }: LabeledValueProps) {
  return (
  <div className='flex justify-between gap-3'>
    <label
      className='font-semibold'
      title={tooltip}
      htmlFor={id}
    >
      {label}
    </label>
    <span id={id}>
      {text}
    </span>
  </div>);
}

export default LabeledValue;