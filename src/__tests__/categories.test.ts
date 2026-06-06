import { describe, it, expect } from "vitest";
import { CATEGORY_TREE, CATEGORY_TREE_TEXT } from "../categories.js";

describe("CATEGORY_TREE", () => {
  it("has 8 top-level categories", () => {
    expect(CATEGORY_TREE).toHaveLength(8);
  });

  it("every top-level category has children", () => {
    for (const cat of CATEGORY_TREE) {
      expect(cat.children?.length).toBeGreaterThan(0);
    }
  });

  it("contains expected top-level categories", () => {
    const names = CATEGORY_TREE.map((c) => c.name);
    expect(names).toContain("Money, Banking, & Finance");
    expect(names).toContain("Population, Employment, & Labor Markets");
    expect(names).toContain("National Accounts");
    expect(names).toContain("Prices");
  });
});

describe("CATEGORY_TREE_TEXT", () => {
  it("renders top-level category IDs and names", () => {
    expect(CATEGORY_TREE_TEXT).toContain("[32991] Money, Banking, & Finance");
    expect(CATEGORY_TREE_TEXT).toContain("[10] Population, Employment, & Labor Markets");
    expect(CATEGORY_TREE_TEXT).toContain("[32455] Prices");
  });

  it("renders subcategory IDs indented under their parent", () => {
    expect(CATEGORY_TREE_TEXT).toContain("  [22] Interest Rates");
    expect(CATEGORY_TREE_TEXT).toContain("  [9] Consumer Price Indexes (CPI and PCE)");
    expect(CATEGORY_TREE_TEXT).toContain("  [18] National Income & Product Accounts");
  });

  it("includes usage instructions", () => {
    expect(CATEGORY_TREE_TEXT).toContain("fred_get_category_series");
  });
});
