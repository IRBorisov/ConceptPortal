import { LinkTopic } from '@/components/ui/Control';
import { HelpTopic } from '@/models/miscellaneous';

function HelpRSLangInterpret() {
  return (
    <div className='text-justify'>
      <h1>Интерпретируемость</h1>
      <p>
        Практическое применение концептуальным схем основано на <b>интерпретации</b> - соотнесении предметного
        содержания и схемных терминов и определений. Для этого в соответствии с{' '}
        <LinkTopic text='конвенциями' topic={HelpTopic.CC_CONSTITUENTA} /> вводятся списки объектов предметной области,
        соответствующих неопределяемым понятиям. При этом обеспечивается корректность отношений{' '}
        <LinkTopic text='типизации' topic={HelpTopic.RSL_TYPES} /> для родовых структур.
      </p>
      <p>
        Интерпретация производных понятий может быть задана внешними методами либо автоматически вычислена с помощью
        формальных определений. При этом не всякое выражение, содержащее перебор элементов множеств, может быть
        вычислено за приемлемое время. Например, интерпретация утверждения {'"∀α∈Z α>0"'} приводит к перебору
        бесконечного множества целых чисел.
      </p>
      <p>
        <b>Интерпретируемыми</b> будем считать выражения, которые можно вычислить за полиномиальное время относительно
        мощностей интерпретаций глобальных идентификаторов, используемых в этом выражении. По аналогии с{' '}
        <LinkTopic text='биективной переносимостью' topic={HelpTopic.RSL_CORRECT} /> условия интерпретируемости могут
        быть выведены из утверждения "выражения <code>Z, ℬ(α)</code> не интерпретируемы".
      </p>
      <p>
        Также вводится категория выражений, задающих множества, которым можно принадлежность за полиномиальное время, но
        нельзя вычислить полный список элемент.
        <br />
        Например, <code>{'D{ξ∈ℬ(X1×X1) | Pr1(ξ)=Pr2(ξ)}'}</code>.
      </p>
      <p>
        Конституенты, чьи выражения удовлетворяет этому свойству, называются <b>Неразмерными</b>. Их можно использовать
        в интерпретируемых выражениях только в конструкциях, не требующих перебора их элементах.
      </p>
      <p>
        Конституенты, чьи выражения не позволяют проверить принадлежность за полиномиальное время, называются{' '}
        <b>Невычислимыми</b>.
      </p>
    </div>
  );
}

export default HelpRSLangInterpret;
