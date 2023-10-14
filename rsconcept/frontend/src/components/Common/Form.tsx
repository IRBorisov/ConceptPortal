interface FormProps {
  title: string
  dimensions?: string
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  children: React.ReactNode
}

function Form({ title, onSubmit, dimensions = 'max-w-xs', children }: FormProps) {
  return (
    <form
      className={`border shadow-md py-2 clr-app px-6 flex flex-col gap-3 ${dimensions}`}
      onSubmit={onSubmit}
    >
      { title && <h1 className='text-xl whitespace-nowrap'>{title}</h1> }
      {children}
    </form>
  );
}

export default Form;
