import { CstType } from '@/domain/library';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/input/select';
import { type Styling } from '@/components/props';
import { cn } from '@/components/utils';

import { labelCstType } from '../labels';

import { IconCstType } from './icon-cst-type';

interface SelectCstTypeProps extends Styling {
  id?: string;
  disabled?: boolean;
  excludeNominal?: boolean;
  value: CstType;
  onChange: (newValue: CstType) => void;
}

export function SelectCstType({
  id,
  value,
  onChange,
  className,
  disabled,
  excludeNominal,
  ...restProps
}: SelectCstTypeProps) {
  const visibleTypes = Object.values(CstType).filter(typeStr => !excludeNominal || typeStr !== CstType.NOMINAL);
  const items = Object.fromEntries(visibleTypes.map(typeStr => [typeStr, labelCstType(typeStr)] as const)) as Record<
    CstType,
    string
  >;

  return (
    <Select items={items} onValueChange={newValue => onChange(newValue!)} value={value} disabled={disabled}>
      <SelectTrigger id={id} className={cn('w-66', className)} {...restProps}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {visibleTypes.map(typeStr => (
          <SelectItem key={`csttype-${typeStr}`} value={typeStr}>
            <IconCstType value={typeStr} />
            {labelCstType(typeStr)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
