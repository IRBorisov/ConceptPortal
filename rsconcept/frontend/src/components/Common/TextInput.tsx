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
}

function TextInput({
  id, required, label, dense, tooltip, noBorder,
  dimensions = 'w-full',
  colorClass = 'clr-input',
  ...props
}: TextInputProps) {
  const borderClass = noBorder ? '': 'border';
  return (
    <div className={`flex ${dense ? 'items-center gap-4 ' + dimensions : 'flex-col items-start gap-2'}`}>
      {label && 
      <Label
        text={label}
        htmlFor={id}
      />}
      <input id={id}
        title={tooltip}
        className={`px-3 py-2 leading-tight ${borderClass} truncate hover:text-clip clr-outline ${colorClass} ${dense ? 'w-full' : dimensions}`}
        required={required}
        {...props}
      />
    </div>
  );
}

export default TextInput;
