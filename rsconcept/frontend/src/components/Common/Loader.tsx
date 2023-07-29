import { ThreeDots } from 'react-loader-spinner';

export function Loader() {
  return (
    <div className='flex justify-center w-full h-full'>
      <ThreeDots color='rgb(96 165 250)' height='100' width='100' radius='10' />
    </div>
  );
}
