import Label from './Label';

interface TextInputProps
extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className' | 'title'> {
  id?: string
  label?: string
  tooltip?: string
  dimensions?: string
  colorClass?: string
  singleRow?: boolean
  noBorder?: boolean
}

function TextInput({
  id, required, label, singleRow, tooltip, noBorder,
  dimensions = 'w-full',
  colorClass = 'clr-input',
  ...props
}: TextInputProps) {
  const borderClass = noBorder ? '': 'border';
  return (
    <div className={`flex ${singleRow ? 'items-center gap-4 ' + dimensions : 'flex-col items-start gap-2'}`}>
      {label && 
      <Label
        text={label}
        required={!props.disabled && required}
        htmlFor={id}
      />}
      <input id={id}
        title={tooltip}
        className={`px-3 py-2 leading-tight ${borderClass} shadow truncate hover:text-clip clr-outline ${colorClass} ${singleRow ? 'w-full' : dimensions}`}
        required={required}
        {...props}
      />
    </div>
  );
}

export default TextInput;
