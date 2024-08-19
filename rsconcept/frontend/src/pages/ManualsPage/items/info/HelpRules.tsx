import { urls } from '@/app/urls';
import TextURL from '@/components/ui/TextURL';
import { external_urls } from '@/utils/constants';

function HelpRules() {
  return (
    <div>
      <h1>Правила поведения участников Портала</h1>

      <p>
        Мы стремимся предоставить возможность участия в работе Портала как можно большему количеству людей. Мы считаем,
        что сообщества участников у нас должны быть как можно более разнообразными и открытыми для новых участников. Мы
        хотим, чтобы эти сообщества представляли собой позитивное, безопасное и здоровое окружение для всех, кто
        присоединяется или хочет присоединиться к ним. Мы стремимся сохранить такое окружение, в том числе путем
        принятия этих Правил поведения. Кроме того, мы хотим защитить наши проекты от тех, кто портит или искажает их
        содержание, поэтому к участникам, нарушающим Правила будут применяться санкции, определяемые Администрацией
        Портала.
      </p>

      <p>
        Поведение в рамках Портала основано на уважении, вежливости, коллегиальности, солидарности и социальной
        ответственности. Это относится ко всем читателям, участникам и администраторам в их взаимодействии без
        исключений, основанных на возрасте, умственных или физических возможностях, внешнем виде, национальном,
        религиозном, этническом и культурном происхождении, касте, социальном классе, уровне владения языком,
        сексуальной ориентации, гендерной идентичности, поле или сфере работы. Мы также не будем делать исключения на
        основании статуса, навыков или достижений.
      </p>

      <h2>Ожидаемое поведение</h2>
      <li>взаимное уважением, поддержка в отношениях с участниками Портала.</li>
      <li>
        пожелания по доработке, найденные ошибки и иные предложения следует направлять по адресу email:{' '}
        <TextURL href={external_urls.mail_portal} text='portal@acconcept.ru' />.
      </li>

      <h2>Неприемлемое поведение</h2>
      <li>оскорбления, угрозы, сексуальное домогательство, троллинг и преследование других участников.</li>
      <li>
        раскрытие персональных данных (доксинг) участников Портала. Не распространяется на персональные данные,
        раскрытые участниками для отображения на Портале. Эти данные можно изменить в{' '}
        <TextURL text='профиле' href={urls.profile} />.
      </li>
      <li>
        злоупотребление властью, привилегиями или влиянием, включая использование статусов и доступов, предоставленных
        Порталом в личных целях, не связанных с разработкой контента, развитием и продвижением Портала.
      </li>
      <li>
        вандализм, намеренное добавление неуместного контента, или препятствование, затруднение или другого рода
        осложнение создания (и/или поддержания) контента, созданного другими участниками.
      </li>
      <li>нарушение работоспособности Портала, в том числе путем использования уязвимостей и ошибок в коде.</li>
    </div>
  );
}

export default HelpRules;