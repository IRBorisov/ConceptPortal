import { useRef, useState } from 'react';

import { UploadIcon } from '../Icons';
import Button from './Button';
import Label from './Label';

interface FileInputProps 
extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className' | 'title' | 'style' | 'accept' | 'type'> {
  label: string
  tooltip?: string
  dimensions?: string
  
  acceptType?: string
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
}

function FileInput({
  label, acceptType, tooltip,
  dimensions = 'w-fit', onChange,
  ...restProps 
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
    <div className={`flex flex-col gap-2 py-2 items-start ${dimensions}`}>
      <input type='file'
        ref={inputRef}
        style={{ display: 'none' }}
        accept={acceptType}
        onChange={handleFileChange}
        {...restProps}
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
