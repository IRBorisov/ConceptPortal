''' Utility: Text messages. '''
# pylint: skip-file


def constituentaNotInRSform(title: str):
    return f'Конституента не принадлежит схеме: {title}'


def constituentaNotFromOperation():
    return f'Конституента не соответствую аргументам операции'


def operationNotInOSS(title: str):
    return f'Операция не принадлежит ОСС: {title}'


def parentNotInOSS():
    return f'Родительский блок не принадлежит ОСС'


def childNotInOSS():
    return f'Дочерний элемент блок не принадлежит ОСС'


def missingArguments():
    return 'Операция не содержит аргументов, при этом содержит отождествления'


def exteorFileCorrupted():
    return 'Файл Экстеор не соответствует ожидаемому формату. Попробуйте сохранить файл в новой версии'


def previousResultMissing():
    return 'Отсутствует результат предыдущей операции'


def substitutionNotInList():
    return 'Отождествляемая конституента отсутствует в списке'


def schemaForbidden():
    return 'Нет доступа к схеме'


def operationNotInput(title: str):
    return f'Операция не является Загрузкой: {title}'


def operationHasArguments(title: str):
    return f'Операция имеет аргументы: {title}'


def operationResultFromAnotherOSS():
    return 'Схема является результатом другой ОСС'


def schemasNotConnected():
    return 'Концептуальные схемы не связаны через ОСС'


def sourceEqualDestination():
    return 'Схема-источник и схема-получатель не могут быть одинаковыми'


def RelocatingInherited():
    return 'Невозможно переместить наследуемые конституенты'


def operationInputAlreadyConnected():
    return 'Схема уже подключена к другой операции'


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
