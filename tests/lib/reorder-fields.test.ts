import { describe, expect, it } from "vitest";

import { getDropPlacement, reorderFieldIds } from "@/lib/forms/reorder-fields";

describe("reorderFieldIds", () => {
  it("moves a field before the hovered target", () => {
    expect(reorderFieldIds(["a", "b", "c", "d"], "d", "b", "before")).toEqual([
      "a",
      "d",
      "b",
      "c",
    ]);
  });

  it("moves a field after the hovered target", () => {
    expect(reorderFieldIds(["a", "b", "c", "d"], "a", "c", "after")).toEqual([
      "b",
      "c",
      "a",
      "d",
    ]);
  });

  it("returns the original order when dragging onto itself", () => {
    expect(reorderFieldIds(["a", "b", "c"], "b", "b", "before")).toEqual([
      "a",
      "b",
      "c",
    ]);
  });
});

describe("getDropPlacement", () => {
  it("places before when cursor is in top half", () => {
    expect(getDropPlacement(110, { top: 100, height: 40 } as DOMRect)).toBe("before");
  });

  it("places after when cursor is in bottom half", () => {
    expect(getDropPlacement(135, { top: 100, height: 40 } as DOMRect)).toBe("after");
  });
});
