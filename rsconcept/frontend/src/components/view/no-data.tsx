import { cn } from '../utils';

/**
 * Wraps content in a div with a centered text.
 */
export function NoData({ className, children, ...restProps }: React.ComponentProps<'div'>) {
  return (
    <div className={cn('p-3 flex flex-col items-center text-center select-none w-full', className)} {...restProps}>
      {children}
    </div>
  );
}
