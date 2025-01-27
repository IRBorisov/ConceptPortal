import { useQuery } from '@tanstack/react-query';

import { ILibraryItemVersioned, LibraryItemID, LibraryItemType } from '@/models/library';

import { ossApi } from '../oss/api';
import { rsformsApi } from '../rsform/api';

export function useLibraryItem({ itemID, itemType }: { itemID: LibraryItemID; itemType: LibraryItemType }) {
  const { data: rsForm } = useQuery({
    ...rsformsApi.getRSFormQueryOptions({ itemID }),
    enabled: itemType === LibraryItemType.RSFORM
  });
  const { data: oss } = useQuery({
    ...ossApi.getOssQueryOptions({ itemID }),
    enabled: itemType === LibraryItemType.OSS
  });
  return {
    item:
      itemType === LibraryItemType.RSFORM
        ? (rsForm as ILibraryItemVersioned | undefined)
        : (oss as ILibraryItemVersioned | undefined)
  };
}
