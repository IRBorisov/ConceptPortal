''' Serializers for persistent data manipulation. '''
from typing import cast

from django.contrib.auth.models import User
from django.core.exceptions import PermissionDenied
from django.db.models import Q
from rest_framework import serializers
from rest_framework.serializers import PrimaryKeyRelatedField as PKField

from apps.library.models import LibraryItem
from apps.library.serializers import (
    LibraryItemBaseSerializer,
    LibraryItemDetailsSerializer,
    LibraryItemReferenceSerializer
)
from apps.oss.models import Inheritance
from shared import messages as msg

from ..models import Constituenta, CstType, RSForm
from .basics import CstParseSerializer
from .io_pyconcept import PyConceptAdapter


class CstBaseSerializer(serializers.ModelSerializer):
    ''' Serializer: Constituenta all data. '''
    class Meta:
        ''' serializer metadata. '''
        model = Constituenta
        fields = '__all__'
        read_only_fields = ('id',)


class CstSerializer(serializers.ModelSerializer):
    ''' Serializer: Constituenta data. '''
    class Meta:
        ''' serializer metadata. '''
        model = Constituenta
        fields = '__all__'
        read_only_fields = ('id', 'schema', 'order', 'alias', 'cst_type', 'definition_resolved', 'term_resolved')


class CstUpdateSerializer(serializers.Serializer):
    ''' Serializer: Constituenta update. '''
    class ConstituentaUpdateData(serializers.ModelSerializer):
        ''' Serializer: Operation creation data. '''
        class Meta:
            ''' serializer metadata. '''
            model = Constituenta
            fields = 'convention', 'definition_formal', 'definition_raw', 'term_raw', 'term_forms'

    target = PKField(
        many=False,
        queryset=Constituenta.objects.all().only('convention', 'definition_formal', 'definition_raw', 'term_raw')
    )
    item_data = ConstituentaUpdateData()

    def validate(self, attrs):
        schema = cast(LibraryItem, self.context['schema'])
        cst = cast(Constituenta, attrs['target'])
        if schema and cst.schema_id != schema.pk:
            raise serializers.ValidationError({
                f'{cst.pk}': msg.constituentaNotInRSform(schema.title)
            })
        return attrs


class CstDetailsSerializer(serializers.ModelSerializer):
    ''' Serializer: Constituenta data including parse. '''
    parse = CstParseSerializer()

    class Meta:
        ''' serializer metadata. '''
        model = Constituenta
        fields = '__all__'


class CstCreateSerializer(serializers.ModelSerializer):
    ''' Serializer: Constituenta creation. '''
    insert_after = PKField(
        many=False,
        allow_null=True,
        required=False,
        queryset=Constituenta.objects.all().only('schema_id', 'order')
    )
    alias = serializers.CharField(max_length=8)
    cst_type = serializers.ChoiceField(CstType.choices)

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
    editors = serializers.ListField(
        child=serializers.IntegerField()
    )
    items = serializers.ListField(
        child=CstSerializer()
    )
    inheritance = serializers.ListField(
        child=serializers.ListField(child=serializers.IntegerField())
    )
    oss = serializers.ListField(
        child=LibraryItemReferenceSerializer()
    )

    class Meta:
        ''' serializer metadata. '''
        model = LibraryItem
        fields = '__all__'

    def to_representation(self, instance: LibraryItem) -> dict:
        result = LibraryItemDetailsSerializer(instance).data
        result['items'] = []
        for cst in RSForm(instance).constituents().order_by('order'):
            result['items'].append(CstSerializer(cst).data)
        result['inheritance'] = []
        for link in Inheritance.objects.filter(Q(child__schema=instance) | Q(parent__schema=instance)):
            result['inheritance'].append([link.child.pk, link.parent.pk])
        result['oss'] = []
        for oss in LibraryItem.objects.filter(operations__result=instance).only('alias'):
            result['oss'].append({
                'id': oss.pk,
                'alias': oss.alias
            })
        return result

    def to_versioned_data(self) -> dict:
        ''' Create serializable version representation without redundant data. '''
        result = self.to_representation(cast(LibraryItem, self.instance))
        del result['versions']
        del result['subscribers']
        del result['editors']
        del result['inheritance']
        del result['oss']

        del result['owner']
        del result['visible']
        del result['read_only']
        del result['access_policy']
        del result['location']

        del result['time_create']
        del result['time_update']
        return result

    def from_versioned_data(self, version: int, data: dict) -> dict:
        ''' Load data from version. '''
        result = self.to_representation(cast(LibraryItem, self.instance))
        result['version'] = version
        return result | data

    def restore_from_version(self, data: dict):
        ''' Load data from version. '''
        schema = RSForm(cast(LibraryItem, self.instance))
        items: list[dict] = data['items']
        ids: list[int] = [item['id'] for item in items]
        processed: list[int] = []

        for cst in schema.constituents():
            if not cst.pk in ids:
                cst.delete()
            else:
                cst_data = next(x for x in items if x['id'] == cst.pk)
                new_cst = CstBaseSerializer(data=cst_data)
                new_cst.is_valid(raise_exception=True)
                new_cst.update(
                    instance=cst,
                    validated_data=new_cst.validated_data
                )
                processed.append(cst.pk)

        for cst_data in items:
            if cst_data['id'] not in processed:
                cst = schema.insert_new(cst_data['alias'])
                cst_data['id'] = cst.pk
                new_cst = CstBaseSerializer(data=cst_data)
                new_cst.is_valid(raise_exception=True)
                new_cst.update(
                    instance=cst,
                    validated_data=new_cst.validated_data
                )

        loaded_item = LibraryItemBaseSerializer(data=data)
        loaded_item.is_valid(raise_exception=True)
        loaded_item.update(
            instance=cast(LibraryItem, self.instance),
            validated_data=loaded_item.validated_data
        )


class RSFormParseSerializer(serializers.ModelSerializer):
    ''' Serializer: Detailed data for RSForm including parse. '''
    subscribers = serializers.ListField(
        child=serializers.IntegerField()
    )
    editors = serializers.ListField(
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


class CstTargetSerializer(serializers.Serializer):
    ''' Serializer: Target single Constituenta. '''
    target = PKField(many=False, queryset=Constituenta.objects.all())

    def validate(self, attrs):
        if 'schema' in self.context:
            schema = cast(LibraryItem, self.context['schema'])
            cst = cast(Constituenta, attrs['target'])
            if schema and cst.schema_id != schema.pk:
                raise serializers.ValidationError({
                    f'{cst.pk}': msg.constituentaNotInRSform(schema.title)
                })
        return attrs


class CstRenameSerializer(serializers.Serializer):
    ''' Serializer: Constituenta renaming. '''
    target = PKField(many=False, queryset=Constituenta.objects.only('alias', 'cst_type', 'schema'))
    alias = serializers.CharField()
    cst_type = serializers.CharField()

    def validate(self, attrs):
        attrs = super().validate(attrs)
        schema = cast(LibraryItem, self.context['schema'])
        cst = cast(Constituenta, attrs['target'])
        if cst.schema_id != schema.pk:
            raise serializers.ValidationError({
                f'{cst.pk}': msg.constituentaNotInRSform(schema.title)
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
    items = PKField(many=True, queryset=Constituenta.objects.all().only('schema_id'))

    def validate(self, attrs):
        schema = cast(LibraryItem, self.context['schema'])
        if not schema:
            return attrs

        for item in attrs['items']:
            if item.schema_id != schema.pk:
                raise serializers.ValidationError({
                    f'{item.pk}': msg.constituentaNotInRSform(schema.title)
                })
        return attrs


class CstMoveSerializer(CstListSerializer):
    ''' Serializer: Change constituenta position. '''
    move_to = serializers.IntegerField()


class SubstitutionSerializerBase(serializers.Serializer):
    ''' Serializer: Basic substitution. '''
    original = PKField(many=False, queryset=Constituenta.objects.only('alias', 'schema_id'))
    substitution = PKField(many=False, queryset=Constituenta.objects.only('alias', 'schema_id'))


class CstSubstituteSerializer(serializers.Serializer):
    ''' Serializer: Constituenta substitution. '''
    substitutions = serializers.ListField(
        child=SubstitutionSerializerBase(),
        min_length=1
    )

    def validate(self, attrs):
        schema = cast(LibraryItem, self.context['schema'])
        deleted = set()
        for item in attrs['substitutions']:
            original_cst = cast(Constituenta, item['original'])
            substitution_cst = cast(Constituenta, item['substitution'])
            if original_cst.pk in deleted:
                raise serializers.ValidationError({
                    f'{original_cst.pk}': msg.substituteDouble(original_cst.alias)
                })
            if original_cst.pk == substitution_cst.pk:
                raise serializers.ValidationError({
                    'original': msg.substituteTrivial(original_cst.alias)
                })
            if original_cst.schema_id != schema.pk:
                raise serializers.ValidationError({
                    'original': msg.constituentaNotInRSform(schema.title)
                })
            if substitution_cst.schema_id != schema.pk:
                raise serializers.ValidationError({
                    'substitution': msg.constituentaNotInRSform(schema.title)
                })
            deleted.add(original_cst.pk)
        return attrs


class InlineSynthesisSerializer(serializers.Serializer):
    ''' Serializer: Inline synthesis operation input. '''
    receiver = PKField(many=False, queryset=LibraryItem.objects.all().only('owner_id'))
    source = PKField(many=False, queryset=LibraryItem.objects.all().only('owner_id'))  # type: ignore
    items = PKField(many=True, queryset=Constituenta.objects.all())
    substitutions = serializers.ListField(
        child=SubstitutionSerializerBase()
    )

    def validate(self, attrs):
        user = cast(User, self.context['user'])
        schema_in = cast(LibraryItem, attrs['source'])
        schema_out = cast(LibraryItem, attrs['receiver'])
        if user.is_anonymous or (schema_out.owner != user and not user.is_staff):
            raise PermissionDenied({
                'message': msg.schemaForbidden(),
                'object_id': schema_in.pk
            })
        constituents = cast(list[Constituenta], attrs['items'])
        for cst in constituents:
            if cst.schema_id != schema_in.pk:
                raise serializers.ValidationError({
                    f'{cst.pk}': msg.constituentaNotInRSform(schema_in.title)
                })
        deleted = set()
        for item in attrs['substitutions']:
            original_cst = cast(Constituenta, item['original'])
            substitution_cst = cast(Constituenta, item['substitution'])
            if original_cst.schema_id == schema_in.pk:
                if original_cst not in constituents:
                    raise serializers.ValidationError({
                        f'{original_cst.pk}': msg.substitutionNotInList()
                    })
                if substitution_cst.schema_id != schema_out.pk:
                    raise serializers.ValidationError({
                        f'{substitution_cst.pk}': msg.constituentaNotInRSform(schema_out.title)
                    })
            else:
                if substitution_cst not in constituents:
                    raise serializers.ValidationError({
                        f'{substitution_cst.pk}': msg.substitutionNotInList()
                    })
                if original_cst.schema_id != schema_out.pk:
                    raise serializers.ValidationError({
                        f'{original_cst.pk}': msg.constituentaNotInRSform(schema_out.title)
                    })
            if original_cst.pk in deleted:
                raise serializers.ValidationError({
                    f'{original_cst.pk}': msg.substituteDouble(original_cst.alias)
                })
            deleted.add(original_cst.pk)
        return attrs
