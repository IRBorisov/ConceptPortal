''' Utility: Text messages. '''
# pylint: skip-file


def constituentaNotInRSform(title: str):
    return f'Конституента не принадлежит схеме: {title}'


def constituentaNotFromOperation():
    return f'Конституента не соответствую аргументам операции'


def operationNotInOSS(title: str):
    return f'Операция не принадлежит ОСС: {title}'


def substitutionNotInList():
    return 'Отождествляемая конституента отсутствует в списке'


def schemaForbidden():
    return 'Нет доступа к схеме'


def operationNotInput(title: str):
    return f'Операция не является Загрузкой: {title}'


def operationNotSynthesis(title: str):
    return f'Операция не является Синтезом: {title}'


def operationResultNotEmpty(title: str):
    return f'Результат операции не пуст: {title}'


def renameTrivial(name: str):
    return f'Имя должно отличаться от текущего: {name}'


def substituteTrivial(name: str):
    return f'Отождествление конституенты с собой не корректно: {name}'


def substituteDouble(name: str):
    return f'Повторное отождествление: {name}'


def aliasTaken(name: str):
    return f'Имя уже используется: {name}'


def invalidLocation():
    return f'Некорректная строка расположения'


def invalidEnum(value: str):
    return f'Неподдерживаемое значение параметра: {value}'


def pyconceptFailure():
    return 'Invalid data response from pyconcept'


def typificationInvalidStr():
    return 'Invalid typification string'


def exteorFileVersionNotSupported():
    return 'Некорректный формат файла Экстеор. Сохраните файл в новой версии'


def invalidPosition():
    return 'Invalid position: should be positive integer'


def constituentaNoStructure():
    return 'Указанная конституента не обладает теоретико-множественной типизацией'


def missingFile():
    return 'Отсутствует прикрепленный файл'


def passwordAuthFailed():
    return 'Неизвестное сочетание имени пользователя (email) и пароля'


def passwordsNotMatch():
    return 'Введенные пароли не совпадают'


def emailAlreadyTaken():
    return 'Пользователь с данным email уже существует'
