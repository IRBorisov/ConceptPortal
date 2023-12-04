interface FormProps {
  title?: string
  className?: string
  dimensions?: string
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  children: React.ReactNode
}

function Form({
  title, className, onSubmit, 
  dimensions='max-w-xs',
  children
}: FormProps) {
  return (
  <form
    className={`border shadow-md py-2 clr-app px-6 flex flex-col gap-3 ${dimensions} ${className}`}
    onSubmit={onSubmit}
  >
    { title ? <h1 className='text-xl whitespace-nowrap'>{title}</h1> : null }
    {children}
  </form>);
}

export default Form;