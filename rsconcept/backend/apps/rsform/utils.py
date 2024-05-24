''' Utility functions '''
import json
import re
from io import BytesIO
from zipfile import ZipFile

from rest_framework.permissions import BasePermission, IsAuthenticated

# Name for JSON inside Exteor files archive
EXTEOR_INNER_FILENAME = 'document.json'

# Old style reference pattern
_REF_OLD_PATTERN = re.compile(r'@{([^0-9\-][^\}\|\{]*?)\|([^\}\|\{]*?)\|([^\}\|\{]*?)}')


class ObjectOwnerOrAdmin(BasePermission):
    ''' Permission for object ownership restriction '''
    def has_object_permission(self, request, view, obj):
        if request.user == obj.owner:
            return True
        if not hasattr(request.user, 'is_staff'):
            return False
        return request.user.is_staff # type: ignore


class IsClaimable(IsAuthenticated):
    ''' Permission for object ownership restriction '''
    def has_object_permission(self, request, view, obj):
        if not super().has_permission(request, view):
            return False
        return obj.is_common


class SchemaOwnerOrAdmin(BasePermission):
    ''' Permission for object ownership restriction '''
    def has_object_permission(self, request, view, obj):
        if request.user == obj.schema.owner:
            return True
        if not hasattr(request.user, 'is_staff'):
            return False
        return request.user.is_staff # type: ignore


class ItemOwnerOrAdmin(BasePermission):
    ''' Permission for object ownership restriction '''
    def has_object_permission(self, request, view, obj):
        if request.user == obj.item.owner:
            return True
        if not hasattr(request.user, 'is_staff'):
            return False
        return request.user.is_staff # type: ignore


def read_zipped_json(data, json_filename: str) -> dict:
    ''' Read JSON from zipped data '''
    with ZipFile(data, 'r') as archive:
        json_data = archive.read(json_filename)
    result: dict = json.loads(json_data)
    return result


def write_zipped_json(json_data: dict, json_filename: str) -> bytes:
    ''' Write json JSON to bytes buffer '''
    content = BytesIO()
    data = json.dumps(json_data, indent=4, ensure_ascii=False)
    with ZipFile(content, 'w') as archive:
        archive.writestr(json_filename, data=data)
    return content.getvalue()


def apply_pattern(text: str, mapping: dict[str, str], pattern: re.Pattern[str]) -> str:
    ''' Apply mapping to matching in regular expression pattern subgroup 1 '''
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


def fix_old_references(text: str) -> str:
    ''' Fix reference format: @{X1|nomn|sing} -> {X1|nomn,sing} '''
    if text == '':
        return text
    pos_input: int = 0
    output: str = ''
    for segment in re.finditer(_REF_OLD_PATTERN, text):
        output += text[pos_input : segment.start(0)]
        output += f'@{{{segment.group(1)}|{segment.group(2)},{segment.group(3)}}}'
        pos_input = segment.end(0)
    output += text[pos_input : len(text)]
    return output


def filename_for_schema(alias: str) -> str:
    ''' Generate filename for schema from alias. '''
    if alias == '' or not alias.isascii():
        # Note: non-ascii symbols in Content-Disposition
        # are not supported by some browsers
        return 'Schema.trs'
    return alias + '.trs'
