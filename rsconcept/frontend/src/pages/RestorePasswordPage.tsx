import TextURL from '@/components/Common/TextURL';
import { urls } from '@/utils/constants';

function RestorePasswordPage() {
  return (
  <div className='py-3'>
    <p>Автоматическое восстановление пароля не доступно.</p>
    <p>Возможно восстановление пароля через обращение на <TextURL href={urls.mailportal} text='portal@acconcept.ru'/></p>
  </div>);
}

export default RestorePasswordPage;