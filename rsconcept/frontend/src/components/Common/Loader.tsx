import { ThreeDots } from 'react-loader-spinner';

interface LoaderProps {
  size?: number
}

export function Loader({size=10}: LoaderProps) {
  return (
    <div className='flex justify-center w-full h-full'>
      <ThreeDots
        color='rgb(96 165 250)'
        height={size*10}
        width={size*10}
        radius={size}
      />
    </div>
  );
}
