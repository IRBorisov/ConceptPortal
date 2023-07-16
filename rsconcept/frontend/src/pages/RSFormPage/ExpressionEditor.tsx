import Label from '../../components/Common/Label';
import { useRSForm } from '../../context/RSFormContext';

interface ExpressionEditorProps {
  id: string
  label: string
  disabled?: boolean
  placeholder?: string
  value: any
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void
}

function ExpressionEditor({id, label, disabled, placeholder, value, onChange}: ExpressionEditorProps) {
  const { schema } = useRSForm();
  
  return (
    <div className='flex flex-col items-start [&:not(:first-child)]:mt-3 w-full'>
      <Label 
        text={label}
        required={false}
        htmlFor={id}
      />
      <textarea id='comment'
          className='w-full px-3 py-2 mt-2 leading-tight border shadow dark:bg-gray-800'
          rows={6}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
      />
    </div>
  );
}

export default ExpressionEditor;