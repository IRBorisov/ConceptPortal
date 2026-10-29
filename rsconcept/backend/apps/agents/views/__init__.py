''' Views package for agents app. '''

from .attributes import AgentSetAccessPolicyView, AgentSetLocationView
from .keys import ApiKeyViewSet
from .library import (
    AgentLibraryActiveView,
    AgentLibraryContextSearchView,
    AgentLibraryItemsByIdsView
)
from .logs import AgentActionLogListView
from .models import (
    AgentModelClearValuesView,
    AgentModelDetailsView,
    AgentModelResetAllView,
    AgentModelSetValueView,
)
from .oss import (
    AgentOssCloneSchemaView,
    AgentOssCreateBlockView,
    AgentOssCreateInputView,
    AgentOssCreateReplicaView,
    AgentOssCreateSchemaView,
    AgentOssCreateSynthesisView,
    AgentOssCreateView,
    AgentOssDeleteBlockView,
    AgentOssDeleteOperationView,
    AgentOssDeleteReplicaView,
    AgentOssDetailsView,
    AgentOssExecuteOperationView,
    AgentOssImportSchemaView,
    AgentOssMoveItemsView,
    AgentOssRelocateConstituentsView,
    AgentOssSetInputView,
    AgentOssUpdateBlockView,
    AgentOssUpdateLayoutView,
    AgentOssUpdateOperationView
)
from .rsforms import (
    AgentCreateConstituentaView,
    AgentDeleteConstituentsView,
    AgentMoveCstView,
    AgentRsformCreateVersionView,
    AgentRsformCreateView,
    AgentRsformDetailsView,
    AgentRsformReplaceView,
    AgentSubstituteView,
    AgentUpdateConstituentaView
)
