interface SubmitButtonProps {
  text: string
  loading?: boolean
  disabled?: boolean
}

function SubmitButton({text='ОК', disabled, loading=false}: SubmitButtonProps) {
  return (
    <button type='submit'
      className={`px-4 py-2 font-bold text-white disabled:cursor-not-allowed rounded clr-btn-primary ${loading ? ' cursor-progress': ''}`}
      disabled={disabled}
    >
      {text}
    </button>
  )
}

export default SubmitButton;