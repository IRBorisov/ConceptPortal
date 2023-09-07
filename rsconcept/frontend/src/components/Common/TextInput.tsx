import Label from './Label';

interface TextInputProps
extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className' | 'title'> {
  id: string
  label: string
  tooltip?: string
  widthClass?: string
  colorClass?: string
  singleRow?: boolean
}

function TextInput({
  id, required, label, singleRow, tooltip,
  widthClass = 'w-full',
  colorClass = 'clr-input',
  ...props
}: TextInputProps) {
  return (
    <div className={`flex [&:not(:first-child)]:mt-3 ${singleRow ? 'items-center gap-4 ' + widthClass : 'flex-col items-start'}`}>
      <Label
        text={label}
        required={required}
        htmlFor={id}
      />
      <input id={id}
        title={tooltip}
        className={`px-3 py-2 leading-tight border shadow truncate hover:text-clip clr-outline ${colorClass} ${singleRow ? '' : 'mt-2 ' + widthClass}`}
        required={required}
        {...props}
      />
    </div>
  );
}

export default TextInput;
