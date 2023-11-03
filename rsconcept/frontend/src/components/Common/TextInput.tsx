import Label from './Label';

interface TextInputProps
extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className' | 'title'> {
  id?: string
  label?: string
  tooltip?: string
  dimensions?: string
  colorClass?: string
  dense?: boolean
  noBorder?: boolean
  noOutline?: boolean
}

function TextInput({
  id, required, label, dense, tooltip, noBorder, noOutline,
  dimensions = 'w-full',
  colorClass = 'clr-input',
  ...props
}: TextInputProps) {
  const borderClass = noBorder ? '': 'border';
  const outlineClass = noOutline ? '': 'clr-outline';
  return (
    <div className={`flex ${dense ? 'items-center gap-4 ' + dimensions : 'flex-col items-start gap-2'}`}>
      {label && 
      <Label
        text={label}
        htmlFor={id}
      />}
      <input id={id}
        title={tooltip}
        className={`px-3 py-2 leading-tight truncate hover:text-clip ${outlineClass} ${borderClass} ${colorClass} ${dense ? 'w-full' : dimensions}`}
        required={required}
        {...props}
      />
    </div>
  );
}

export default TextInput;
