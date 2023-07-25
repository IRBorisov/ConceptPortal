interface InfoMessageProps {
  message: string
}

export function InfoMessage({ message }: InfoMessageProps) {
  return (
    <p className='font-bold'>{ message }</p>
  );
}

export default InfoMessage;
