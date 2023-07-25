interface LabelProps {
  text: string
  htmlFor?: string
  required?: boolean
  title?: string
}

function Label({ text, htmlFor, required = false, title }: LabelProps) {
  return (
    <label
      className='text-sm font-semibold'
      htmlFor={htmlFor}
      title={ (required && !title) ? 'обязательное поле' : title }
      >
      {text + (required ? '*' : '')}
    </label>
  );
}

export default Label;
