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
      className={`w-[${width}] h-[${width}] ${color}`}
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

export function FilterIcon(props: IconProps) {
  return (
    <IconSVG viewbox='0 0 24 24' {...props}>
      <path d='M21 3H5a1 1 0 00-1 1v2.59c0 .523.213 1.037.583 1.407L10 13.414V21a1.001 1.001 0 001.447.895l4-2c.339-.17.553-.516.553-.895v-5.586l5.417-5.417c.37-.37.583-.884.583-1.407V4a1 1 0 00-1-1zm-6.707 9.293A.996.996 0 0014 13v5.382l-2 1V13a.996.996 0 00-.293-.707L6 6.59V5h14.001l.002 1.583-5.71 5.71z' />
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

export function OwnerIcon(props: IconProps) {
  return (
    <IconSVG viewbox='0 0 24 24' {...props}>
      <path d='M20.787 9.023c-.125.027-1.803.418-3.953 1.774-.323-1.567-1.279-4.501-4.108-7.485L12 2.546l-.726.767C8.435 6.308 7.483 9.25 7.163 10.827 5.005 9.448 3.34 9.052 3.218 9.024L2 8.752V10c0 7.29 3.925 12 10 12 5.981 0 10-4.822 10-12V8.758l-1.213.265zM8.999 12.038c.002-.033.152-3.1 3.001-6.532C14.814 8.906 14.999 12 15 12v.125a18.933 18.933 0 00-3.01 3.154 19.877 19.877 0 00-2.991-3.113v-.128zM12 20c-5.316 0-7.549-4.196-7.937-8.564 1.655.718 4.616 2.426 7.107 6.123l.841 1.249.825-1.26c2.426-3.708 5.425-5.411 7.096-6.122C19.534 15.654 17.304 20 12 20z' />
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

export function CloneIcon(props: IconProps) {
  return (
    <IconSVG viewbox='0 0 24 24' {...props}>
      <path d='M11 10H9v3H6v2h3v3h2v-3h3v-2h-3z' />
      <path d='M4 22h12c1.103 0 2-.897 2-2V8c0-1.103-.897-2-2-2H4c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2zM4 8h12l.002 12H4V8z' />
      <path d='M20 2H8v2h12v12h2V4c0-1.103-.897-2-2-2z' />
    </IconSVG>
  );
}

export function DumpBinIcon(props: IconProps) {
  return (
    <IconSVG viewbox='0 0 24 24' {...props}>
      <path d='M5 20a2 2 0 002 2h10a2 2 0 002-2V8h2V6h-4V4a2 2 0 00-2-2H9a2 2 0 00-2 2v2H3v2h2zM9 4h6v2H9zM8 8h9v12H7V8z' />
      <path d='M9 10h2v8H9zm4 0h2v8h-2z' />
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
      <path d='M5 21h14a2 2 0 002-2V8a1 1 0 00-.29-.71l-4-4A1 1 0 0016 3H5a2 2 0 00-2 2v14a2 2 0 002 2zm10-2H9v-5h6zM13 7h-2V5h2zM5 5h2v4h8V5h.59L19 8.41V19h-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5H5z' />
    </IconSVG>
  );
}

export function HelpIcon(props: IconProps) {
  return (
    <IconSVG viewbox='0 0 24 24' {...props}>
      <path d='M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z' />
      <path d='M11 11h2v6h-2zm0-4h2v2h-2z' />
    </IconSVG>
  );
}

export function GithubIcon(props: IconProps) {
  return (
    <IconSVG viewbox='0 0 24 24' {...props}>
      <path d='M12 2.247a10 10 0 00-3.162 19.487c.5.088.687-.212.687-.475 0-.237-.012-1.025-.012-1.862-2.513.462-3.163-.613-3.363-1.175a3.636 3.636 0 00-1.025-1.413c-.35-.187-.85-.65-.013-.662a2.001 2.001 0 011.538 1.025 2.137 2.137 0 002.912.825 2.104 2.104 0 01.638-1.338c-2.225-.25-4.55-1.112-4.55-4.937a3.892 3.892 0 011.025-2.688 3.594 3.594 0 01.1-2.65s.837-.262 2.75 1.025a9.427 9.427 0 015 0c1.912-1.3 2.75-1.025 2.75-1.025a3.593 3.593 0 01.1 2.65 3.869 3.869 0 011.025 2.688c0 3.837-2.338 4.687-4.563 4.937a2.368 2.368 0 01.675 1.85c0 1.338-.012 2.413-.012 2.75 0 .263.187.575.687.475A10.005 10.005 0 0012 2.247z' />
    </IconSVG>
  );
}

export function MeshIcon(props: IconProps) {
  return (
    <IconSVG viewbox='0 0 1024 1024' {...props}>
      <path d='M872 394c4.4 0 8-3.6 8-8v-60c0-4.4-3.6-8-8-8H708V152c0-4.4-3.6-8-8-8h-64c-4.4 0-8 3.6-8 8v166H400V152c0-4.4-3.6-8-8-8h-64c-4.4 0-8 3.6-8 8v166H152c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h168v236H152c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h168v166c0 4.4 3.6 8 8 8h64c4.4 0 8-3.6 8-8V706h228v166c0 4.4 3.6 8 8 8h64c4.4 0 8-3.6 8-8V706h164c4.4 0 8-3.6 8-8v-60c0-4.4-3.6-8-8-8H708V394h164zM628 630H400V394h228v236z' />
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

export function GotoLastIcon(props: IconProps) {
  return (
    <IconSVG viewbox='0 0 24 24' {...props}>
      <path d='M7.707 17.707L13.414 12 7.707 6.293 6.293 7.707 10.586 12l-4.293 4.293zM15 6h2v12h-2z' />
    </IconSVG>
  );
}

export function GotoFirstIcon(props: IconProps) {
  return (
    <IconSVG viewbox='0 0 24 24' {...props}>
      <path d='M16.293 17.707l1.414-1.414L13.414 12l4.293-4.293-1.414-1.414L10.586 12zM7 6h2v12H7z' />
    </IconSVG>
  );
}

export function GotoNextIcon(props: IconProps) {
  return (
    <IconSVG viewbox='0 0 24 24' {...props}>
      <path d='M10.707 17.707L16.414 12l-5.707-5.707-1.414 1.414L13.586 12l-4.293 4.293z' />
    </IconSVG>
  );
}

export function GotoPrevIcon(props: IconProps) {
  return (
    <IconSVG viewbox='0 0 24 24' {...props}>
      <path d='M13.293 6.293L7.586 12l5.707 5.707 1.414-1.414L10.414 12l4.293-4.293z' />
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

export function ChevronUpIcon(props: IconProps) {
  return (
    <IconSVG viewbox='0 0 24 24' {...props}>
      <path d='M6.293 13.293l1.414 1.414L12 10.414l4.293 4.293 1.414-1.414L12 7.586z' />
    </IconSVG>
  );
}

export function ChevronDoubleUpIcon(props: IconProps) {
  return (
    <IconSVG viewbox='0 0 24 24' {...props}>
      <path d='M6.293 11.293l1.414 1.414L12 8.414l4.293 4.293 1.414-1.414L12 5.586z' />
      <path d='M6.293 16.293l1.414 1.414L12 13.414l4.293 4.293 1.414-1.414L12 10.586z' />
    </IconSVG>
  );
}

export function ChevronDoubleDownIcon(props: IconProps) {
  return (
    <IconSVG viewbox='0 0 24 24' {...props}>
      <path d='M12 15.586l-4.293-4.293-1.414 1.414L12 18.414l5.707-5.707-1.414-1.414z' />
      <path d='M17.707 7.707l-1.414-1.414L12 10.586 7.707 6.293 6.293 7.707 12 13.414z' />
    </IconSVG>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <IconSVG viewbox='0 0 24 24' {...props}>
      <path d='M10 15.586l-3.293-3.293-1.414 1.414L10 18.414l9.707-9.707-1.414-1.414z' />
    </IconSVG>
  );
}

export function CogIcon(props: IconProps) {
  return (
    <IconSVG viewbox='0 0 24 24' {...props}>
      <path d='M12 16c2.206 0 4-1.794 4-4s-1.794-4-4-4-4 1.794-4 4 1.794 4 4 4zm0-6c1.084 0 2 .916 2 2s-.916 2-2 2-2-.916-2-2 .916-2 2-2z' />
      <path d='M2.845 16.136l1 1.73c.531.917 1.809 1.261 2.73.73l.529-.306A8.1 8.1 0 009 19.402V20c0 1.103.897 2 2 2h2c1.103 0 2-.897 2-2v-.598a8.132 8.132 0 001.896-1.111l.529.306c.923.53 2.198.188 2.731-.731l.999-1.729a2.001 2.001 0 00-.731-2.732l-.505-.292a7.718 7.718 0 000-2.224l.505-.292a2.002 2.002 0 00.731-2.732l-.999-1.729c-.531-.92-1.808-1.265-2.731-.732l-.529.306A8.1 8.1 0 0015 4.598V4c0-1.103-.897-2-2-2h-2c-1.103 0-2 .897-2 2v.598a8.132 8.132 0 00-1.896 1.111l-.529-.306c-.924-.531-2.2-.187-2.731.732l-.999 1.729a2.001 2.001 0 00.731 2.732l.505.292a7.683 7.683 0 000 2.223l-.505.292a2.003 2.003 0 00-.731 2.733zm3.326-2.758A5.703 5.703 0 016 12c0-.462.058-.926.17-1.378a.999.999 0 00-.47-1.108l-1.123-.65.998-1.729 1.145.662a.997.997 0 001.188-.142 6.071 6.071 0 012.384-1.399A1 1 0 0011 5.3V4h2v1.3a1 1 0 00.708.956 6.083 6.083 0 012.384 1.399.999.999 0 001.188.142l1.144-.661 1 1.729-1.124.649a1 1 0 00-.47 1.108c.112.452.17.916.17 1.378 0 .461-.058.925-.171 1.378a1 1 0 00.471 1.108l1.123.649-.998 1.729-1.145-.661a.996.996 0 00-1.188.142 6.071 6.071 0 01-2.384 1.399A1 1 0 0013 18.7l.002 1.3H11v-1.3a1 1 0 00-.708-.956 6.083 6.083 0 01-2.384-1.399.992.992 0 00-1.188-.141l-1.144.662-1-1.729 1.124-.651a1 1 0 00.471-1.108z' />
    </IconSVG>
  );
}

export function CrossIcon(props: IconProps) {
  return (
    <IconSVG viewbox='0 0 21 21' {...props}>
      <g
        fillRule='evenodd'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <path d='M15.5 15.5l-10-10zM15.5 5.5l-10 10' />
      </g>
    </IconSVG>
  );
}
