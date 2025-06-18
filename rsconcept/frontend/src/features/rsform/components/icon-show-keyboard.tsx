import { type DomIconProps, IconKeyboard, IconKeyboardOff } from '@/components/icons';

export function IconShowKeyboard({ value, size = '1.25rem', className }: DomIconProps<boolean>) {
  if (value) {
    return <IconKeyboard size={size} className={className} />;
  } else {
    return <IconKeyboardOff size={size} className={className} />;
  }
}
