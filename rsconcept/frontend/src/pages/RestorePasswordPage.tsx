import AnimateFade from '@/components/AnimateFade';
import TextURL from '@/components/ui/TextURL';
import { urls } from '@/utils/constants';

function RestorePasswordPage() {
  return (
    <AnimateFade className='py-3'>
      <p>Автоматическое восстановление пароля не доступно.</p>
      <p>
        Возможно восстановление пароля через обращение на <TextURL href={urls.mail_portal} text='portal@acconcept.ru' />
      </p>
    </AnimateFade>
  );
}

export default RestorePasswordPage;
