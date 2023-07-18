interface LabeledTextProps {
  id?: string
  label: string
  text: any
  tooltip?: string
}

function LabeledText({id, label, text, tooltip}: LabeledTextProps) {
  return (
    <div className='flex justify-between gap-2'>
      <label 
        className='font-semibold'
        title={tooltip}
        htmlFor={id}
      >
        {label}
      </label>
      <span 
        id={id}
      >
        {text}
      </span>
    </div>
  );
}

export default LabeledText;