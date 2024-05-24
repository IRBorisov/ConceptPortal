''' Basic serializers that do not interact with database. '''
from typing import cast

from cctext import EntityReference, Reference, ReferenceType, Resolver, SyntacticReference
from rest_framework import serializers


class ExpressionSerializer(serializers.Serializer):
    ''' Serializer: RSLang expression. '''
    expression = serializers.CharField()


class WordFormSerializer(serializers.Serializer):
    ''' Serializer: inflect request. '''
    text = serializers.CharField()
    grams = serializers.CharField()


class MultiFormSerializer(serializers.Serializer):
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


class TextSerializer(serializers.Serializer):
    ''' Serializer: Text with references. '''
    text = serializers.CharField()


class FunctionArgSerializer(serializers.Serializer):
    ''' Serializer: RSLang function argument type. '''
    alias = serializers.CharField()
    typification = serializers.CharField()


class CstParseSerializer(serializers.Serializer):
    ''' Serializer: Constituenta parse result. '''
    status = serializers.CharField()
    valueClass = serializers.CharField()
    typification = serializers.CharField()
    syntaxTree = serializers.CharField()
    args = serializers.ListField(
        child=FunctionArgSerializer()
    )


class ErrorDescriptionSerializer(serializers.Serializer):
    ''' Serializer: RSError description. '''
    errorType = serializers.IntegerField()
    position = serializers.IntegerField()
    isCritical = serializers.BooleanField()
    params = serializers.ListField(
        child=serializers.CharField()
    )


class NodeDataSerializer(serializers.Serializer):
    ''' Serializer: Node data. '''
    dataType = serializers.CharField()
    value = serializers.CharField()


class ASTNodeSerializer(serializers.Serializer):
    ''' Serializer: Syntax tree node. '''
    uid = serializers.IntegerField()
    parent = serializers.IntegerField()  # type: ignore
    typeID = serializers.IntegerField()
    start = serializers.IntegerField()
    finish = serializers.IntegerField()
    data = NodeDataSerializer()  # type: ignore


class ExpressionParseSerializer(serializers.Serializer):
    ''' Serializer: RSlang expression parse result. '''
    parseResult = serializers.BooleanField()
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


class TextPositionSerializer(serializers.Serializer):
    ''' Serializer: Text position. '''
    start = serializers.IntegerField()
    finish = serializers.IntegerField()


class ReferenceDataSerializer(serializers.Serializer):
    ''' Serializer: Reference data - Union of all references. '''
    offset = serializers.IntegerField()
    nominal = serializers.CharField()
    entity = serializers.CharField()
    form = serializers.CharField()


class ReferenceSerializer(serializers.Serializer):
    ''' Serializer: Language reference. '''
    type = serializers.CharField()
    data = ReferenceDataSerializer()  # type: ignore
    pos_input = TextPositionSerializer()
    pos_output = TextPositionSerializer()


class ResolverSerializer(serializers.Serializer):
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
