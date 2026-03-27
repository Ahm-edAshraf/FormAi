export type DropPlacement = "before" | "after";

export function getDropPlacement(clientY: number, rect: Pick<DOMRect, "top" | "height">): DropPlacement {
  return clientY < rect.top + rect.height / 2 ? "before" : "after";
}

export function reorderFieldIds<T extends string>(
  ids: T[],
  draggedId: T,
  targetId: T,
  placement: DropPlacement,
): T[] {
  if (draggedId === targetId) {
    return ids;
  }

  const draggedIndex = ids.indexOf(draggedId);
  const targetIndex = ids.indexOf(targetId);

  if (draggedIndex === -1 || targetIndex === -1) {
    return ids;
  }

  const next = [...ids];
  next.splice(draggedIndex, 1);

  const nextTargetIndex = next.indexOf(targetId);
  const insertIndex = placement === "before" ? nextTargetIndex : nextTargetIndex + 1;

  next.splice(insertIndex, 0, draggedId);
  return next;
}
