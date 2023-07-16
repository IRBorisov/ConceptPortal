import Label from './Label';

interface TextInputProps {
  id: string
  type: string
  label: string
  required?: boolean
  disabled?: boolean
  placeholder?: string
  widthClass?: string
  value?: any
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
}

function TextInput({id, type, required, label, disabled, placeholder, widthClass='w-full', value, onChange}: TextInputProps) {
  return (
    <div className='flex flex-col items-start [&:not(:first-child)]:mt-3'>
      <Label 
        text={label}
        required={required}
        htmlFor={id}
      />
      <input id={id}
        className={'px-3 py-2 mt-2 leading-tight border shadow dark:bg-gray-800 truncate hover:text-clip '+ widthClass}
        required={required}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}

export default TextInput;