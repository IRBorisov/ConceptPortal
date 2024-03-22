''' Serializers for persistent data manipulation. '''
from typing import Optional, cast
from rest_framework import serializers
from rest_framework.serializers import PrimaryKeyRelatedField as PKField

from .basics import CstParseSerializer

from .io_pyconcept import PyConceptAdapter

from ..models import Constituenta, LibraryItem, RSForm, Version, CstType
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


class CstDetailsSerializer(serializers.ModelSerializer):
    ''' Serializer: Constituenta data including parse. '''
    parse = CstParseSerializer()

    class Meta:
        ''' serializer metadata. '''
        model = Constituenta
        fields = '__all__'


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
    original = PKField(many=False, queryset=Constituenta.objects.all())
    substitution = PKField(many=False, queryset=Constituenta.objects.all())
    transfer_term = serializers.BooleanField(required=False, default=False)

    def validate(self, attrs):
        schema = cast(LibraryItem, self.context['schema'])
        original_cst = cast(Constituenta, attrs['original'])
        substitution_cst = cast(Constituenta, attrs['substitution'])
        if original_cst.alias == substitution_cst.alias:
            raise serializers.ValidationError({
                'alias': msg.substituteTrivial(original_cst.alias)
            })
        if original_cst.schema != schema:
            raise serializers.ValidationError({
                'original': msg.constituentaNotOwned(schema.title)
            })
        if substitution_cst.schema != schema:
            raise serializers.ValidationError({
                'substitution': msg.constituentaNotOwned(schema.title)
            })
        attrs['original'] = original_cst
        attrs['substitution'] = substitution_cst
        attrs['transfer_term'] = self.initial_data['transfer_term']
        return attrs


class CstTargetSerializer(serializers.Serializer):
    ''' Serializer: Target single Constituenta. '''
    target = PKField(many=False, queryset=Constituenta.objects.all())

    def validate(self, attrs):
        schema = cast(LibraryItem, self.context['schema'])
        cst = cast(Constituenta, attrs['target'])
        if schema and cst.schema != schema:
            raise serializers.ValidationError({
                f'{cst.id}': msg.constituentaNotOwned(schema.title)
            })
        if cst.cst_type not in [CstType.FUNCTION, CstType.STRUCTURED, CstType.TERM]:
            raise serializers.ValidationError({
                f'{cst.id}': msg.constituentaNoStructure()
            })
        self.instance = cst
        return attrs


class CstRenameSerializer(serializers.Serializer):
    ''' Serializer: Constituenta renaming. '''
    target = PKField(many=False, queryset=Constituenta.objects.all())
    alias = serializers.CharField()
    cst_type = serializers.CharField()

    def validate(self, attrs):
        attrs = super().validate(attrs)
        schema = cast(LibraryItem, self.context['schema'])
        cst = cast(Constituenta, attrs['target'])
        if cst.schema != schema:
            raise serializers.ValidationError({
                f'{cst.id}': msg.constituentaNotOwned(schema.title)
            })
        new_alias = self.initial_data['alias']
        if cst.alias == new_alias:
            raise serializers.ValidationError({
                'alias': msg.renameTrivial(new_alias)
            })
        if RSForm(schema).constituents().filter(alias=new_alias).exists():
            raise serializers.ValidationError({
                'alias': msg.aliasTaken(new_alias)
            })
        return attrs


class CstListSerializer(serializers.Serializer):
    ''' Serializer: List of constituents from one origin. '''
    items = PKField(many=True, queryset=Constituenta.objects.all())

    def validate(self, attrs):
        schema = cast(LibraryItem, self.context['schema'])
        if not schema:
            return attrs

        for item in attrs['items']:
            if item.schema != schema:
                raise serializers.ValidationError({
                    f'{item.id}': msg.constituentaNotOwned(schema.title)
                })
        return attrs


class CstMoveSerializer(CstListSerializer):
    ''' Serializer: Change constituenta position. '''
    move_to = serializers.IntegerField()


class InlineSynthesisSerializer(serializers.Serializer):
    ''' Serializer: Inline synthesis operation input. '''
    receiver = PKField(many=False, queryset=LibraryItem.objects.all())
    source = PKField(many=False, queryset=LibraryItem.objects.all()) # type: ignore
    items = PKField(many=True, queryset=Constituenta.objects.all())
    substitutions = serializers.ListField(
        child=CstSubstituteSerializer()
    )

    def validate(self, attrs):
        return attrs
