import { useRef, useState } from 'react';

import { UploadIcon } from '../Icons';
import Button from './Button';
import Label from './Label';

interface FileInputProps 
extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className' | 'title' | 'style' | 'accept' | 'type'> {
  label: string
  tooltip?: string
  acceptType?: string
  widthClass?: string
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
}

function FileInput({
  label, acceptType, tooltip,
  widthClass = 'w-fit', onChange,
  ...props 
}: FileInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState('');

  const handleUploadClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFileName(event.target.files[0].name)
    } else {
      setFileName('')
    }
    if (onChange) {
      onChange(event);
    }
  };

  return (
    <div className={`flex flex-col gap-2 py-2 mt-3 items-start ${widthClass}`}>
      <input type='file'
        ref={inputRef}
        style={{ display: 'none' }}
        accept={acceptType}
        onChange={handleFileChange}
        {...props}
      />
      <Button
        text={label}
        icon={<UploadIcon/>}
        onClick={handleUploadClick}
        tooltip={tooltip}
      />
      <Label
        text={fileName}
      />
    </div>
  );
}

export default FileInput;
