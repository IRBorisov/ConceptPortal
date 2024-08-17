import TextURL from '@/components/ui/TextURL';
import { external_urls } from '@/utils/constants';

function HelpAPI() {
  return (
    <div>
      <h1>Программный интерфейс Портала</h1>
      <p>В качестве программного интерфейса сервера используется REST API, реализованный с помощью Django.</p>
      <p>На данный момент API находится в разработке, поэтому поддержка внешних запросов не производится.</p>
      <p>
        С описанием интерфейса можно ознакомиться <TextURL text='по ссылке' href={external_urls.restAPI} />.
      </p>
      <p>
        <TextURL text='Принять участие в разработке' href={external_urls.git_portal} />
      </p>
    </div>
  );
}

export default HelpAPI;
