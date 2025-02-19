import { IconPredecessor } from '@/components/Icons';

import { LinkTopic } from '../../components/LinkTopic';
import { HelpTopic } from '../../models/helpTopic';

export function HelpConceptPropagation() {
  return (
    <div className='text-justify'>
      <h1>Сквозные изменения</h1>
      <p>
        Портал поддерживает <b>сквозные изменения</b> в рамках <LinkTopic text='ОСС' topic={HelpTopic.CC_OSS} />.
        Изменения, внесенные в исходные концептуальные схемы автоматически проносятся через граф синтеза (путем
        обновления наследованных конституент). Формальные определения и конвенции наследованных конституент можно
        редактировать только путем изменения{' '}
        <span className='text-nowrap'>
          <IconPredecessor className='inline-icon' /> <b>исходных конституент</b>.
        </span>
      </p>
      <p>
        Изменения на уровне концептуальной схемы (добавление/удаление/изменение) конституенты приводят к автоматическому
        созданию / удаление / обновлению наследованных конституент. Если удаляемые конституенты находятся в таблице
        отождествлений одной из операций, то такие отождествления <u>будут автоматические отменены</u>.
      </p>
      <p>
        После отмены отождествления на заново восстановленную конституенту не обновляются ссылки в собственных
        конституентах синтезированный схемы.
      </p>
      <p>
        Удаление концептуальной схемы, привязанной к операции приводит к автоматическому удалению всех наследованных
        конституент. В дальнейшем можно повторно выполнить как операцию загрузки, так и синтез. Однако дописанные
        конституенты и отмененные отождествления <u>восстановлены не будут</u>.
      </p>
      <p>
        При изменении аргументов операции синтеза в случае наличия привязанной схемы соответствующие конституенты
        аргументов будут автоматически добавлены / удалены. Таблицы отождествлений будут соответствующим образом
        скорректированы так, чтобы не использовать удаленные конституенты.
      </p>
      <p>
        Удаление операции возможно для операций Загрузка без ограничений и для Синтеза в случае, когда операция не
        является аргументом другой операции. При удалении операции можно выбрать опцию "удалить схему", чтобы удалить
        концептуальную схему из базы портала. Также можно выбрать опцию "сохранить конституенты", в результате которой
        наследованные конституенты в операциях ниже по графу станут исходными.
      </p>
    </div>
  );
}
