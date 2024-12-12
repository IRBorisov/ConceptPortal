'use client';

import { useConceptOptions } from '@/context/ConceptOptionsContext';

interface LoaderProps {
  /** Scale of the loader from 1 to 10. */
  scale?: number;

  /** Show a circular loader. */
  circular?: boolean;
}

const animateRotation = (duration: string) => {
  return (
    <animateTransform
      attributeName='transform'
      attributeType='XML'
      type='rotate'
      dur={duration}
      from='0 50 50'
      to='360 50 50'
      repeatCount='indefinite'
    />
  );
};

const animatePulse = (startBig: boolean, duration: string) => {
  return (
    <>
      <animate
        attributeName='r'
        from={startBig ? '15' : '9'}
        to={startBig ? '15' : '9'}
        begin='0s'
        dur={duration}
        values={startBig ? '15;9;15' : '9;15;9'}
        calcMode='linear'
        repeatCount='indefinite'
      />
      <animate
        attributeName='fill-opacity'
        from={startBig ? '1' : '.5'}
        to={startBig ? '.5' : '1'}
        begin='0s'
        dur={duration}
        values={startBig ? '1;.5;1' : '.5;1;.5'}
        calcMode='linear'
        repeatCount='indefinite'
      />
    </>
  );
};

/**
 * Displays animated loader.
 */
function Loader({ scale = 5, circular }: LoaderProps) {
  const { colors } = useConceptOptions();
  if (circular) {
    return (
      <div className='flex justify-center' aria-label='three-circles-loading' aria-busy='true' role='progressbar'>
        <svg height={`${scale * 20}`} width={`${scale * 20}`} viewBox='0 0 100 100' fill={colors.bgPrimary}>
          <path d='M31.6,3.5C5.9,13.6-6.6,42.7,3.5,68.4c10.1,25.7,39.2,38.3,64.9,28.1l-3.1-7.9c-21.3,8.4-45.4-2-53.8-23.3 c-8.4-21.3,2-45.4,23.3-53.8L31.6,3.5z'>
            {animateRotation('2.25s')}
          </path>
          <path d='M82,35.7C74.1,18,53.4,10.1,35.7,18S10.1,46.6,18,64.3l7.6-3.4c-6-13.5,0-29.3,13.5-35.3s29.3,0,35.3,13.5 L82,35.7z'>
            {animateRotation('1.75s')}
          </path>
          <path d='M42.3,39.6c5.7-4.3,13.9-3.1,18.1,2.7c4.3,5.7,3.1,13.9-2.7,18.1l4.1,5.5c8.8-6.5,10.6-19,4.1-27.7 c-6.5-8.8-19-10.6-27.7-4.1L42.3,39.6z'>
            {animateRotation('0.75s')}
          </path>
        </svg>
      </div>
    );
  } else {
    return (
      <div className='flex justify-center' aria-busy='true' role='progressbar'>
        <svg height={`${scale * 20}`} width={`${scale * 20}`} viewBox='0 0 120 30' fill={colors.bgPrimary}>
          <circle cx='15' cy='15' r='16'>
            {animatePulse(true, '0.8s')}
          </circle>
          <circle cx='60' cy='15' r='10' attributeName='fill-opacity' from='1' to='0.3'>
            {animatePulse(false, '0.8s')}
          </circle>
          <circle cx='105' cy='15' r='16'>
            {animatePulse(true, '0.8s')}
          </circle>
        </svg>
      </div>
    );
  }
}

export default Loader;
