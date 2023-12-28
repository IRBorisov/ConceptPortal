// Search new icons at https://reactsvgicons.com/

interface IconSVGProps {
  viewBox: string;
  size?: string;
  className?: string;
  props?: React.SVGProps<SVGSVGElement>;
  children: React.ReactNode;
}

export interface IconProps {
  size?: string;
  className?: string;
}

function IconSVG({ viewBox, size = '1.5rem', className, props, children }: IconSVGProps) {
  return (
    <svg
      width={size}
      height={size}
      className={`w-[${size}] h-[${size}] ${className}`}
      fill='currentColor'
      viewBox={viewBox}
      {...props}
    >
      {children}
    </svg>
  );
}

export function EducationIcon(props: IconProps) {
  return (
    <IconSVG viewBox='0 0 20 20' {...props}>
      <path d='M3.33 8L10 12l10-6-10-6L0 6h10v2H3.33zM0 8v8l2-2.22V9.2L0 8zm10 12l-5-3-2-1.2v-6l7 4.2 7-4.2v6L10 20z' />
    </IconSVG>
  );
}

export function InDoorIcon(props: IconProps) {
  return (
    <IconSVG viewBox='0 0 24 24' {...props}>
      <path fill='none' d='M0 0h24v24H0z' />
      <path d='M10 11H4V3a1 1 0 011-1h14a1 1 0 011 1v18a1 1 0 01-1 1H5a1 1 0 01-1-1v-8h6v3l5-4-5-4v3z' />
    </IconSVG>
  );
}

export function CheckboxCheckedIcon() {
  return (
    <svg className='w-3 h-3' viewBox='0 0 512 512' fill='#ffffff'>
      <path d='M470.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L192 338.7l233.4-233.3c12.5-12.5 32.8-12.5 45.3 0z' />
    </svg>
  );
}

export function CheckboxNullIcon() {
  return (
    <svg className='w-3 h-3' viewBox='0 0 16 16' fill='#ffffff'>
      <path d='M2 7.75A.75.75 0 012.75 7h10a.75.75 0 010 1.5h-10A.75.75 0 012 7.75z' />
    </svg>
  );
}
