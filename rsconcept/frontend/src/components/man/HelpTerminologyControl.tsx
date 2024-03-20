function HelpTerminologyControl() {
  // prettier-ignore
  return (
  <div className='flex flex-col gap-2'>
    <h1>Терминологизация</h1>
    <p>Портал позволяет контролировать употребление терминов, привязанных к сущностям в концептуальных схемах.</p>
    <p>Для этого используется механизм текстовых отсылок: <i>использование термина</i> и <i>связывание слов.</i></p>
    <p>При отсылке к термину указывается параметры словоформы так, обеспечивающие корректное согласование слов.</p>
    <p><b>Граммема</b> - минимальная единица грамматической информами, например род, число, падеж.</p>
    <p><b>Словоформа</b> - грамматическая форма словосочетания, которая может меняться в зависимости от его грамматических характеристик.</p>
    <p><b>Лексема</b> - все грамматические формы и словосочетания, связанные с данным словосочетанием.</p>
    <p>При работе со словосочетаниями определяется основное слово, которое определяет набор граммем и используется для согласования с другими словами в предложении.</p>
  </div>);
}

export default HelpTerminologyControl;