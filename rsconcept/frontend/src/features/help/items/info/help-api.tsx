import { useTx } from '@/i18n/use-tx';

import { TextURL } from '@/components/control';
import { external_urls } from '@/utils/constants';

export function HelpAPI() {
  const tx = useTx();
  return (
    <>
      <h1>{tx('tx.general.restApi')}</h1>
      <p>В качестве программного интерфейса сервера используется REST API, реализованный с помощью Django.</p>
      <p>На данный момент API находится в разработке, поэтому поддержка внешних запросов не производится.</p>
      <p>
        С описанием интерфейса можно ознакомиться <TextURL text='по ссылке' href={external_urls.restAPI} />.
      </p>
      <p>
        <TextURL text='Принять участие в разработке' href={external_urls.git_portal} />
      </p>
    </>
  );
}
