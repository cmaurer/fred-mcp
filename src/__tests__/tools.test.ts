import { describe, it, expect, vi } from "vitest";
import { handleTool } from "../tools.js";

const MOCK_SERIES = vi.hoisted(() => ({
  id: "UNRATE",
  title: "Unemployment Rate",
  frequency: "Monthly",
  units: "Percent",
  seasonal_adjustment: "Seasonally Adjusted",
  observation_start: "1948-01-01",
  observation_end: "2026-05-01",
  last_updated: "2026-06-05 08:31:02-05",
  popularity: 98,
}));

vi.mock("../fred.js", () => ({
  searchSeries: vi.fn().mockResolvedValue({ count: 53486, seriess: [MOCK_SERIES] }),
  getSeries: vi.fn().mockResolvedValue({ seriess: [MOCK_SERIES] }),
  getObservations: vi.fn().mockResolvedValue({
    count: 924,
    observations: [
      { date: "2026-01-01", value: "4.0" },
      { date: "2026-02-01", value: "4.1" },
    ],
  }),
  getSeriesUpdates: vi.fn().mockResolvedValue({ seriess: [MOCK_SERIES] }),
  getCategoryChildren: vi.fn().mockResolvedValue({
    categories: [{ id: 22, name: "Interest Rates", parent_id: 32991 }],
  }),
  getCategorySeries: vi.fn().mockResolvedValue({ count: 120, seriess: [MOCK_SERIES] }),
  listReleases: vi.fn().mockResolvedValue({
    count: 325,
    releases: [{ id: 10, name: "Consumer Price Index", press_release: true, link: "http://www.bls.gov/cpi/" }],
  }),
  getReleaseSeries: vi.fn().mockResolvedValue({ count: 42, seriess: [MOCK_SERIES] }),
  getSeriesTags: vi.fn().mockResolvedValue({
    tags: [
      { name: "sa", group_id: "seas", notes: "Seasonally Adjusted", popularity: 86, series_count: 95356 },
      { name: "bls", group_id: "src", popularity: 88, series_count: 179110 },
    ],
  }),
  searchByTags: vi.fn().mockResolvedValue({ count: 200, seriess: [MOCK_SERIES] }),
}));

describe("handleTool – series", () => {
  it("fred_search_series formats a result list with total count", async () => {
    const result = await handleTool("fred_search_series", { search_text: "unemployment" });
    expect(result).toContain("Found 53486 total");
    expect(result).toContain("[UNRATE] Unemployment Rate");
    expect(result).toContain("Monthly");
  });

  it("fred_get_series formats series metadata", async () => {
    const result = await handleTool("fred_get_series", { series_id: "UNRATE" });
    expect(result).toContain("ID: UNRATE");
    expect(result).toContain("Title: Unemployment Rate");
    expect(result).toContain("Frequency: Monthly");
    expect(result).toContain("Units: Percent");
  });

  it("fred_get_observations returns CSV with header", async () => {
    const result = await handleTool("fred_get_observations", { series_id: "UNRATE" });
    expect(result).toContain("date,value");
    expect(result).toContain("2026-01-01,4.0");
    expect(result).toContain("2026-02-01,4.1");
    expect(result).toContain("Total observations: 924");
  });

  it("fred_get_series_updates lists recently updated series", async () => {
    const result = await handleTool("fred_get_series_updates", {});
    expect(result).toContain("[UNRATE]");
  });
});

describe("handleTool – categories", () => {
  it("fred_get_category returns child category IDs and names", async () => {
    const result = await handleTool("fred_get_category", { category_id: 32991 });
    expect(result).toContain("[22] Interest Rates");
  });

  it("fred_get_category_series returns series list with total", async () => {
    const result = await handleTool("fred_get_category_series", { category_id: 22 });
    expect(result).toContain("Found 120 total");
    expect(result).toContain("[UNRATE]");
  });
});

describe("handleTool – releases", () => {
  it("fred_list_releases includes release ID, name, and link", async () => {
    const result = await handleTool("fred_list_releases", {});
    expect(result).toContain("Found 325 total");
    expect(result).toContain("[10] Consumer Price Index");
    expect(result).toContain("http://www.bls.gov/cpi/");
  });

  it("fred_get_release_series returns series for a release", async () => {
    const result = await handleTool("fred_get_release_series", { release_id: 10 });
    expect(result).toContain("Found 42 total");
    expect(result).toContain("[UNRATE]");
  });
});

describe("handleTool – tags", () => {
  it("fred_get_series_tags lists tag names with group and count", async () => {
    const result = await handleTool("fred_get_series_tags", { series_id: "UNRATE" });
    expect(result).toContain("sa (group: seas, series: 95356)");
    expect(result).toContain("bls (group: src, series: 179110)");
  });

  it("fred_search_by_tags returns matching series", async () => {
    const result = await handleTool("fred_search_by_tags", { tag_names: "unemployment;monthly;sa" });
    expect(result).toContain("Found 200 total");
    expect(result).toContain("[UNRATE]");
  });
});

describe("handleTool – errors", () => {
  it("throws for unknown tool names", async () => {
    await expect(handleTool("unknown_tool", {})).rejects.toThrow("Unknown tool: unknown_tool");
  });

  it("throws when a required string arg is missing", async () => {
    await expect(handleTool("fred_get_series", {})).rejects.toThrow("series_id must be a string");
  });

  it("throws when a required number arg is missing", async () => {
    await expect(handleTool("fred_get_category", {})).rejects.toThrow("category_id is required");
  });
});
