''' Serializers for persistent data manipulation. '''
from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework.serializers import PrimaryKeyRelatedField as PKField

from apps.rsform.models import Constituenta

from ..models import LibraryItem, Version


class LibraryItemBaseSerializer(serializers.ModelSerializer):
    ''' Serializer: LibraryItem entry full access. '''
    class Meta:
        ''' serializer metadata. '''
        model = LibraryItem
        fields = '__all__'
        read_only_fields = ('id',)


class LibraryItemReferenceSerializer(serializers.ModelSerializer):
    ''' Serializer: reference to LibraryItem. '''
    class Meta:
        ''' serializer metadata. '''
        model = LibraryItem
        fields = 'id', 'alias'


class LibraryItemSerializer(serializers.ModelSerializer):
    ''' Serializer: LibraryItem entry limited access. '''
    class Meta:
        ''' serializer metadata. '''
        model = LibraryItem
        fields = '__all__'
        read_only_fields = ('id', 'item_type', 'owner', 'location', 'access_policy')


class LibraryItemCloneSerializer(serializers.ModelSerializer):
    ''' Serializer: LibraryItem cloning. '''
    items = PKField(many=True, required=False, queryset=Constituenta.objects.all().only('pk'))

    class Meta:
        ''' serializer metadata. '''
        model = LibraryItem
        exclude = ['id', 'item_type', 'owner']


class VersionSerializer(serializers.ModelSerializer):
    ''' Serializer: Version data. '''
    class Meta:
        ''' serializer metadata. '''
        model = Version
        fields = 'id', 'version', 'item', 'description', 'time_create'
        read_only_fields = ('id', 'item', 'time_create')


class VersionInnerSerializer(serializers.ModelSerializer):
    ''' Serializer: Version data for list of versions. '''
    class Meta:
        ''' serializer metadata. '''
        model = Version
        fields = 'id', 'version', 'description', 'time_create'
        read_only_fields = ('id', 'item', 'time_create')


class VersionCreateSerializer(serializers.ModelSerializer):
    ''' Serializer: Version create data. '''
    items = PKField(many=True, required=False, default=None, queryset=Constituenta.objects.all().only('pk'))

    class Meta:
        ''' serializer metadata. '''
        model = Version
        fields = 'version', 'description', 'items'


class LibraryItemDetailsSerializer(serializers.ModelSerializer):
    ''' Serializer: LibraryItem detailed data. '''
    editors = serializers.SerializerMethodField()
    versions = serializers.SerializerMethodField()

    class Meta:
        ''' serializer metadata. '''
        model = LibraryItem
        fields = '__all__'
        read_only_fields = ('owner', 'id', 'item_type')

    def get_editors(self, instance: LibraryItem) -> list[int]:
        return list(instance.editors().order_by('pk').values_list('pk', flat=True))

    def get_versions(self, instance: LibraryItem) -> list:
        return [VersionInnerSerializer(item).data for item in instance.versions().order_by('pk')]


class UserTargetSerializer(serializers.Serializer):
    ''' Serializer: Target single User. '''
    user = PKField(many=False, queryset=User.objects.all().only('pk'))


class UsersListSerializer(serializers.Serializer):
    ''' Serializer: List of Users. '''
    users = PKField(many=True, queryset=User.objects.all().only('pk'))
