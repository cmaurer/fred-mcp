import {
  searchSeries,
  getSeries,
  getObservations,
  getSeriesUpdates,
  getCategoryChildren,
  getCategorySeries,
  listReleases,
  getReleaseSeries,
  getSeriesTags,
  searchByTags,
  type FredSeries,
  type FredObservation,
} from "./fred.js";

export type Args = Record<string, unknown>;

// ── Formatters ─────────────────────────────────────────────────────────────

function formatSeries(s: FredSeries): string {
  return [
    `ID: ${s.id}`,
    `Title: ${s.title}`,
    `Frequency: ${s.frequency}`,
    `Units: ${s.units}`,
    `Seasonal Adjustment: ${s.seasonal_adjustment}`,
    `Range: ${s.observation_start} to ${s.observation_end}`,
    `Last Updated: ${s.last_updated}`,
    s.popularity !== undefined ? `Popularity: ${s.popularity}` : null,
    s.notes ? `Notes: ${s.notes.trim().slice(0, 300)}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

function formatSeriesList(seriess: FredSeries[], total: number): string {
  const lines = seriess.map(
    (s, i) =>
      `${i + 1}. [${s.id}] ${s.title} | ${s.frequency} | ${s.units} | ${s.observation_start}–${s.observation_end}`
  );
  return `Found ${total} total. Showing ${seriess.length}:\n\n${lines.join("\n")}`;
}

function formatObservations(obs: FredObservation[], total: number): string {
  const rows = obs.map((o) => `${o.date},${o.value}`).join("\n");
  return `Total observations: ${total}. Showing ${obs.length}.\n\ndate,value\n${rows}`;
}

// ── Handler ────────────────────────────────────────────────────────────────

function str(args: Args, key: string): string {
  const v = args[key];
  if (typeof v !== "string") throw new Error(`${key} must be a string`);
  return v;
}

function num(args: Args, key: string): number | undefined {
  const v = args[key];
  if (v === undefined) return undefined;
  if (typeof v !== "number") throw new Error(`${key} must be a number`);
  return v;
}

function optStr(args: Args, key: string): string | undefined {
  const v = args[key];
  if (v === undefined) return undefined;
  if (typeof v !== "string") throw new Error(`${key} must be a string`);
  return v;
}

export async function handleTool(name: string, args: Args): Promise<string> {
  switch (name) {
    case "fred_search_series": {
      const result = await searchSeries({
        search_text: str(args, "search_text"),
        limit: num(args, "limit"),
        order_by: optStr(args, "order_by"),
        sort_order: optStr(args, "sort_order"),
        filter_variable: optStr(args, "filter_variable"),
        filter_value: optStr(args, "filter_value"),
        tag_names: optStr(args, "tag_names"),
      });
      return formatSeriesList(result.seriess, result.count);
    }

    case "fred_get_series": {
      const result = await getSeries(str(args, "series_id"));
      const s = result.seriess[0];
      if (!s) return "Series not found.";
      return formatSeries(s);
    }

    case "fred_get_observations": {
      const result = await getObservations({
        series_id: str(args, "series_id"),
        observation_start: optStr(args, "observation_start"),
        observation_end: optStr(args, "observation_end"),
        limit: num(args, "limit"),
        sort_order: optStr(args, "sort_order"),
        units: optStr(args, "units"),
        frequency: optStr(args, "frequency"),
        aggregation_method: optStr(args, "aggregation_method"),
      });
      return formatObservations(result.observations, result.count);
    }

    case "fred_get_series_updates": {
      const result = await getSeriesUpdates({
        limit: num(args, "limit"),
        filter_value: optStr(args, "filter_value"),
      });
      return formatSeriesList(result.seriess, result.seriess.length);
    }

    case "fred_get_category": {
      const categoryId = num(args, "category_id");
      if (categoryId === undefined) throw new Error("category_id is required");
      const result = await getCategoryChildren(categoryId);
      if (!result.categories.length) return "No subcategories found.";
      return result.categories.map((c) => `[${c.id}] ${c.name}`).join("\n");
    }

    case "fred_get_category_series": {
      const categoryId = num(args, "category_id");
      if (categoryId === undefined) throw new Error("category_id is required");
      const result = await getCategorySeries({
        category_id: categoryId,
        limit: num(args, "limit"),
        order_by: optStr(args, "order_by"),
        sort_order: optStr(args, "sort_order"),
        filter_variable: optStr(args, "filter_variable"),
        filter_value: optStr(args, "filter_value"),
      });
      return formatSeriesList(result.seriess, result.count);
    }

    case "fred_list_releases": {
      const result = await listReleases({
        limit: num(args, "limit"),
        order_by: optStr(args, "order_by"),
        sort_order: optStr(args, "sort_order"),
      });
      return (
        `Found ${result.count} total. Showing ${result.releases.length}:\n\n` +
        result.releases
          .map((r) => `[${r.id}] ${r.name}${r.link ? ` — ${r.link}` : ""}`)
          .join("\n")
      );
    }

    case "fred_get_release_series": {
      const releaseId = num(args, "release_id");
      if (releaseId === undefined) throw new Error("release_id is required");
      const result = await getReleaseSeries({
        release_id: releaseId,
        limit: num(args, "limit"),
        order_by: optStr(args, "order_by"),
      });
      return formatSeriesList(result.seriess, result.count);
    }

    case "fred_get_series_tags": {
      const result = await getSeriesTags(str(args, "series_id"));
      if (!result.tags.length) return "No tags found.";
      return result.tags
        .map((t) => `${t.name} (group: ${t.group_id}, series: ${t.series_count})`)
        .join("\n");
    }

    case "fred_search_by_tags": {
      const result = await searchByTags({
        tag_names: str(args, "tag_names"),
        limit: num(args, "limit"),
        order_by: optStr(args, "order_by"),
      });
      return formatSeriesList(result.seriess, result.count);
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
