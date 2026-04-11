import { type Editor, type ErrorProcessing, type Titled } from '../props';
import { cn } from '../utils';

import { ErrorField } from './error-field';
import { Label } from './label';

interface TextAreaProps extends Editor, ErrorProcessing, Titled, React.ComponentProps<'textarea'> {
  /** Indicates that the input should be transparent. */
  transparent?: boolean;

  /** Indicates that padding should be minimal. */
  dense?: boolean;

  /** Disable resize when content overflows. */
  noResize?: boolean;

  /** Disable resize to fit content. */
  fitContent?: boolean;

  /** Class name for underlying textarea element. */
  areaClassName?: string;
}

/**
 * Displays a customizable textarea with a label.
 */
export function TextArea({
  id,
  label,
  transparent,
  dense,
  noBorder,
  noOutline,
  noResize,
  className,
  areaClassName,
  fitContent,
  disabled,
  error,
  ...restProps
}: TextAreaProps) {
  if (dense) {
    return (
      <div className={cn('flex flex-col', className)}>
        <div className='flex items-center gap-3'>
          <Label text={label} htmlFor={id} />
          <textarea
            id={id}
            className={cn(
              'min-h-0 grow max-w-full',
              'px-3',
              'leading-tight',
              'overflow-x-hidden overflow-y-auto',
              !noBorder && 'border py-2',
              fitContent && 'field-sizing-content',
              noResize && 'resize-none',
              transparent || disabled ? 'bg-transparent' : 'bg-input',
              !noOutline && 'focus-outline',
              areaClassName
            )}
            disabled={disabled}
            {...restProps}
          />
        </div>
        <ErrorField className='mt-1' error={error} />
      </div>
    );
  } else {
    return (
      <div className={cn('flex flex-col', className)}>
        <Label text={label} htmlFor={id} />
        <textarea
          id={id}
          className={cn(
            'min-h-0',
            'px-3',
            'leading-tight',
            'overflow-x-hidden overflow-y-auto',
            !noBorder && 'border py-2',
            fitContent && 'field-sizing-content',
            noResize && 'resize-none',
            transparent || disabled ? 'bg-transparent' : 'bg-input',
            !noOutline && 'focus-outline',
            !!label && 'mt-2',
            areaClassName
          )}
          disabled={disabled}
          {...restProps}
        />
        <ErrorField className='mt-1' error={error} />
      </div>
    );
  }
}
