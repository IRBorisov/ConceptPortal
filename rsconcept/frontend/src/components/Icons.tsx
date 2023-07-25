// Search new icons at https://reactsvgicons.com/

interface IconSVGProps {
  viewbox: string
  size?: number
  color?: string
  props?: React.SVGProps<SVGSVGElement>
  children: React.ReactNode
}

export interface IconProps {
  size?: number
  color?: string
}

function IconSVG({ viewbox, size = 6, color, props, children }: IconSVGProps) {
  const width = `${size * 1 / 4}rem`
  return (
    <svg
      width={width}
      height={width}
      className={`w-[${width}] h-[${width}] ${color ?? ''}`}
      fill='currentColor'
      viewBox={viewbox}
      {...props}
    >
      {children}
    </svg>
  );
}

export function MagnifyingGlassIcon({ size, ...props }: IconProps) {
  return (
      <IconSVG viewbox='0 0 20 20' size={size ?? 5} {...props} >
        <path d='M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z'/>
      </IconSVG>
  );
}

export function BellIcon(props: IconProps) {
  return (
    <IconSVG viewbox='0 0 20 20' {...props}>
      <path d='M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z' />
    </IconSVG>
  );
}

export function EyeIcon(props: IconProps) {
  return (
    <IconSVG viewbox='0 0 1024 1024' {...props}>
      <path d='M942.2 486.2C847.4 286.5 704.1 186 512 186c-192.2 0-335.4 100.5-430.2 300.3a60.3 60.3 0 000 51.5C176.6 737.5 319.9 838 512 838c192.2 0 335.4-100.5 430.2-300.3 7.7-16.2 7.7-35 0-51.5zM512 766c-161.3 0-279.4-81.8-362.7-254C232.6 339.8 350.7 258 512 258c161.3 0 279.4 81.8 362.7 254C791.5 684.2 673.4 766 512 766zm-4-430c-97.2 0-176 78.8-176 176s78.8 176 176 176 176-78.8 176-176-78.8-176-176-176zm0 288c-61.9 0-112-50.1-112-112s50.1-112 112-112 112 50.1 112 112-50.1 112-112 112z' />
    </IconSVG>
  );
}

export function EyeOffIcon(props: IconProps) {
  return (
    <IconSVG viewbox='0 0 1024 1024' {...props}>
      <path d='M942.2 486.2Q889.47 375.11 816.7 305l-50.88 50.88C807.31 395.53 843.45 447.4 874.7 512 791.5 684.2 673.4 766 512 766q-72.67 0-133.87-22.38L323 798.75Q408 838 512 838q288.3 0 430.2-300.3a60.29 60.29 0 000-51.5zm-63.57-320.64L836 122.88a8 8 0 00-11.32 0L715.31 232.2Q624.86 186 512 186q-288.3 0-430.2 300.3a60.3 60.3 0 000 51.5q56.69 119.4 136.5 191.41L112.48 835a8 8 0 000 11.31L155.17 889a8 8 0 0011.31 0l712.15-712.12a8 8 0 000-11.32zM149.3 512C232.6 339.8 350.7 258 512 258c54.54 0 104.13 9.36 149.12 28.39l-70.3 70.3a176 176 0 00-238.13 238.13l-83.42 83.42C223.1 637.49 183.3 582.28 149.3 512zm246.7 0a112.11 112.11 0 01146.2-106.69L401.31 546.2A112 112 0 01396 512z'/>
      <path d='M508 624c-3.46 0-6.87-.16-10.25-.47l-52.82 52.82a176.09 176.09 0 00227.42-227.42l-52.82 52.82c.31 3.38.47 6.79.47 10.25a111.94 111.94 0 01-112 112z' />
    </IconSVG>
  );
}

export function PenIcon(props: IconProps) {
  return (
    <IconSVG viewbox='-3 -3 21 21' {...props}>
      <path d='M15.502 1.94a.5.5 0 010 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 01.707 0l1.293 1.293zm-1.75 2.456l-2-2L4.939 9.21a.5.5 0 00-.121.196l-.805 2.414a.25.25 0 00.316.316l2.414-.805a.5.5 0 00.196-.12l6.813-6.814z' />
      <path d='M1 13.5A1.5 1.5 0 002.5 15h11a1.5 1.5 0 001.5-1.5v-6a.5.5 0 00-1 0v6a.5.5 0 01-.5.5h-11a.5.5 0 01-.5-.5v-11a.5.5 0 01.5-.5H9a.5.5 0 000-1H2.5A1.5 1.5 0 001 2.5v11z' />
    </IconSVG>
  );
}

export function SquaresIcon(props: IconProps) {
  return (
    <IconSVG viewbox='0 0 20 20' {...props}>
      <path d='M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' />
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

export function FrameIcon(props: IconProps) {
  return (
    <IconSVG viewbox='0 0 20 20' {...props}>
      <path d='M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v7h-2l-1 2H8l-1-2H5V5z' />
    </IconSVG>
  );
}

export function AsteriskIcon(props: IconProps) {
  return (
    <IconSVG viewbox='0 0 20 20' {...props}>
      <path d='M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z' />
    </IconSVG>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <IconSVG viewbox='0 0 24 24' {...props}>
      <path d='M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z' />
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

export function FilterCogIcon(props: IconProps) {
  return (
    <IconSVG viewbox='0 0 24 24' {...props}>
      <path d='M22.77 19.32l-1.07-.82c.02-.17.04-.33.04-.5s-.01-.33-.04-.5l1.06-.82a.26.26 0 00.06-.32l-1-1.73c-.06-.13-.19-.13-.32-.13l-1.23.5c-.27-.18-.54-.35-.85-.47l-.19-1.32A.236.236 0 0019 13h-2a.26.26 0 00-.26.21l-.19 1.32c-.3.13-.59.29-.85.47l-1.24-.5c-.11 0-.24 0-.31.13l-1 1.73c-.06.11-.04.24.06.32l1.06.82a4.193 4.193 0 000 1l-1.06.82a.26.26 0 00-.06.32l1 1.73c.06.13.19.13.31.13l1.24-.5c.26.18.54.35.85.47l.19 1.32c.02.12.12.21.26.21h2c.11 0 .22-.09.24-.21l.19-1.32c.3-.13.57-.29.84-.47l1.23.5c.13 0 .26 0 .33-.13l1-1.73a.26.26 0 00-.06-.32M18 19.5c-.84 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5M3 3c-.22 0-.43.08-.62.22a1 1 0 00-.17 1.4L7.97 12H8v5.87c-.04.29.06.6.29.83l2.01 2.01c.35.35.89.37 1.28.09-.38-.89-.58-1.84-.58-2.8 0-1.27.35-2.5 1-3.6V12h.03l5.76-7.38a1 1 0 00-.17-1.4c-.19-.14-.4-.22-.62-.22H3z' />
    </IconSVG>
  );
}

export function FilterIcon(props: IconProps) {
  return (
    <IconSVG viewbox='0 0 24 24' {...props}>
      <path d='M22 3H2l8 9.46V19l4 2v-8.54L22 3z' />
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

export function BookmarkIcon(props: IconProps) {
  return (
    <IconSVG viewbox='0 0 20 20' {...props}>
      <path d='M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm2.5 3a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm6.207.293a1 1 0 00-1.414 0l-6 6a1 1 0 101.414 1.414l6-6a1 1 0 000-1.414zM12.5 10a1.5 1.5 0 100 3 1.5 1.5 0 000-3z' />
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

export function DarkThemeIcon(props: IconProps) {
  return (
    <IconSVG viewbox='0 0 20 20' {...props}>
      <path d='M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z' />
    </IconSVG>
  );
}

export function LightThemeIcon(props: IconProps) {
  return (
    <IconSVG viewbox='0 0 20 20' {...props}>
      <path d='M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z' />
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

export function SmallPlusIcon(props: IconProps) {
  return (
    <IconSVG viewbox='0 0 24 24' {...props}>
      <path d='M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12zm10-8a8 8 0 100 16 8 8 0 000-16z'/>
      <path d='M13 7a1 1 0 10-2 0v4H7a1 1 0 100 2h4v4a1 1 0 102 0v-4h4a1 1 0 100-2h-4V7z'/>
    </IconSVG>
  );
}

export function UploadIcon(props: IconProps) {
  return (
    <IconSVG viewbox='0 0 24 24' {...props}>
      <path d='M11 15h2V9h3l-4-5-4 5h3z'/>
      <path d='M20 18H4v-7H2v7c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2v-7h-2v7z'/>
    </IconSVG>
  );
}

export function DownloadIcon(props: IconProps) {
  return (
    <IconSVG viewbox='0 0 24 24' {...props}>
      <path d='M12 16l4-5h-3V4h-2v7H8z'/>
      <path d='M20 18H4v-7H2v7c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2v-7h-2v7z'/>
    </IconSVG>
  );
}

export function CrownIcon(props: IconProps) {
  return (
    <IconSVG viewbox='0 0 24 24' {...props}>
      <path d='M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5m14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z' />
    </IconSVG>
  );
}

export function ArrowUpIcon(props: IconProps) {
  return (
    <IconSVG viewbox='0 0 16 16' {...props}>
      <path d='M8 12a.5.5 0 00.5-.5V5.707l2.146 2.147a.5.5 0 00.708-.708l-3-3a.5.5 0 00-.708 0l-3 3a.5.5 0 10.708.708L7.5 5.707V11.5a.5.5 0 00.5.5z' />
    </IconSVG>
  );
}

export function ArrowDownIcon(props: IconProps) {
  return (
    <IconSVG viewbox='0 0 16 16' {...props}>
      <path d='M8 4a.5.5 0 01.5.5v5.793l2.146-2.147a.5.5 0 01.708.708l-3 3a.5.5 0 01-.708 0l-3-3a.5.5 0 11.708-.708L7.5 10.293V4.5A.5.5 0 018 4z' />
    </IconSVG>
  );
}

export function CloneIcon(props: IconProps) {
  return (
    <IconSVG viewbox='0 0 512 512' {...props}>
      <path d='M64 464h224c8.8 0 16-7.2 16-16v-64h48v64c0 35.3-28.7 64-64 64H64c-35.35 0-64-28.7-64-64V224c0-35.3 28.65-64 64-64h64v48H64c-8.84 0-16 7.2-16 16v224c0 8.8 7.16 16 16 16zm96-400c0-35.35 28.7-64 64-64h224c35.3 0 64 28.65 64 64v224c0 35.3-28.7 64-64 64H224c-35.3 0-64-28.7-64-64V64zm64 240h224c8.8 0 16-7.2 16-16V64c0-8.84-7.2-16-16-16H224c-8.8 0-16 7.16-16 16v224c0 8.8 7.2 16 16 16z' />
    </IconSVG>
  );
}

export function DumpBinIcon(props: IconProps) {
  return (
    <IconSVG viewbox='0 0 24 24' {...props}>
      <path d='M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19a2 2 0 002 2h8a2 2 0 002-2V7H6v12z' />
    </IconSVG>
  );
}

export function ArrowsRotateIcon(props: IconProps) {
  return (
    <IconSVG viewbox='0 0 24 24' {...props}>
      <path d='M12 6v3l4-4-4-4v3a8 8 0 00-8 8c0 1.57.46 3.03 1.24 4.26L6.7 14.8A5.9 5.9 0 016 12a6 6 0 016-6m6.76 1.74L17.3 9.2c.44.84.7 1.8.7 2.8a6 6 0 01-6 6v-3l-4 4 4 4v-3a8 8 0 008-8c0-1.57-.46-3.03-1.24-4.26z' />
    </IconSVG>
  );
}

export function SaveIcon(props: IconProps) {
  return (
    <IconSVG viewbox='0 0 24 24' {...props}>
      <path d='M19.35 10.04A7.49 7.49 0 0012 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 000 14a6 6 0 006 6h13a5 5 0 005-5c0-2.64-2.05-4.78-4.65-4.96M19 18H6a4 4 0 01-4-4c0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95A5.469 5.469 0 0112 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5 1.53.11A2.98 2.98 0 0122 15a3 3 0 01-3 3M8 13h2.55v3h2.9v-3H16l-4-4-4 4z' />
    </IconSVG>
  );
}
