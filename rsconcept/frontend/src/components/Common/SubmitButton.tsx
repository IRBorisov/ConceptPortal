interface SubmitButtonProps {
  text: string
  loading?: boolean
  disabled?: boolean
  icon?: React.ReactNode
}

function SubmitButton({text='ОК', icon, disabled, loading=false}: SubmitButtonProps) {
  return (
    <button type='submit'
      className={`px-4 py-2 inline-flex items-center gap-2 align-middle justify-center font-bold disabled:cursor-not-allowed rounded clr-btn-primary ${loading ? ' cursor-progress': ''}`}
      disabled={disabled}
    >
      {icon && <span>{icon}</span>}
      {text && <span>{text}</span>}
    </button>
  )
}

export default SubmitButton;