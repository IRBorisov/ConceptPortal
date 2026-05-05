/** Russian UI copy for dialogs and toolbars. */
export const uiRu: Record<string, string> = {
  'ui.action.upload': 'Загрузить',

  'ui.library.editor.openInLibrary': 'Открыть в библиотеке',
  'ui.library.editor.pathInheritedOss': 'Путь наследуется от ОСС',
  'ui.library.editor.ownerInheritedOss': 'Владелец наследуется от ОСС',
  'ui.library.pickLocation.explorerTitle': 'Проводник…',

  'ui.ai.prompt.editTemplateTitle': 'Редактировать шаблон',
  'ui.ai.prompt.copyResultTitle': 'Скопировать результат в буфер обмена',

  'ui.dlg.createCst.header': 'Создание конституенты',
  'ui.dlg.cstTemplate.header': 'Создание конституенты из шаблона',
  'ui.dlg.cstTemplate.tabTemplate.title': 'Выбор шаблона выражения',
  'ui.dlg.cstTemplate.tabArgs.title': 'Подстановка аргументов шаблона',

  'ui.dlg.createVersion.header': 'Создание версии',
  'ui.dlg.createVersion.onlySelected': 'Только выбранные конституенты [{n} из {total}]',

  'ui.dlg.editVersions.header': 'Редактирование версий',

  'ui.dlg.uploadRsform.header': 'Импорт схемы из Экстеора',
  'ui.dlg.uploadRsform.pickFile': 'Выбрать файл',
  'ui.dlg.uploadRsform.loadMetadata': 'Загружать название и комментарий',
  'ui.dlg.uploadRsform.warningBody': 'При загрузке из файла все конституенты текущей КС будут удалены',

  'ui.oss.newBlockTitle': 'Название нового блока',
  'ui.oss.newSchemaTitle': 'Название новой схемы',
  'ui.oss.operationTitle': 'Название операции',
  'ui.oss.blockTitle': 'Название блока',
  'ui.oss.enterAlias': 'Введите сокращение',
  'ui.oss.argumentPickLabel': 'Выбор аргументов: [ {count} ]',

  'ui.dlg.editBlock.header': 'Редактирование блока',

  'ui.dlg.createBlock.header': 'Создание блока',
  'ui.dlg.createBlock.tabPassport.title': 'Основные атрибуты блока',
  'ui.dlg.createBlock.tabChildren.title': 'Выбор вложенных узлов: [{count}]',
  'ui.dlg.createBlock.tabChildren.label': 'Содержимое{mark}',

  'ui.dlg.clone.headerRsform': 'Создание копии концептуальной схемы',
  'ui.dlg.clone.headerRsmodel': 'Создание копии концептуальной модели',

  'ui.tg.selectionCount': 'Выбор {n} из {total}',

  'ui.dlg.ossOp.importHeader': 'Создание операции: Загрузка',
  'ui.dlg.ossOp.newSchemaHeader': 'Создание операции: Новая схема',
  'ui.label.cloneSchema': 'Клонировать схему',

  'ui.action.move': 'Переместить',
  'ui.placeholder.sourceSchema': 'Исходная схема',
  'ui.placeholder.targetSchema': 'Целевая схема',
  'ui.title.relocationDirection': 'Направление перемещения',

  'ui.dlg.renameCst.header': 'Переименование конституенты',

  'ui.dlg.editCst.header': 'Редактирование конституенты',
  'ui.dlg.editCst.titleDetailedEdit': 'Детальное редактирование',
  'ui.dlg.editCst.titleGoToAncestor': 'Перейти к предку',

  'ui.placeholder.termForDefinitions': 'Обозначение для текстовых определений',
  'ui.label.attributingConstituents': 'Атрибутирующие конституенты',
  'ui.placeholder.selectConstituents': 'Выберите конституенты',
  'ui.placeholder.textDefinitionHint': 'Текстовая интерпретация формального выражения',
  'ui.placeholder.conventionBasic': 'Договоренность об интерпретации базового понятия',
  'ui.placeholder.developerComment': 'Пояснение разработчика',

  'ui.action.addConstituents': 'Добавить конституенты',
  'ui.tab.inlineSynthesis.schemaTitle': 'Источник конституент',
  'ui.tab.inlineSynthesis.selectSchemaFirst': 'Выберите схему',
  'ui.tab.inlineSynthesis.constituentsTitle': 'Перечень конституент',
  'ui.tab.inlineSynthesis.substitutionsTitle': 'Таблица отождествлений',
  'ui.inlineSynthesis.selected': 'Выбрана',
  'ui.placeholder.schemaNotSelected': 'Схема не выбрана',

  'ui.validation.termEmpty': 'Пустой термин',
  'ui.validation.termHomonyms': 'Термин совпадает с конституентами: {aliases}',
  'ui.validation.conventionEmpty': 'Пустая конвенция',
  'ui.placeholder.expressionMissing': 'Выражение отсутствует',
  'ui.placeholder.termMissing': 'Термин отсутствует',
  'ui.placeholder.definitionMissing': 'Определение отсутствует',

  'ui.dlg.createSynthesis.header': 'Создание операции синтеза',
  'ui.dlg.editOperation.header': 'Редактирование операции',
  'ui.tab.oss.passportTitle': 'Текстовые поля',
  'ui.tab.oss.operationArgumentsTitle': 'Выбор аргументов операции',

  'ui.dlg.changeLocation.header': 'Изменение расположения',
  'ui.dlg.changeLocation.invalidHint':
    'Допустимы буквы, цифры, подчерк, пробел и "!". Сегмент пути не может начинаться и заканчиваться пробелом. Общая длина (с корнем) не должна превышать {maxLen}',

  'ui.field.rsformTitle': 'Название схемы',
  'ui.field.rsmodelTitle': 'Название модели',
  'ui.field.ossTitle': 'Название операционной системы',

  'ui.aria.recalculateAll': 'Пересчитать все вычисления',
  'ui.aria.copyLinkToClipboard': 'Скопировать ссылку в буфер обмена',
  'ui.action.qrCode': 'QR-код',
  'ui.hint.qrSchemaPage': 'Показать QR-код схемы',
  'ui.action.openInSandbox': 'Открыть в песочнице',
  'ui.action.exportPdf': 'Экспорт в PDF',
  'ui.action.exportToExteor': 'Выгрузить в Экстеор',
  'ui.action.importFromExteor': 'Загрузить из Экстеор',

  'ui.sandbox.saveToFile': 'Сохранить в файл',
  'ui.sandbox.saveToFileHint': 'Скачать текущие данные песочницы в JSON',
  'ui.sandbox.loadFromFile': 'Загрузить из файла',
  'ui.sandbox.loadFromFileHint': 'Загрузить данные песочницы из JSON',
  'ui.sandbox.createSchemaHint': 'Создать новую концептуальную схему из текущих данных песочницы',
  'ui.sandbox.createModelHint': 'Создать новую концептуальную схему и модель из текущих данных песочницы',
  'ui.sandbox.resetStateHint': 'Восстановить стартовые данные песочницы',

  'ui.substitution.acceptSuggestion': 'Принять предложение',
  'ui.substitution.ignoreSuggestion': 'Игнорировать предложение',
  'ui.substitution.replaceRight': 'Заменить правую',
  'ui.substitution.replaceLeft': 'Заменить левую',
  'ui.substitution.addToTable': 'Добавить в таблицу отождествлений',
  'ui.substitution.tableEmptyHint': 'Добавьте отождествление',

  'ui.action.exportData': 'Экспортировать данные',

  'ui.ai.deleteTemplate': 'Удалить шаблон',

  'ui.cst.crucialRemoveTitle': 'Снять статус ключевой',
  'ui.cst.crucialAddTitle': 'Добавить статус ключевой',
  'ui.cst.crucialBadgeOn': 'ключевая',
  'ui.cst.crucialBadgeOff': 'обычная',
  'ui.hint.renameCst': 'Переименовать конституенту',
  'ui.action.expandStructure': 'Раскрыть структуру',
  'ui.hint.conceptStructure': 'Управление структурой понятия',

  'ui.cst.gotoSourceInOss': 'Перейти к исходной конституенте в ОСС',
  'ui.cst.noPredecessor': 'Конституента не имеет предка',
  'ui.hint.resetUnsavedChanges': 'Сбросить несохраненные изменения',
  'ui.eval.viewValue': 'Смотреть значение',
  'ui.eval.viewStructuredUnavailable': 'Просмотр структурированного значения\nнедоступен для этого типа',
  'ui.action.exportShort': 'Экспорт',
  'ui.eval.copyToClipboard': 'Скопировать в буфер',
  'ui.eval.saveAsJson': 'Сохранить как JSON',
  'ui.rsmodel.calculateCurrentCst': 'Вычислить текущую конституенту',

  'ui.oss.menu.editOperation': 'Редактировать операцию',
  'ui.oss.menu.selectOriginal': 'Выделить оригинал',
  'ui.oss.menu.openLinkedRsform': 'Открыть привязанную КС',
  'ui.hint.doubleClick': 'Двойной клик',
  'ui.oss.menu.createEmptySchemaTitle': 'Создать пустую схему',
  'ui.oss.menu.loadSchema': 'Загрузить схему',
  'ui.oss.menu.changeSchema': 'Изменить схему',
  'ui.oss.menu.pickSchemaTitle': 'Выбрать схему для загрузки',
  'ui.oss.menu.activateSynthesis': 'Активировать синтез',
  'ui.oss.menu.activateSynthesisReadyTitle': 'Активировать операцию\nи получить синтезированную КС',
  'ui.oss.menu.activateSynthesisNeedArgs': 'Необходимо предоставить все аргументы',
  'ui.oss.menu.activateSynthesisAria': 'Активировать операцию и получить синтезированную КС',
  'ui.oss.menu.cloneResultSchemaTitle': 'Создать и загрузить копию концептуальной схемы',

  'ui.versioning.cannotRevertOss': 'Невозможно откатить КС,\nприкрепленную к операционной схеме',
  'ui.versioning.revertToVersion': 'Откатить к версии',
  'ui.versioning.switchToStaleVersion': 'Переключитесь на\nнеактуальную версию',
  'ui.versioning.revertSelectedAria': 'Откатить к выбранной версии',
  'ui.versioning.createVersion': 'Создать версию',
  'ui.versioning.switchToLatestVersion': 'Переключитесь\nна актуальную версию',
  'ui.versioning.switchLatestAria': 'Переключить на актуальную версию',
  'ui.versioning.listEmpty': 'Список версий пуст',
  'ui.versioning.editVersions': 'Редактировать версии',

  'ui.action.importShort': 'Импорт'
};
