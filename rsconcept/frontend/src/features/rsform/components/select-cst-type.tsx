import { type Styling } from '@/components/props';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

import { CstType } from '../backend/types';
import { labelCstType } from '../labels';

import { IconCstType } from './icon-cst-type';

interface SelectCstTypeProps extends Styling {
  id?: string;
  disabled?: boolean;
  value: CstType;
  onChange: (newValue: CstType) => void;
}

export function SelectCstType({ id, value, onChange, className, disabled = false, ...restProps }: SelectCstTypeProps) {
  return (
    <Select onValueChange={onChange} defaultValue={value} disabled={disabled}>
      <SelectTrigger id={id} className={cn('w-66', className)} {...restProps}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.values(CstType).map(typeStr => (
          <SelectItem key={`csttype-${typeStr}`} value={typeStr}>
            <IconCstType value={typeStr as CstType} />
            <span>{labelCstType(typeStr as CstType)}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
