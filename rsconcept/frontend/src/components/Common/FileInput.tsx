'use client';

import clsx from 'clsx';
import { useRef, useState } from 'react';
import { BiUpload } from 'react-icons/bi';

import { CProps } from '../props';
import Button from './Button';
import Label from './Label';

interface FileInputProps 
extends Omit<CProps.Input, 'accept' | 'type'> {
  label: string
  
  acceptType?: string
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
}

function FileInput({
  label, acceptType, title,
  className, style,
  onChange,
  ...restProps 
}: FileInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState('');

  const handleUploadClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFileName(event.target.files[0].name);
    } else {
      setFileName('');
    }
    if (onChange) {
      onChange(event);
    }
  };

  return (
  <div 
    className={clsx(
      'py-2',
      'flex flex-col gap-2 items-center',
      className
    )}
    style={style}
  >
    <input type='file'
      ref={inputRef}
      style={{ display: 'none' }}
      accept={acceptType}
      onChange={handleFileChange}
      {...restProps}
    />
    <Button
      text={label}
      icon={<BiUpload size='1.5rem' />}
      onClick={handleUploadClick}
      title={title}
    />
    <Label text={fileName} />
  </div>);
}

export default FileInput;