interface SubmitButtonProps {
  text: string
  loading?: boolean
  disabled?: boolean
}

function SubmitButton({text='ОК', disabled, loading=false}: SubmitButtonProps) {
  const style = 'px-4 py-2 font-bold text-white disabled:cursor-not-allowed bg-blue-500 rounded hover:bg-blue-700 dark:bg-orange-500 dark:hover:bg-orange-300 disabled:bg-gray-400'
  return (
    <button type='submit'
      className={style + (loading ? ' cursor-progress': '')}
      disabled={disabled}
    >
      {text}
    </button>
  )
}

export default SubmitButton;