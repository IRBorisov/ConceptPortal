import { Popover as PopoverPrimitive } from '@base-ui/react/popover';

import { cn } from '../utils';

/** Root popover primitive; controls open state and anchor pairing. */
function Popover(props: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot='popover' {...props} />;
}

/** Element that toggles the popover when activated. */
function PopoverTrigger(props: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot='popover-trigger' {...props} />;
}

/** Portaled floating panel positioned relative to the trigger. */
function PopoverContent({
  className,
  align = 'center',
  alignOffset,
  side,
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Popup> &
  Pick<React.ComponentProps<typeof PopoverPrimitive.Positioner>, 'align' | 'alignOffset' | 'side' | 'sideOffset'>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className='isolate z-topmost'
      >
        <PopoverPrimitive.Popup
          data-slot='popover-content'
          className={cn(
            'w-72 min-w-40',
            'border p-4',
            'bg-popover text-popover-foreground shadow-md outline-hidden',
            'data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 duration-dropdown',
            className
          )}
          {...props}
        />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  );
}

/** Optional positioning anchor when the trigger is not the alignment target. */
function PopoverAnchor(props: React.ComponentProps<'div'>) {
  return <div data-slot='popover-anchor' {...props} />;
}

export { Popover, PopoverAnchor, PopoverContent, PopoverTrigger };
