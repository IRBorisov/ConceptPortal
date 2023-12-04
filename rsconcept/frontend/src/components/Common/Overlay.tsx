interface OverlayProps {
  children: React.ReactNode
  position?: string
  className?: string
  layer?: string
}

function Overlay({
  children, className,
  position='top-0 right-0',
  layer='z-pop'
}: OverlayProps) {
  return (
  <div className='relative'>
  <div className={`absolute ${className} ${position} ${layer}`}>
    {children}
  </div>
  </div>);
}

export default Overlay;
