'use client';

import { useRef, useState } from 'react';
import clsx from 'clsx';

import { Button } from '../Control';
import { IconUpload } from '../Icons';
import { type Input } from '../props';

import { Label } from './Label';

interface FileInputProps extends Omit<Input, 'accept' | 'type'> {
  /** Label to display in file upload button. */
  label: string;

  /** Filter: file types. */
  acceptType?: string;

  /** Callback to set the `value`. Value is transmitted as `event.target.files[0]`. */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * FileInput is a component for selecting a `file`, displaying the selected file name.
 */
export function FileInput({ id, label, acceptType, title, className, style, onChange, ...restProps }: FileInputProps) {
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
    onChange?.(event);
  };

  return (
    <div className={clsx('py-2', 'flex flex-col gap-2 items-center', className)} style={style}>
      <input
        id={id}
        type='file'
        ref={inputRef}
        style={{ display: 'none' }}
        accept={acceptType}
        onChange={handleFileChange}
        {...restProps}
      />
      <Button text={label} icon={<IconUpload size='1.25rem' />} onClick={handleUploadClick} title={title} />
      <Label className='text-wrap' text={fileName} htmlFor={id} />
    </div>
  );
}
