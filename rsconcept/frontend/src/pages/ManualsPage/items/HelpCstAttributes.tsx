import LinkTopic from '@/components/ui/LinkTopic';
import { HelpTopic } from '@/models/miscellaneous';

function HelpCstAttributes() {
  return (
    <div className='dense'>
      <h1>Атрибуты конституенты</h1>
      <p>
        <b>Термин</b> может быть присвоен любой конституенте. Он используется в других Терминах и в Текстовых
        определениях
      </p>
      <p>
        <b>Формальное определение</b> строится с помощью формального аппарата{' '}
        <LinkTopic text='родоструктурной экспликации' topic={HelpTopic.RSLANG} />
      </p>
      <p>
        <b>Типизация</b> вычисляется автоматически на основе Формального определения и отражает структуру элементов
        множества, задаваемого этим определением
      </p>
      <p>
        <b>Текстовое определение</b> предоставляется для конституент, имеющих Формальное определение или Область
        определения. Это текстовая интерпретация формального определения и строится из связующих слов, терминов теории
        множеств и отсылок на термины ранее введенных конституент
      </p>
      <p>
        <b>Конвенция</b> – это соглашение о соотнесении неопределенного понятия с сущностями в предметной области
      </p>
      <p>
        <b>Комментарий</b> может быть добавлен к любому производному понятию для хранения дополнительной информации
      </p>

      <h2>Неопределяемые понятия</h2>
      <p>
        <code>X1, C1</code> – Базисные множества и Константные множества не обладают сложной структурой и определяются
        Конвенцией. Элементы Константных множеств участвуют в арифметических операциях и порядковых предикатах наряду с
        мощностями множеств
      </p>
      <p>
        <code>S1 :∈ ℬ(X1)</code> – Родовые структуры задаются совокупностью Области определения, Конвенции и набора
        Аксиом, а также Термином. Согласно Конвенции элементы родовой структуры заполняются из Области определения так,
        чтобы Аксиомы были выполнены. Родовая структура может быть как множеством, так и элементом или кортежем
      </p>
      <p>
        <code>A1 :== ∀(α,β)∈S1 (β,α)∈S1</code> – Аксиомы задаются логическим Формальным определением и по необходимости
        Конвенцией
      </p>
      <h2>Производные понятия</h2>
      <p>
        <code>D1 :== Pr1(S1)</code> – Термы задаются типизированным Формальным определением
      </p>
      <p>
        <code>T1 :== Pr1(S1)=Pr2(S1)</code> – Теоремы определяются логическим Формальным определением
      </p>
      <p>
        <code>F1 :== [σ∈ℬ(X1×X1)] Pr1(σ)\Pr2(σ)</code>
        <br />
        Терм-функции определяются параметризованным типизированным Формальным определением
      </p>
      <p>
        <code>P1 :== [σ∈ℬ(X1×X1)] card(Pr1(σ)) = card(σ)</code>
        <br />
        Предикат-функции определяются параметризованным логическим Формальным определением
      </p>
    </div>
  );
}

export default HelpCstAttributes;
