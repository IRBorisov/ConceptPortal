// Search new icons at https://reactsvgicons.com/

interface IconSVGProps {
  viewbox: string
  rectangle?: string
  props?: React.SVGProps<SVGSVGElement>
  children: React.ReactNode
}

function IconSVG({viewbox, rectangle='w-6 h-6', props, children} : IconSVGProps) {
  return (
    <svg
      className={rectangle}
      fill='currentColor'
      viewBox={viewbox}
      {...props}
    >
      {children}
    </svg>
  );
}

export function MagnifyingGlassIcon() {
  return (
      <IconSVG viewbox='0 0 20 20' rectangle='w-5 h-5'>
        <path d='M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z'/>
      </IconSVG>
    );
}

export function BellIcon() {
  return (
    <IconSVG viewbox='0 0 20 20'> 
      <path d='M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z' />
    </IconSVG>
  );
}

export function SquaresIcon() {
  return (
    <IconSVG viewbox='0 0 20 20'> 
      <path d='M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' />
    </IconSVG>
  );
}

export function GroupIcon() {
  return (
    <IconSVG viewbox='0 0 20 20'> 
      <path d='M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z' />
    </IconSVG>
  );
}

export function FrameIcon() {
  return (
    <IconSVG viewbox='0 0 20 20'> 
      <path d='M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v7h-2l-1 2H8l-1-2H5V5z' />
    </IconSVG>
  );
}

export function AsteriskIcon() {
  return (
    <IconSVG viewbox='0 0 20 20'> 
      <path d='M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z' />
    </IconSVG>
  );
}

export function MenuIcon() {
  return (
    <IconSVG viewbox='0 0 24 24'> 
      <path d='M19 17H5c-1.103 0-2 .897-2 2s.897 2 2 2h14c1.103 0 2-.897 2-2s-.897-2-2-2zm0-7H5c-1.103 0-2 .897-2 2s.897 2 2 2h14c1.103 0 2-.897 2-2s-.897-2-2-2zm0-7H5c-1.103 0-2 .897-2 2s.897 2 2 2h14c1.103 0 2-.897 2-2s-.897-2-2-2z' />
    </IconSVG>
  );
}

export function FilterCogIcon() {
  return (
    <IconSVG viewbox='0 0 24 24'> 
      <path d='M22.77 19.32l-1.07-.82c.02-.17.04-.33.04-.5s-.01-.33-.04-.5l1.06-.82a.26.26 0 00.06-.32l-1-1.73c-.06-.13-.19-.13-.32-.13l-1.23.5c-.27-.18-.54-.35-.85-.47l-.19-1.32A.236.236 0 0019 13h-2a.26.26 0 00-.26.21l-.19 1.32c-.3.13-.59.29-.85.47l-1.24-.5c-.11 0-.24 0-.31.13l-1 1.73c-.06.11-.04.24.06.32l1.06.82a4.193 4.193 0 000 1l-1.06.82a.26.26 0 00-.06.32l1 1.73c.06.13.19.13.31.13l1.24-.5c.26.18.54.35.85.47l.19 1.32c.02.12.12.21.26.21h2c.11 0 .22-.09.24-.21l.19-1.32c.3-.13.57-.29.84-.47l1.23.5c.13 0 .26 0 .33-.13l1-1.73a.26.26 0 00-.06-.32M18 19.5c-.84 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5M3 3c-.22 0-.43.08-.62.22a1 1 0 00-.17 1.4L7.97 12H8v5.87c-.04.29.06.6.29.83l2.01 2.01c.35.35.89.37 1.28.09-.38-.89-.58-1.84-.58-2.8 0-1.27.35-2.5 1-3.6V12h.03l5.76-7.38a1 1 0 00-.17-1.4c-.19-.14-.4-.22-.62-.22H3z' />
    </IconSVG>
  );
}

export function FilterIcon() {
  return (
    <IconSVG viewbox='0 0 24 24'> 
      <path d='M22 3H2l8 9.46V19l4 2v-8.54L22 3z' />
    </IconSVG>
  );
}

export function SortIcon() {
  return (
    <IconSVG viewbox='0 0 24 24'> 
      <path d='M8 16H4l6 6V2H8zm6-11v17h2V8h4l-6-6z' />
    </IconSVG>
  );
}

export function BookmarkIcon() {
  return (
    <IconSVG viewbox='0 0 20 20'> 
      <path d='M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm2.5 3a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm6.207.293a1 1 0 00-1.414 0l-6 6a1 1 0 101.414 1.414l6-6a1 1 0 000-1.414zM12.5 10a1.5 1.5 0 100 3 1.5 1.5 0 000-3z' />
    </IconSVG>
  );
}

export function UserIcon() {
  return (
    <IconSVG viewbox='0 0 512 512'> 
      <path d='M399 384.2c-22.1-38.4-63.6-64.2-111-64.2h-64c-47.4 0-88.9 25.8-111 64.2 35.2 39.2 86.2 63.8 143 63.8s107.8-24.7 143-63.8zM512 256c0 141.4-114.6 256-256 256S0 397.4 0 256 114.6 0 256 0s256 114.6 256 256zm-256 16c39.8 0 72-32.2 72-72s-32.2-72-72-72-72 32.2-72 72 32.2 72 72 72z' />
    </IconSVG>
  );
}

export function EducationIcon() {
  return (
    <IconSVG viewbox='0 0 20 20'> 
      <path d='M3.33 8L10 12l10-6-10-6L0 6h10v2H3.33zM0 8v8l2-2.22V9.2L0 8zm10 12l-5-3-2-1.2v-6l7 4.2 7-4.2v6L10 20z' />
    </IconSVG>
  );
}

export function DarkThemeIcon() {
  return (
    <IconSVG viewbox='0 0 20 20'> 
      <path d='M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z' />
    </IconSVG>
  );
}

export function LightThemeIcon() {
  return (
    <IconSVG viewbox='0 0 20 20'> 
      <path d='M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z' />
    </IconSVG>
  );
}

export function LibraryIcon() {
  return (
    <IconSVG viewbox='0 0 512 512'> 
      <path d='M64 480H48a32 32 0 01-32-32V112a32 32 0 0132-32h16a32 32 0 0132 32v336a32 32 0 01-32 32zM240 176a32 32 0 00-32-32h-64a32 32 0 00-32 32v28a4 4 0 004 4h120a4 4 0 004-4zM112 448a32 32 0 0032 32h64a32 32 0 0032-32v-30a2 2 0 00-2-2H114a2 2 0 00-2 2z' />
      <path d='M114 240 H238 A2 2 0 0 1 240 242 V382 A2 2 0 0 1 238 384 H114 A2 2 0 0 1 112 382 V242 A2 2 0 0 1 114 240 z' />
      <path d='M320 480h-32a32 32 0 01-32-32V64a32 32 0 0132-32h32a32 32 0 0132 32v384a32 32 0 01-32 32zM495.89 445.45l-32.23-340c-1.48-15.65-16.94-27-34.53-25.31l-31.85 3c-17.59 1.67-30.65 15.71-29.17 31.36l32.23 340c1.48 15.65 16.94 27 34.53 25.31l31.85-3c17.59-1.67 30.65-15.71 29.17-31.36z' />
    </IconSVG>
  );
}

export function PlusIcon() {
  return (
    <IconSVG viewbox='0 0 1024 1024'> 
      <path d='M880 112H144c-17.7 0-32 14.3-32 32v736c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V144c0-17.7-14.3-32-32-32zM704 536c0 4.4-3.6 8-8 8H544v152c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V544H328c-4.4 0-8-3.6-8-8v-48c0-4.4 3.6-8 8-8h152V328c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v152h152c4.4 0 8 3.6 8 8v48z' />
    </IconSVG>
  );
}

export function UploadIcon() {
  return (
    <IconSVG viewbox='0 0 24 24'> 
      <path d='M11 15h2V9h3l-4-5-4 5h3z' />
      <path d='M20 18H4v-7H2v7c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2v-7h-2v7z' />
    </IconSVG>
  );
}

export function DownloadIcon() {
  return (
    <IconSVG viewbox='0 0 24 24'> 
      <path d="M12 16l4-5h-3V4h-2v7H8z" />
      <path d="M20 18H4v-7H2v7c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2v-7h-2v7z" />
    </IconSVG>
  );
}

export function CrownIcon() {
  return (
    <IconSVG viewbox='0 0 24 24'> 
      <path d='M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5m14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z' />
    </IconSVG>
  );
}

export function DumpBinIcon() {
  return (
    <IconSVG viewbox='0 0 24 24'> 
      <path d='M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19a2 2 0 002 2h8a2 2 0 002-2V7H6v12z' />
    </IconSVG>
  );
}