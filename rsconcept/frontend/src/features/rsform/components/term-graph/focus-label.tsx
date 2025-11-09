import clsx from 'clsx';

interface FocusLabelProps {
  label: string;
}

export function FocusLabel({ label }: FocusLabelProps) {
  return (
    <div className={clsx('px-1', 'select-none', 'hover:bg-background', 'text-accent-purple-foreground rounded-md')}>
      <span aria-label='Фокус-конституента' className='whitespace-nowrap'>
        Фокус
        <b> {label} </b>
      </span>
    </div>
  );
}
