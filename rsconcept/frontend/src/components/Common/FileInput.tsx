import { useRef, useState } from 'react';

import { UploadIcon } from '../Icons';
import Button from './Button';
import Label from './Label';

interface FileInputProps {
  id?: string
  required?: boolean
  label: string
  acceptType?: string
  widthClass?: string
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
}

function FileInput({ id, required, label, acceptType, widthClass = 'w-full', onChange }: FileInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [labelText, setLabelText] = useState('Файл не выбран');

  const handleUploadClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setLabelText(event.target.files[0].name)
    } else {
      setLabelText('Файл не выбран')
    }
    if (onChange) {
      onChange(event);
    }
  };

  return (
    <div className={'flex flex-col gap-2 py-2 [&:not(:first-child)]:mt-3 items-start ' + widthClass}>
      <input id={id} type='file'
        ref={inputRef}
        required={required}
        style={{ display: 'none' }}
        accept={acceptType}
        onChange={handleFileChange}
      />
      <Button
        text={label}
        icon={<UploadIcon/>}
        onClick={handleUploadClick}
      />
      <Label
        text={labelText}
      />
    </div>
  );
}

export default FileInput;
