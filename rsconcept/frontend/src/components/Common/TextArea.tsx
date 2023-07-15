import Label from './Label';

interface TextAreaProps {
  id: string
  label: string
  required?: boolean
  disabled?: boolean
  placeholder?: string
  widthClass?: string
  rows?: number
  value?: any
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void
}

function TextArea({id, required, label, disabled, placeholder, widthClass='w-full', rows=4, value, onChange}: TextAreaProps) {
  return (
    <div className='flex flex-col items-start [&:not(:first-child)]:mt-3'>
      <Label 
        text={label}
        required={required}
        htmlFor={id}
      />
      <textarea id='comment'
          className={'px-3 py-2 mt-2 leading-tight border shadow dark:bg-gray-800 '+ widthClass}
          rows={rows}
          placeholder={placeholder}
          required={required}
          value={value}
          onChange={onChange}
          disabled={disabled}
      />
    </div>
  );
}

export default TextArea;