import { type DataTableRowDrop } from '@/components/data-table';

type CloneCst = (options: { cstIDs: number[]; insertAfter: number | null }) => void | Promise<number>;
type MoveAfter = (afterID: number | null, movedIDs: number[]) => void;

/** Shared clone-vs-move handler for constituenta table row drag-and-drop. */
export function useRowsDropHandler(cloneCst: CloneCst, moveAfter: MoveAfter) {
  function handleRowsDrop<T extends { id: number }>(event: DataTableRowDrop<T>) {
    if (event.isClone) {
      void cloneCst({
        cstIDs: event.draggedRows.map(cst => cst.id),
        insertAfter: event.afterRow?.id ?? null
      });
      return;
    }
    moveAfter(
      event.afterRow?.id ?? null,
      event.draggedRows.map(cst => cst.id)
    );
  }

  return handleRowsDrop;
}
