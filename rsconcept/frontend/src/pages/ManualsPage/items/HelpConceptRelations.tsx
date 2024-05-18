import LinkTopic from '@/components/ui/LinkTopic';
import { HelpTopic } from '@/models/miscellaneous';

function HelpConceptRelations() {
  return (
    <div>
      <h1>Связи между конституентами</h1>
      <p>
        Конституенты связаны между собой через использование одних конституент при определении других. Такую связь в
        общем случае называют <b>используется в определении</b>. Она является основой для построения <b>Графа термов</b>
        , отображающего последовательность вывода понятий в концептуальной схеме.
      </p>

      <p>
        Если в формальном выражении используются только базовые структурные формулы, то такое определение называется
        "простым" или "строго формальным". То есть для построения подобных определений достаточно формально применить
        конструкции языка, новые договоренности об использовании содержания предметной области не требуются.
      </p>
      <p>
        Такой способ построения определений называется <b>формальным разворачиванием</b> и зачастую используется для
        описания сложно структурированных понятий и порождения{' '}
        <LinkTopic text='разнообразий' topic={HelpTopic.CC_SYSTEM} />.
      </p>
      <p>
        Если понятие определено с использованием только одного другого понятия простым определением, то оно называется{' '}
        <b>порожденным</b>, а исходное понятие, – <b>основой</b>.
      </p>
      <p>
        Другой способ определения называется содержательным (дедуктивным) разворачиванием. При этом используются более
        сложные конструкции, подразумевающие перебор объектов и проверку их свойств с помощью логических условий. В
        родоструктурной экспликации к таким конструкциям относятся кванторные выражения утверждений, декларативное,
        императивное и рекурсивное определения.
      </p>
      <p>
        <b>Родо-видовое отношение</b> между понятиями формализуется с помощью определения, где из элементов множества,
        соответствующего родовому понятию формируются элементы видового понятия путем отбора по условию.
      </p>
    </div>
  );
}

export default HelpConceptRelations;
