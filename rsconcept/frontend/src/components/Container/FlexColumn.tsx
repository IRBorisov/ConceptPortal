import clsx from 'clsx';

/**
 * `flex` column container.
 * This component is useful for creating vertical layouts with flexbox.
 */
export function FlexColumn({ className, children, ...restProps }: React.ComponentProps<'div'>) {
  return (
    <div className={clsx('cc-column', className)} {...restProps}>
      {children}
    </div>
  );
}
