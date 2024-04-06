// Search new icons at https://reactsvgicons.com/

export { FiSave as IconSave } from 'react-icons/fi';
export { BiCheck as IconAccept } from 'react-icons/bi';
export { BiX as IconClose } from 'react-icons/bi';
export { BiX as IconRemove } from 'react-icons/bi';
export { BiTrash as IconDestroy } from 'react-icons/bi';
export { BiReset as IconReset } from 'react-icons/bi';
export { BiPlusCircle as IconNewItem } from 'react-icons/bi';
export { BiDuplicate as IconClone } from 'react-icons/bi';
export { LuReplace as IconReplace } from 'react-icons/lu';
export { BiDownload as IconDownload } from 'react-icons/bi';
export { BiUpload as IconUpload } from 'react-icons/bi';
export { LiaEdit as IconEdit } from 'react-icons/lia';
export { RiPushpinFill as IconPin } from 'react-icons/ri';
export { RiUnpinLine as IconUnpin } from 'react-icons/ri';
export { BiCog as IconSettings } from 'react-icons/bi';
export { LuUserCircle2 as IconUser } from 'react-icons/lu';
export { LuCrown as IconOwner } from 'react-icons/lu';
export { BiMeteor as IconAdmin } from 'react-icons/bi';
export { LuGlasses as IconReader } from 'react-icons/lu';
export { FiBell as IconFollow } from 'react-icons/fi';
export { FiBellOff as IconFollowOff } from 'react-icons/fi';

export { TbColumns as IconList } from 'react-icons/tb';
export { TbColumnsOff as IconListOff } from 'react-icons/tb';
export { BiFontFamily as IconText } from 'react-icons/bi';
export { BiFont as IconTextOff } from 'react-icons/bi';
export { RiTreeLine as IconTree } from 'react-icons/ri';

export { BiCollapse as IconGraphCollapse } from 'react-icons/bi';
export { BiExpand as IconGraphExpand } from 'react-icons/bi';
export { LuMaximize as IconGraphMaximize } from 'react-icons/lu';
export { BiGitBranch as IconGraphInputs } from 'react-icons/bi';
export { BiGitMerge as IconGraphOutputs } from 'react-icons/bi';

export { BiCheckShield as IconImmutable } from 'react-icons/bi';
export { RiOpenSourceLine as IconPublic } from 'react-icons/ri';
export { BiShareAlt as IconShare } from 'react-icons/bi';
export { LuLightbulb as IconHelp } from 'react-icons/lu';
export { LuLightbulbOff as IconHelpOff } from 'react-icons/lu';
export { BiFilterAlt as IconFilter } from 'react-icons/bi';
export { BiUpvote as IconMoveUp } from 'react-icons/bi';
export { BiDownvote as IconMoveDown } from 'react-icons/bi';

export { LuRotate3D as IconRotate3D } from 'react-icons/lu';
export { MdOutlineFitScreen as IconFitImage } from 'react-icons/md';
export { LuSparkles as IconClustering } from 'react-icons/lu';
export { LuSparkle as IconClusteringOff } from 'react-icons/lu';

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

export function IconManuals(props: IconProps) {
  return (
    <IconSVG viewBox='0 0 20 20' {...props}>
      <path d='M3.33 8L10 12l10-6-10-6L0 6h10v2H3.33zM0 8v8l2-2.22V9.2L0 8zm10 12l-5-3-2-1.2v-6l7 4.2 7-4.2v6L10 20z' />
    </IconSVG>
  );
}

export function IconLogin(props: IconProps) {
  return (
    <IconSVG viewBox='0 0 24 24' {...props}>
      <path fill='none' d='M0 0h24v24H0z' />
      <path d='M10 11H4V3a1 1 0 011-1h14a1 1 0 011 1v18a1 1 0 01-1 1H5a1 1 0 01-1-1v-8h6v3l5-4-5-4v3z' />
    </IconSVG>
  );
}

export function CheckboxChecked() {
  return (
    <svg className='w-3 h-3' viewBox='0 0 512 512' fill='#ffffff'>
      <path d='M470.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L192 338.7l233.4-233.3c12.5-12.5 32.8-12.5 45.3 0z' />
    </svg>
  );
}

export function CheckboxNull() {
  return (
    <svg className='w-3 h-3' viewBox='0 0 16 16' fill='#ffffff'>
      <path d='M2 7.75A.75.75 0 012.75 7h10a.75.75 0 010 1.5h-10A.75.75 0 012 7.75z' />
    </svg>
  );
}
