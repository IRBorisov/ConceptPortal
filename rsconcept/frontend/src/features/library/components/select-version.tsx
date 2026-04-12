'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/input/select';
import { type Styling } from '@/components/props';
import { cn } from '@/components/utils';
import { type CurrentVersion, type VersionInfo } from '@/domain/library';

import { labelVersion } from '../labels';

interface SelectVersionProps extends Styling {
  id?: string;
  value: CurrentVersion;
  onChange: (newValue: CurrentVersion) => void;

  items: VersionInfo[];
  placeholder?: string;
  noBorder?: boolean;
}

export function SelectVersion({
  id,
  className,
  items,
  value,
  placeholder,
  onChange,
  ...restProps
}: SelectVersionProps) {
  function handleSelect(newValue: string) {
    if (newValue === 'latest') {
      onChange(newValue);
    } else {
      onChange(Number(newValue));
    }
  }
  return (
    <Select onValueChange={handleSelect} value={String(value)}>
      <SelectTrigger id={id} className={cn('min-w-48', className)} {...restProps}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value='latest'>{labelVersion('latest', items)}</SelectItem>
        {items?.map(version => (
          <SelectItem key={`version-${version.id}`} value={String(version.id)}>
            {version.version}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
