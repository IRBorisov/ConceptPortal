import AnimateFadeIn from '@/components/AnimateFadeIn';
import TextURL from '@/components/ui/TextURL';
import { urls } from '@/utils/constants';

function RestorePasswordPage() {
  return (
    <AnimateFadeIn className='py-3'>
      <p>Автоматическое восстановление пароля не доступно.</p>
      <p>
        Возможно восстановление пароля через обращение на <TextURL href={urls.mail_portal} text='portal@acconcept.ru' />
      </p>
    </AnimateFadeIn>
  );
}

export default RestorePasswordPage;
