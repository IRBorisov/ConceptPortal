''' Basic serializers that do not interact with database. '''
from typing import cast

from cctext import EntityReference, Reference, ReferenceType, Resolver, SyntacticReference
from rest_framework import serializers

from shared.serializers import StrictSerializer


class ExpressionSerializer(StrictSerializer):
    ''' Serializer: RSLang expression. '''
    expression = serializers.CharField()


class ConstituentaCheckSerializer(StrictSerializer):
    ''' Serializer: RSLang expression. '''
    alias = serializers.CharField()
    definition_formal = serializers.CharField(allow_blank=True)
    cst_type = serializers.CharField()


class WordFormSerializer(StrictSerializer):
    ''' Serializer: inflect request. '''
    text = serializers.CharField()
    grams = serializers.CharField()


class MultiFormSerializer(StrictSerializer):
    ''' Serializer: inflect request. '''
    items = serializers.ListField(
        child=WordFormSerializer()
    )

    @staticmethod
    def from_list(data: list[tuple[str, str]]) -> dict:
        result: dict = {}
        result['items'] = []
        for item in data:
            result['items'].append({
                'text': item[0],
                'grams': item[1]
            })
        return result


class TextSerializer(StrictSerializer):
    ''' Serializer: Text with references. '''
    text = serializers.CharField()


class FunctionArgSerializer(StrictSerializer):
    ''' Serializer: RSLang function argument type. '''
    alias = serializers.CharField()
    typification = serializers.CharField()


class CstParseSerializer(StrictSerializer):
    ''' Serializer: Constituenta parse result. '''
    status = serializers.CharField()
    valueClass = serializers.CharField()
    typification = serializers.CharField()
    syntaxTree = serializers.CharField()
    args = serializers.ListField(
        child=FunctionArgSerializer()
    )


class ErrorDescriptionSerializer(StrictSerializer):
    ''' Serializer: RSError description. '''
    errorType = serializers.IntegerField()
    position = serializers.IntegerField()
    isCritical = serializers.BooleanField()
    params = serializers.ListField(
        child=serializers.CharField()
    )


class NodeDataSerializer(StrictSerializer):
    ''' Serializer: Node data. '''
    dataType = serializers.CharField()
    value = serializers.CharField()


class ASTNodeSerializer(StrictSerializer):
    ''' Serializer: Syntax tree node. '''
    uid = serializers.IntegerField()
    parent = serializers.IntegerField()  # type: ignore
    typeID = serializers.IntegerField()
    start = serializers.IntegerField()
    finish = serializers.IntegerField()
    data = NodeDataSerializer()  # type: ignore


class ExpressionParseSerializer(StrictSerializer):
    ''' Serializer: RSlang expression parse result. '''
    parseResult = serializers.BooleanField()
    prefixLen = serializers.IntegerField()
    syntax = serializers.CharField()
    typification = serializers.CharField()
    valueClass = serializers.CharField()
    astText = serializers.CharField()
    ast = serializers.ListField(
        child=ASTNodeSerializer()
    )
    errors = serializers.ListField(  # type: ignore
        child=ErrorDescriptionSerializer()
    )
    args = serializers.ListField(
        child=FunctionArgSerializer()
    )


class TextPositionSerializer(StrictSerializer):
    ''' Serializer: Text position. '''
    start = serializers.IntegerField()
    finish = serializers.IntegerField()


class ReferenceDataSerializer(StrictSerializer):
    ''' Serializer: Reference data - Union of all references. '''
    offset = serializers.IntegerField()
    nominal = serializers.CharField()
    entity = serializers.CharField()
    form = serializers.CharField()


class ReferenceSerializer(StrictSerializer):
    ''' Serializer: Language reference. '''
    type = serializers.CharField()
    data = ReferenceDataSerializer()  # type: ignore
    pos_input = TextPositionSerializer()
    pos_output = TextPositionSerializer()


class InheritanceDataSerializer(StrictSerializer):
    ''' Serializer: Inheritance data. '''
    child = serializers.IntegerField()
    child_source = serializers.IntegerField()
    parent = serializers.IntegerField()  # type: ignore
    parent_source = serializers.IntegerField()


class ResolverSerializer(StrictSerializer):
    ''' Serializer: Resolver results serializer. '''
    input = serializers.CharField()
    output = serializers.CharField()
    refs = serializers.ListField(
        child=ReferenceSerializer()
    )

    def to_representation(self, instance: Resolver) -> dict:
        return {
            'input': instance.input,
            'output': instance.output,
            'refs': [{
                'type': ref.ref.get_type().value,
                'data': self._get_reference_data(ref.ref),
                'resolved': ref.resolved,
                'pos_input': {
                    'start': ref.pos_input.start,
                    'finish': ref.pos_input.finish
                },
                'pos_output': {
                    'start': ref.pos_output.start,
                    'finish': ref.pos_output.finish
                }
            } for ref in instance.refs]
        }

    @staticmethod
    def _get_reference_data(ref: Reference) -> dict:
        if ref.get_type() == ReferenceType.entity:
            return {
                'entity': cast(EntityReference, ref).entity,
                'form': cast(EntityReference, ref).form
            }
        else:
            return {
                'offset': cast(SyntacticReference, ref).offset,
                'nominal': cast(SyntacticReference, ref).nominal
            }
