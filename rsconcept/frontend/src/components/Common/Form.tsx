import Card from './Card';

interface FormProps {
  title: string
  widthClass?: string
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  children: React.ReactNode
}

function Form({title, onSubmit, widthClass='max-w-xs', children}: FormProps) {
  return (
    <div className='flex flex-col items-center w-full'>
      <Card title={title} widthClass={widthClass}>
        <form onSubmit={onSubmit}>
          {children}
        </form>
      </Card>
    </div>
  );
}

export default Form;