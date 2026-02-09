''' Serializers for persistent data manipulation. '''
from typing import cast

from django.contrib.auth.models import User
from django.core.exceptions import PermissionDenied
from django.db.models import Q
from rest_framework import serializers
from rest_framework.serializers import PrimaryKeyRelatedField as PKField

from apps.library.models import LibraryItem
from apps.library.serializers import (
    LibraryItemBaseNonStrictSerializer,
    LibraryItemDetailsSerializer,
    LibraryItemReferenceSerializer
)
from apps.oss.models import Inheritance
from shared import messages as msg
from shared.serializers import StrictModelSerializer, StrictSerializer

from ..models import Attribution, Constituenta, CstType, RSForm
from .basics import CstParseSerializer, InheritanceDataSerializer


class AttributionSerializer(StrictModelSerializer):
    ''' Serializer: Attribution relation. '''
    class Meta:
        ''' serializer metadata. '''
        model = Attribution
        fields = ('container', 'attribute')


class AttributionDataSerializer(StrictSerializer):
    ''' Serializer: Attribution data. '''
    container = PKField(many=False, queryset=Constituenta.objects.all().only('schema_id'))
    attribute = PKField(many=False, queryset=Constituenta.objects.all().only('schema_id'))

    def validate(self, attrs):
        schema = cast(LibraryItem, self.context['schema'])
        if schema and attrs['container'].schema_id != schema.id:
            raise serializers.ValidationError({
                'container': msg.constituentaNotInRSform(schema.title)
            })
        if schema and attrs['attribute'].schema_id != schema.id:
            raise serializers.ValidationError({
                'attribute': msg.constituentaNotInRSform(schema.title)
            })

        return attrs


class AttributionCreateSerializer(AttributionDataSerializer):
    ''' Serializer: Data for creating new Attribution. '''

    def validate(self, attrs):
        attrs = super().validate(attrs)
        if attrs['container'].pk == attrs['attribute'].pk:
            raise serializers.ValidationError({
                'container': msg.associationSelf()
            })
        if Attribution.objects.filter(container=attrs['container'], attribute=attrs['attribute']).exists():
            raise serializers.ValidationError({
                'attribute': msg.associationAlreadyExists()
            })

        return attrs


class CstBaseSerializer(StrictModelSerializer):
    ''' Serializer: Constituenta all data. '''
    class Meta:
        ''' serializer metadata. '''
        model = Constituenta
        exclude = ('order',)
        read_only_fields = ('id',)


class CstInfoSerializer(StrictModelSerializer):
    ''' Serializer: Constituenta public information. '''
    class Meta:
        ''' serializer metadata. '''
        model = Constituenta
        exclude = ('order', 'schema')


class CstUpdateSerializer(StrictSerializer):
    ''' Serializer: Constituenta update. '''
    class ConstituentaUpdateData(StrictModelSerializer):
        ''' Serializer: Operation creation data. '''
        class Meta:
            ''' serializer metadata. '''
            model = Constituenta
            fields = 'alias', 'cst_type', 'convention', 'crucial', 'definition_formal', \
                'definition_raw', 'term_raw', 'term_forms'

    target = PKField(
        many=False,
        queryset=Constituenta.objects.all().only(
            'schema_id',
            'alias', 'cst_type', 'convention', 'crucial',
            'definition_formal', 'definition_raw', 'term_raw'
        )
    )
    item_data = ConstituentaUpdateData()

    def validate(self, attrs):
        schema = cast(LibraryItem, self.context['schema'])
        cst = cast(Constituenta, attrs['target'])
        if schema and cst.schema_id != schema.pk:
            raise serializers.ValidationError({
                f'{cst.pk}': msg.constituentaNotInRSform(schema.title)
            })
        if 'alias' in attrs['item_data']:
            new_alias = attrs['item_data']['alias']
            if cst.alias != new_alias and Constituenta.objects.filter(schema=schema, alias=new_alias).exists():
                raise serializers.ValidationError({
                    'alias': msg.aliasTaken(new_alias)
                })
        if 'definition_formal' in attrs['item_data'] \
                and cst.definition_formal != attrs['item_data']['definition_formal']:
            if Inheritance.objects.filter(child=cst).exists():
                raise serializers.ValidationError({
                    'definition_formal': msg.changeInheritedDefinition()
                })
        return attrs


class CrucialUpdateSerializer(StrictSerializer):
    ''' Serializer: update crucial status. '''
    target = PKField(
        many=True,
        queryset=Constituenta.objects.all().only('crucial', 'schema_id')
    )
    value = serializers.BooleanField()

    def validate(self, attrs):
        schema = cast(LibraryItem, self.context['schema'])
        for cst in attrs['target']:
            if schema and cst.schema_id != schema.pk:
                raise serializers.ValidationError({
                    f'{cst.pk}': msg.constituentaNotInRSform(schema.title)
                })
        return attrs


class CstDetailsSerializer(StrictModelSerializer):
    ''' Serializer: Constituenta data including parse. '''
    parse = CstParseSerializer()

    class Meta:
        ''' serializer metadata. '''
        model = Constituenta
        exclude = ('order',)


class CstCreateSerializer(StrictModelSerializer):
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
            'alias', 'cst_type', 'convention', 'crucial', \
            'term_raw', 'definition_raw', 'definition_formal', \
            'insert_after', 'term_forms'

    def validate(self, attrs):
        schema = cast(LibraryItem, self.context['schema'])
        insert_after = attrs.get('insert_after')
        if insert_after and insert_after.schema_id != schema.pk:
            raise serializers.ValidationError({
                'insert_after': msg.constituentaNotInRSform(schema.title)
            })
        return attrs


class RSFormSerializer(StrictModelSerializer):
    ''' Serializer: Detailed data for RSForm. '''
    editors = serializers.ListField(
        child=serializers.IntegerField()
    )
    items = serializers.ListField(
        child=CstInfoSerializer()
    )
    inheritance = serializers.ListField(
        child=InheritanceDataSerializer()
    )
    attribution = serializers.ListField(
        child=AttributionSerializer()
    )
    oss = serializers.ListField(
        child=LibraryItemReferenceSerializer()
    )

    class Meta:
        ''' serializer metadata. '''
        model = LibraryItem
        fields = '__all__'

    def to_representation(self, instance: LibraryItem) -> dict:
        result = self.to_base_data(instance)
        inheritances = Inheritance.objects \
            .filter(Q(child__schema=instance) | Q(parent__schema=instance)) \
            .select_related('parent__schema', 'child__schema') \
            .only('parent__id', 'parent__schema__id', 'child__id', 'child__schema__id')
        for link in inheritances:
            result['inheritance'].append({
                'child': link.child_id,
                'child_source': link.child.schema_id,
                'parent': link.parent_id,
                'parent_source': link.parent.schema_id
            })
        return result

    def to_base_data(self, instance: LibraryItem) -> dict:
        ''' Create serializable base representation without redundant data. '''
        result = LibraryItemDetailsSerializer(instance).data
        result['items'] = []
        result['oss'] = []
        result['inheritance'] = []
        result['attribution'] = []
        for cst in Constituenta.objects.filter(schema=instance).defer('order').order_by('order'):
            result['items'].append(CstInfoSerializer(cst).data)
        for oss in LibraryItem.objects.filter(operations__result=instance).only('alias'):
            result['oss'].append({
                'id': oss.pk,
                'alias': oss.alias
            })
        for attrib in Attribution.objects.filter(container__schema=instance).only('container_id', 'attribute_id'):
            result['attribution'].append({
                'container': attrib.container_id,
                'attribute': attrib.attribute_id
            })
        return result

    def to_versioned_data(self) -> dict:
        ''' Create serializable version representation without redundant data. '''
        result = self.to_base_data(cast(LibraryItem, self.instance))
        del result['versions']
        del result['editors']

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
        result = self.to_base_data(cast(LibraryItem, self.instance))
        result['version'] = version
        return result | data

    def restore_from_version(self, data: dict):
        ''' Load data from version. '''
        instance = cast(LibraryItem, self.instance)
        schema = RSForm(instance)
        items: list[dict] = data['items']
        stored_ids: list[int] = [item['id'] for item in items]
        id_map: dict[int, int] = {}

        for existing_cst in schema.constituentsQ():
            if not existing_cst.pk in stored_ids:
                existing_cst.delete()
            else:
                cst_data = next(x for x in items if x['id'] == existing_cst.pk)
                cst_data['schema'] = instance.pk
                cst_serializer = CstBaseSerializer(data=cst_data)
                cst_serializer.is_valid(raise_exception=True)
                cst_serializer.validated_data['order'] = stored_ids.index(existing_cst.pk)
                cst_serializer.update(
                    instance=existing_cst,
                    validated_data=cst_serializer.validated_data
                )
                id_map[cst_data['id']] = existing_cst.pk

        for cst_data in items:
            if cst_data['id'] not in id_map:
                old_id = cst_data['id']
                inserted_cst = schema.insert_last(cst_data['alias'])
                cst_data['id'] = inserted_cst.pk
                cst_data['schema'] = instance.pk
                cst_serializer = CstBaseSerializer(data=cst_data)
                cst_serializer.is_valid(raise_exception=True)
                cst_serializer.validated_data['order'] = stored_ids.index(old_id)
                cst_serializer.update(
                    instance=inserted_cst,
                    validated_data=cst_serializer.validated_data
                )
                id_map[old_id] = inserted_cst.pk

        loaded_item = LibraryItemBaseNonStrictSerializer(data=data)
        loaded_item.is_valid(raise_exception=True)
        loaded_item.update(
            instance=cast(LibraryItem, self.instance),
            validated_data=loaded_item.validated_data
        )

        Attribution.objects.filter(container__schema=instance).delete()
        attributions_to_create: list[Attribution] = []
        for attrib in data.get('attribution', []):
            old_container_id = attrib['container']
            old_attribute_id = attrib['attribute']
            container_id = id_map.get(old_container_id)
            attribute_id = id_map.get(old_attribute_id)
            if container_id and attribute_id:
                attributions_to_create.append(
                    Attribution(
                        container_id=container_id,
                        attribute_id=attribute_id
                    )
                )
        if attributions_to_create:
            Attribution.objects.bulk_create(attributions_to_create)


class RSFormParseSerializer(StrictModelSerializer):
    ''' Serializer: Detailed data for RSForm including parse. '''
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
        return RSFormSerializer(instance).data

    def from_versioned_data(self, version: int, data: dict) -> dict:
        ''' Load data from version and parse. '''
        item = cast(LibraryItem, self.instance)
        return RSFormSerializer(item).from_versioned_data(version, data)


class CstTargetSerializer(StrictSerializer):
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


class CstListSerializer(StrictSerializer):
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


class SubstitutionSerializerBase(StrictSerializer):
    ''' Serializer: Basic substitution. '''
    original = PKField(many=False, queryset=Constituenta.objects.only('alias', 'schema_id'))
    substitution = PKField(many=False, queryset=Constituenta.objects.only('alias', 'schema_id'))


class CstSubstituteSerializer(StrictSerializer):
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


class InlineSynthesisSerializer(StrictSerializer):
    ''' Serializer: Inline synthesis operation input. '''
    receiver = PKField(many=False, queryset=LibraryItem.objects.all().only('owner_id'))
    source = PKField(many=False, queryset=LibraryItem.objects.all().only('owner_id'))  # type: ignore
    items = PKField(many=True, queryset=Constituenta.objects.all().only('schema_id'))
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
