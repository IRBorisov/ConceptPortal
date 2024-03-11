''' Serializers for persistent data manipulation. '''
from typing import Optional, cast
from rest_framework import serializers

from .basics import ConstituentaID, CstParseSerializer

from .io_pyconcept import PyConceptAdapter

from ..models import Constituenta, LibraryItem, RSForm, Version
from .. import messages as msg


class LibraryItemSerializer(serializers.ModelSerializer):
    ''' Serializer: LibraryItem entry. '''
    class Meta:
        ''' serializer metadata. '''
        model = LibraryItem
        fields = '__all__'
        read_only_fields = ('owner', 'id', 'item_type')


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
    class Meta:
        ''' serializer metadata. '''
        model = Version
        fields = 'version', 'description'


class LibraryItemDetailsSerializer(serializers.ModelSerializer):
    ''' Serializer: LibraryItem detailed data. '''
    subscribers = serializers.SerializerMethodField()
    versions = serializers.SerializerMethodField()

    class Meta:
        ''' serializer metadata. '''
        model = LibraryItem
        fields = '__all__'
        read_only_fields = ('owner', 'id', 'item_type')

    def get_subscribers(self, instance: LibraryItem) -> list[int]:
        return [item.pk for item in instance.subscribers()]

    def get_versions(self, instance: LibraryItem) -> list:
        return [VersionInnerSerializer(item).data for item in instance.versions()]


class ConstituentaSerializer(serializers.ModelSerializer):
    ''' Serializer: Constituenta data. '''
    class Meta:
        ''' serializer metadata. '''
        model = Constituenta
        fields = '__all__'
        read_only_fields = ('id', 'order', 'alias', 'cst_type', 'definition_resolved', 'term_resolved')

    def update(self, instance: Constituenta, validated_data) -> Constituenta:
        data = validated_data # Note: use alias for better code readability
        schema = RSForm(instance.schema)
        definition: Optional[str] = data['definition_raw'] if 'definition_raw' in data else None
        term: Optional[str] = data['term_raw'] if 'term_raw' in data else None
        term_changed = 'term_forms' in data
        if definition is not None and definition != instance.definition_raw :
            data['definition_resolved'] = schema.resolver().resolve(definition)
        if term is not None and term != instance.term_raw:
            data['term_resolved'] = schema.resolver().resolve(term)
            if data['term_resolved'] != instance.term_resolved and 'term_forms' not in data:
                data['term_forms'] = []
            term_changed = data['term_resolved'] != instance.term_resolved
        result: Constituenta = super().update(instance, data)
        if term_changed:
            schema.on_term_change([result.alias])
            result.refresh_from_db()
        schema.item.save()
        return result


class CstCreateSerializer(serializers.ModelSerializer):
    ''' Serializer: Constituenta creation. '''
    insert_after = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        ''' serializer metadata. '''
        model = Constituenta
        fields = \
            'alias', 'cst_type', 'convention', \
            'term_raw', 'definition_raw', 'definition_formal', \
            'insert_after', 'term_forms'


class CstRenameSerializer(serializers.ModelSerializer):
    ''' Serializer: Constituenta renaming. '''
    class Meta:
        ''' serializer metadata. '''
        model = Constituenta
        fields = 'id', 'alias', 'cst_type'

    def validate(self, attrs):
        schema = cast(RSForm, self.context['schema'])
        old_cst = Constituenta.objects.get(pk=self.initial_data['id'])
        new_alias = self.initial_data['alias']
        if old_cst.schema != schema.item:
            raise serializers.ValidationError({
                'id': msg.constituentaNotOwned(schema.item.title)
            })
        if old_cst.alias == new_alias:
            raise serializers.ValidationError({
                'alias': msg.renameTrivial(new_alias)
            })
        if schema.constituents().filter(alias=new_alias).exists():
            raise serializers.ValidationError({
                'alias': msg.renameTaken(new_alias)
            })
        self.instance = old_cst
        attrs['schema'] = schema.item
        attrs['id'] = self.initial_data['id']
        return attrs


class RSFormSerializer(serializers.ModelSerializer):
    ''' Serializer: Detailed data for RSForm. '''
    subscribers = serializers.ListField(
        child=serializers.IntegerField()
    )
    items = serializers.ListField(
        child=ConstituentaSerializer()
    )

    class Meta:
        ''' serializer metadata. '''
        model = LibraryItem
        fields = '__all__'

    def to_representation(self, instance: LibraryItem) -> dict:
        result = LibraryItemDetailsSerializer(instance).data
        schema = RSForm(instance)
        result['items'] = []
        for cst in schema.constituents().order_by('order'):
            result['items'].append(ConstituentaSerializer(cst).data)
        return result

    def to_versioned_data(self) -> dict:
        ''' Create serializable version representation without redundant data. '''
        result = self.to_representation(cast(LibraryItem, self.instance))
        del result['versions']
        del result['subscribers']

        del result['owner']
        del result['is_common']
        del result['is_canonical']
        del result['time_create']
        del result['time_update']
        return result

    def from_versioned_data(self, version: int, data: dict) -> dict:
        ''' Load data from version. '''
        result = self.to_representation(cast(LibraryItem, self.instance))
        result['version'] = version
        return result | data


class CstDetailsSerializer(serializers.ModelSerializer):
    ''' Serializer: Constituenta data including parse. '''
    parse = CstParseSerializer()

    class Meta:
        ''' serializer metadata. '''
        model = Constituenta
        fields = '__all__'


class RSFormParseSerializer(serializers.ModelSerializer):
    ''' Serializer: Detailed data for RSForm including parse. '''
    subscribers = serializers.ListField(
        child=serializers.IntegerField()
    )
    items = serializers.ListField(
        child=CstDetailsSerializer()
    )

    class Meta:
        ''' serializer metadata. '''
        model = LibraryItem
        fields = '__all__'

    def to_representation(self, instance: LibraryItem):
        result = RSFormSerializer(instance).data
        return self._parse_data(result)

    def from_versioned_data(self, version: int, data: dict) -> dict:
        ''' Load data from version and parse. '''
        item = cast(LibraryItem, self.instance)
        result = RSFormSerializer(item).from_versioned_data(version, data)
        return self._parse_data(result)

    def _parse_data(self, data: dict) -> dict:
        parse = PyConceptAdapter(data).parse()
        for cst_data in data['items']:
            cst_data['parse'] = next(
                cst['parse'] for cst in parse['items']
                if cst['id'] == cst_data['id']
            )
        return data


class CstSubstituteSerializer(serializers.Serializer):
    ''' Serializer: Constituenta substitution. '''
    original = ConstituentaID()
    substitution = ConstituentaID()
    transfer_term = serializers.BooleanField(required=False, default=False)

    def validate(self, attrs):
        schema = cast(RSForm, self.context['schema'])
        original_cst = Constituenta.objects.get(pk=self.initial_data['original'])
        substitution_cst = Constituenta.objects.get(pk=self.initial_data['substitution'])
        if original_cst.alias == substitution_cst.alias:
            raise serializers.ValidationError({
                'alias': msg.substituteTrivial(original_cst.alias)
            })
        if original_cst.schema != schema.item:
            raise serializers.ValidationError({
                'original': msg.constituentaNotOwned(schema.item.title)
            })
        if substitution_cst.schema != schema.item:
            raise serializers.ValidationError({
                'substitution': msg.constituentaNotOwned(schema.item.title)
            })
        attrs['original'] = original_cst
        attrs['substitution'] = substitution_cst
        attrs['transfer_term'] = self.initial_data['transfer_term']
        return attrs


class CstListSerializer(serializers.Serializer):
    ''' Serializer: List of constituents from one origin. '''
    items = serializers.ListField(
        child=serializers.IntegerField()
    )

    def validate(self, attrs):
        schema = self.context['schema']
        cstList = []
        for item in attrs['items']:
            try:
                cst = Constituenta.objects.get(pk=item)
            except Constituenta.DoesNotExist as exception:
                raise serializers.ValidationError({
                    f'{item}': msg.constituentaNotExists
                }) from exception
            if cst.schema != schema.item:
                raise serializers.ValidationError({
                    f'{item}': msg.constituentaNotOwned(schema.item.title)
                })
            cstList.append(cst)
        attrs['constituents'] = cstList
        return attrs


class CstMoveSerializer(CstListSerializer):
    ''' Serializer: Change constituenta position. '''
    move_to = serializers.IntegerField()
