// Search new icons at https://reactsvgicons.com/

interface IconSVGProps {
  viewbox: string
  size?: string
  className?: string
  props?: React.SVGProps<SVGSVGElement>
  children: React.ReactNode
}

export interface IconProps {
  size?: string
  className?: string
}

function IconSVG({ viewbox, size = '1.5rem', className, props, children }: IconSVGProps) {
  return (
  <svg
    width={size}
    height={size}
    className={`w-[${size}] h-[${size}] ${className}`}
    fill='currentColor'
    viewBox={viewbox}
    {...props}
  >
    {children}
  </svg>);
}

export function SubscribedIcon(props: IconProps) {
  return (
    <IconSVG viewbox='0 0 24 24' {...props}>
      <path d='M19 13.586V10c0-3.217-2.185-5.927-5.145-6.742C13.562 2.52 12.846 2 12 2s-1.562.52-1.855 1.258C7.185 4.074 5 6.783 5 10v3.586l-1.707 1.707A.996.996 0 003 16v2a1 1 0 001 1h16a1 1 0 001-1v-2a.996.996 0 00-.293-.707L19 13.586zM19 17H5v-.586l1.707-1.707A.996.996 0 007 14v-4c0-2.757 2.243-5 5-5s5 2.243 5 5v4c0 .266.105.52.293.707L19 16.414V17zm-7 5a2.98 2.98 0 002.818-2H9.182A2.98 2.98 0 0012 22z' />
    </IconSVG>
  );
}

export function NotSubscribedIcon(props: IconProps) {
  return (
    <IconSVG viewbox='0 0 24 24' {...props}>
      <path d='M12 22a2.98 2.98 0 002.818-2H9.182A2.98 2.98 0 0012 22zm9-4v-2a.996.996 0 00-.293-.707L19 13.586V10c0-3.217-2.185-5.927-5.145-6.742C13.562 2.52 12.846 2 12 2s-1.562.52-1.855 1.258c-1.323.364-2.463 1.128-3.346 2.127L3.707 2.293 2.293 3.707l18 18 1.414-1.414-1.362-1.362A.993.993 0 0021 18zM12 5c2.757 0 5 2.243 5 5v4c0 .266.105.52.293.707L19 16.414V17h-.586L8.207 6.793C9.12 5.705 10.471 5 12 5zm-5.293 9.707A.996.996 0 007 14v-2.879L5.068 9.189C5.037 9.457 5 9.724 5 10v3.586l-1.707 1.707A.996.996 0 003 16v2a1 1 0 001 1h10.879l-2-2H5v-.586l1.707-1.707z'/>
    </IconSVG>
  );
}

export function ASTNetworkIcon(props: IconProps) {
  return (
    <IconSVG viewbox='0 0 24 24' {...props}>
      <path d='M12 1a2.5 2.5 0 00-2.5 2.5A2.5 2.5 0 0011 5.79V7H7a2 2 0 00-2 2v.71A2.5 2.5 0 003.5 12 2.5 2.5 0 005 14.29V15H4a2 2 0 00-2 2v1.21A2.5 2.5 0 00.5 20.5 2.5 2.5 0 003 23a2.5 2.5 0 002.5-2.5A2.5 2.5 0 004 18.21V17h4v1.21a2.5 2.5 0 00-1.5 2.29A2.5 2.5 0 009 23a2.5 2.5 0 002.5-2.5 2.5 2.5 0 00-1.5-2.29V17a2 2 0 00-2-2H7v-.71A2.5 2.5 0 008.5 12 2.5 2.5 0 007 9.71V9h10v.71A2.5 2.5 0 0015.5 12a2.5 2.5 0 001.5 2.29V15h-1a2 2 0 00-2 2v1.21a2.5 2.5 0 00-1.5 2.29A2.5 2.5 0 0015 23a2.5 2.5 0 002.5-2.5 2.5 2.5 0 00-1.5-2.29V17h4v1.21a2.5 2.5 0 00-1.5 2.29A2.5 2.5 0 0021 23a2.5 2.5 0 002.5-2.5 2.5 2.5 0 00-1.5-2.29V17a2 2 0 00-2-2h-1v-.71A2.5 2.5 0 0020.5 12 2.5 2.5 0 0019 9.71V9a2 2 0 00-2-2h-4V5.79a2.5 2.5 0 001.5-2.29A2.5 2.5 0 0012 1m0 1.5a1 1 0 011 1 1 1 0 01-1 1 1 1 0 01-1-1 1 1 0 011-1M6 11a1 1 0 011 1 1 1 0 01-1 1 1 1 0 01-1-1 1 1 0 011-1m12 0a1 1 0 011 1 1 1 0 01-1 1 1 1 0 01-1-1 1 1 0 011-1M3 19.5a1 1 0 011 1 1 1 0 01-1 1 1 1 0 01-1-1 1 1 0 011-1m6 0a1 1 0 011 1 1 1 0 01-1 1 1 1 0 01-1-1 1 1 0 011-1m6 0a1 1 0 011 1 1 1 0 01-1 1 1 1 0 01-1-1 1 1 0 011-1m6 0a1 1 0 011 1 1 1 0 01-1 1 1 1 0 01-1-1 1 1 0 011-1z'/>
    </IconSVG>
  );
}

export function GroupIcon(props: IconProps) {
  return (
    <IconSVG viewbox='0 0 20 20' {...props}>
      <path d='M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z' />
    </IconSVG>
  );
}

export function ShareIcon(props: IconProps) {
  return (
    <IconSVG viewbox='0 0 24 24' {...props}>
      <path d='M5.5 15a3.51 3.51 0 002.36-.93l6.26 3.58a3.06 3.06 0 00-.12.85 3.53 3.53 0 101.14-2.57l-6.26-3.58a2.74 2.74 0 00.12-.76l6.15-3.52A3.49 3.49 0 1014 5.5a3.35 3.35 0 00.12.85L8.43 9.6A3.5 3.5 0 105.5 15zm12 2a1.5 1.5 0 11-1.5 1.5 1.5 1.5 0 011.5-1.5zm0-13A1.5 1.5 0 1116 5.5 1.5 1.5 0 0117.5 4zm-12 6A1.5 1.5 0 114 11.5 1.5 1.5 0 015.5 10z' />
    </IconSVG>
  );
}

export function SortIcon(props: IconProps) {
  return (
    <IconSVG viewbox='0 0 24 24' {...props}>
      <path d='M8 16H4l6 6V2H8zm6-11v17h2V8h4l-6-6z' />
    </IconSVG>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <IconSVG viewbox='0 0 512 512' {...props}>
      <path d='M399 384.2c-22.1-38.4-63.6-64.2-111-64.2h-64c-47.4 0-88.9 25.8-111 64.2 35.2 39.2 86.2 63.8 143 63.8s107.8-24.7 143-63.8zM512 256c0 141.4-114.6 256-256 256S0 397.4 0 256 114.6 0 256 0s256 114.6 256 256zm-256 16c39.8 0 72-32.2 72-72s-32.2-72-72-72-72 32.2-72 72 32.2 72 72 72z' />
    </IconSVG>
  );
}

export function EducationIcon(props: IconProps) {
  return (
    <IconSVG viewbox='0 0 20 20' {...props}>
      <path d='M3.33 8L10 12l10-6-10-6L0 6h10v2H3.33zM0 8v8l2-2.22V9.2L0 8zm10 12l-5-3-2-1.2v-6l7 4.2 7-4.2v6L10 20z' />
    </IconSVG>
  );
}

export function LibraryIcon(props: IconProps) {
  return (
    <IconSVG viewbox='0 0 512 512' {...props}>
      <path d='M64 480H48a32 32 0 01-32-32V112a32 32 0 0132-32h16a32 32 0 0132 32v336a32 32 0 01-32 32zM240 176a32 32 0 00-32-32h-64a32 32 0 00-32 32v28a4 4 0 004 4h120a4 4 0 004-4zM112 448a32 32 0 0032 32h64a32 32 0 0032-32v-30a2 2 0 00-2-2H114a2 2 0 00-2 2z' />
      <path d='M114 240 H238 A2 2 0 0 1 240 242 V382 A2 2 0 0 1 238 384 H114 A2 2 0 0 1 112 382 V242 A2 2 0 0 1 114 240 z' />
      <path d='M320 480h-32a32 32 0 01-32-32V64a32 32 0 0132-32h32a32 32 0 0132 32v384a32 32 0 01-32 32zM495.89 445.45l-32.23-340c-1.48-15.65-16.94-27-34.53-25.31l-31.85 3c-17.59 1.67-30.65 15.71-29.17 31.36l32.23 340c1.48 15.65 16.94 27 34.53 25.31l31.85-3c17.59-1.67 30.65-15.71 29.17-31.36z' />
    </IconSVG>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <IconSVG viewbox='0 0 1024 1024' {...props}>
      <path d='M880 112H144c-17.7 0-32 14.3-32 32v736c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V144c0-17.7-14.3-32-32-32zM704 536c0 4.4-3.6 8-8 8H544v152c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V544H328c-4.4 0-8-3.6-8-8v-48c0-4.4 3.6-8 8-8h152V328c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v152h152c4.4 0 8 3.6 8 8v48z' />
    </IconSVG>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <IconSVG viewbox='0 0 24 24' {...props}>
      <path d='M12.707 17.293L8.414 13H18v-2H8.414l4.293-4.293-1.414-1.414L4.586 12l6.707 6.707z' />
    </IconSVG>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <IconSVG viewbox='0 0 24 24' {...props}>
      <path d='M11.293 17.293l1.414 1.414L19.414 12l-6.707-6.707-1.414 1.414L15.586 11H6v2h9.586z' />
    </IconSVG>
  );
}

export function LetterAIcon(props: IconProps) {
  return (
    <IconSVG viewbox='0 0 24 24' {...props}>
      <path d='M11.307 4l-6 16h2.137l1.875-5h6.363l1.875 5h2.137l-6-16h-2.387zm-1.239 9L12.5 6.515 14.932 13h-4.864z' />
    </IconSVG>
  );
}

export function LetterALinesIcon(props: IconProps) {
  return (
    <IconSVG viewbox='0 0 24 24' {...props}>
      <path d='M15 4h7v2h-7zm1 4h6v2h-6zm2 4h4v2h-4zM9.307 4l-6 16h2.137l1.875-5h6.363l1.875 5h2.137l-6-16H9.307zm-1.239 9L10.5 6.515 12.932 13H8.068z' />
    </IconSVG>
  );
}

export function InDoorIcon(props: IconProps) {
  return (
    <IconSVG viewbox='0 0 24 24' {...props}>
      <path fill='none' d='M0 0h24v24H0z' />
      <path d='M10 11H4V3a1 1 0 011-1h14a1 1 0 011 1v18a1 1 0 01-1 1H5a1 1 0 01-1-1v-8h6v3l5-4-5-4v3z' />
    </IconSVG>
  );
}

export function DescendingIcon(props: IconProps) {
  return (
    <IconSVG viewbox='0 0 24 24' {...props}>
      <path d='M11.998 17l7-8h-14z' />
    </IconSVG>
  );
}

export function AscendingIcon(props: IconProps) {
  return (
    <IconSVG viewbox='0 0 24 24' {...props}>
      <path d='M5 15h14l-7-8z' />
    </IconSVG>
  );
}

export function CheckboxCheckedIcon() {
  return (
    <svg
      className='w-3 h-3'
      viewBox='0 0 512 512'
      fill='#ffffff'
    >
      <path d='M470.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L192 338.7l233.4-233.3c12.5-12.5 32.8-12.5 45.3 0z' />
    </svg>
  );
}

export function CheckboxNullIcon() {
  return (
    <svg
      className='w-3 h-3'
      viewBox='0 0 16 16'
      fill='#ffffff'
    >
      <path d='M2 7.75A.75.75 0 012.75 7h10a.75.75 0 010 1.5h-10A.75.75 0 012 7.75z' />
    </svg>
  );
}