''' Utility functions '''
import json
from io import BytesIO
import re
from zipfile import ZipFile
from rest_framework.permissions import BasePermission


class ObjectOwnerOrAdmin(BasePermission):
    ''' Permission for object ownership restriction '''
    def has_object_permission(self, request, view, obj):
        if request.user == obj.owner:
            return True
        if not hasattr(request.user, 'is_staff'):
            return False
        return request.user.is_staff # type: ignore


class SchemaOwnerOrAdmin(BasePermission):
    ''' Permission for object ownership restriction '''
    def has_object_permission(self, request, view, obj):
        if request.user == obj.schema.owner:
            return True
        if not hasattr(request.user, 'is_staff'):
            return False
        return request.user.is_staff # type: ignore


def read_trs(file) -> dict:
    ''' Read JSON from TRS file '''
    with ZipFile(file, 'r') as archive:
        json_data = archive.read('document.json')
    result: dict = json.loads(json_data)
    return result


def write_trs(json_data: dict) -> bytes:
    ''' Write json data to TRS file including version info '''
    content = BytesIO()
    data = json.dumps(json_data, indent=4, ensure_ascii=False)
    with ZipFile(content, 'w') as archive:
        archive.writestr('document.json', data=data)
    return content.getvalue()

def apply_mapping_pattern(text: str, mapping: dict[str, str], pattern: re.Pattern[str]) -> str:
    ''' Apply mapping to matching in regular expression patter subgroup 1. '''
    if text == '' or pattern == '':
        return text
    pos_input: int = 0
    output: str = ''
    for segment in re.finditer(pattern, text):
        entity = segment.group(1)
        if entity in mapping:
            output += text[pos_input : segment.start(1)]
            output += mapping[entity]
            output += text[segment.end(1) : segment.end(0)]
            pos_input = segment.end(0)
    output += text[pos_input : len(text)]
    return output
