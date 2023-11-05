import { IColorsProps, IEditorProps } from '../commonInterfaces';
import Label from './Label';

interface TextInputProps 
extends IEditorProps, IColorsProps, Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className' | 'title'> {
  dense?: boolean
  allowEnter?: boolean
}

function preventEnterCapture(event: React.KeyboardEvent<HTMLInputElement>) {
  if (event.key === 'Enter') {
    event.preventDefault();
  }
}

function TextInput({
  id, label, dense, tooltip, noBorder, noOutline, allowEnter, onKeyDown,
  dimensions = 'w-full',
  colors = 'clr-input',
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
        
        onKeyDown={!allowEnter && !onKeyDown ? preventEnterCapture: onKeyDown}
        className={`px-3 py-2 leading-tight truncate hover:text-clip ${colors} ${outlineClass} ${borderClass} ${dense ? 'w-full' : dimensions}`}
        {...props}
      />
    </div>
  );
}

export default TextInput;
