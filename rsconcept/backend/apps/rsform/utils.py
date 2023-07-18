''' Utility functions '''
import json
from io import BytesIO
from zipfile import ZipFile
from rest_framework.permissions import BasePermission


class ObjectOwnerOrAdmin(BasePermission):
    ''' Permission for object ownership restriction '''
    def has_object_permission(self, request, view, obj):
        return request.user == obj.owner or request.user.is_staff


class SchemaOwnerOrAdmin(BasePermission):
    ''' Permission for object ownership restriction '''
    def has_object_permission(self, request, view, obj):
        return request.user == obj.schema.owner or request.user.is_staff


def read_trs(file) -> dict:
    ''' Read JSON from TRS file '''
    # TODO: deal with different versions
    with ZipFile(file, 'r') as archive:
        json_data = archive.read('document.json')
    return json.loads(json_data)


def write_trs(json_data: dict) -> bytes:
    ''' Write json data to TRS file including version info '''
    json_data["claimed"] = False
    json_data["selection"] = []
    json_data["version"] = 16
    json_data["versionInfo"] = "Exteor 4.8.13.1000 - 30/05/2022"

    content = BytesIO()
    data = json.dumps(json_data, indent=4, ensure_ascii=False)
    with ZipFile(content, 'w') as archive:
        archive.writestr('document.json', data=data)
    return content.getvalue()
