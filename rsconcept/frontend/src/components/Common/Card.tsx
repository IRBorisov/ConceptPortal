interface CardProps {
  title?: string
  widthClass?: string
  children: React.ReactNode
}

function Card({title, widthClass='w-fit', children}: CardProps) {
  return (
    <div className={'border shadow-md py-2 bg-gray-50 dark:bg-gray-600 px-6 ' + widthClass}>
      { title && <h1 className='mb-2 text-xl font-bold'>{title}</h1> }
      {children}
    </div>
  );
}

export default Card;