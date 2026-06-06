const BASE_URL = "https://api.stlouisfed.org/fred";

function getApiKey(): string {
  const key = process.env.FRED_API_KEY;
  if (!key) throw new Error("FRED_API_KEY environment variable is not set");
  return key;
}

async function fredFetch<T>(
  path: string,
  params: Record<string, string | number | undefined>
): Promise<T> {
  const url = new URL(`${BASE_URL}/${path}`);
  url.searchParams.set("api_key", getApiKey());
  url.searchParams.set("file_type", "json");
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) url.searchParams.set(k, String(v));
  }
  const res = await fetch(url.toString());
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`FRED API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// ── Types ──────────────────────────────────────────────────────────────────

export interface FredSeries {
  id: string;
  title: string;
  observation_start: string;
  observation_end: string;
  frequency: string;
  units: string;
  seasonal_adjustment: string;
  last_updated: string;
  popularity?: number;
  notes?: string;
}

export interface FredObservation {
  date: string;
  value: string;
}

export interface FredCategory {
  id: number;
  name: string;
  parent_id: number;
}

export interface FredRelease {
  id: number;
  name: string;
  press_release: boolean;
  link?: string;
}

export interface FredTag {
  name: string;
  group_id: string;
  notes?: string;
  popularity: number;
  series_count: number;
}

// ── Series ─────────────────────────────────────────────────────────────────

export async function searchSeries(params: {
  search_text: string;
  limit?: number;
  order_by?: string;
  sort_order?: string;
  filter_variable?: string;
  filter_value?: string;
  tag_names?: string;
}): Promise<{ count: number; seriess: FredSeries[] }> {
  return fredFetch("series/search", {
    search_text: params.search_text,
    limit: params.limit ?? 10,
    order_by: params.order_by,
    sort_order: params.sort_order,
    filter_variable: params.filter_variable,
    filter_value: params.filter_value,
    tag_names: params.tag_names,
  });
}

export async function getSeries(seriesId: string): Promise<{ seriess: FredSeries[] }> {
  return fredFetch("series", { series_id: seriesId });
}

export async function getObservations(params: {
  series_id: string;
  observation_start?: string;
  observation_end?: string;
  limit?: number;
  sort_order?: string;
  units?: string;
  frequency?: string;
  aggregation_method?: string;
}): Promise<{ count: number; observations: FredObservation[] }> {
  return fredFetch("series/observations", {
    series_id: params.series_id,
    observation_start: params.observation_start,
    observation_end: params.observation_end,
    limit: params.limit ?? 100,
    sort_order: params.sort_order ?? "asc",
    units: params.units,
    frequency: params.frequency,
    aggregation_method: params.aggregation_method,
  });
}

export async function getSeriesUpdates(params: {
  limit?: number;
  filter_value?: string;
}): Promise<{ seriess: FredSeries[] }> {
  return fredFetch("series/updates", {
    limit: params.limit ?? 20,
    filter_value: params.filter_value,
  });
}

// ── Categories ─────────────────────────────────────────────────────────────

export async function getCategoryChildren(
  categoryId: number
): Promise<{ categories: FredCategory[] }> {
  return fredFetch("category/children", { category_id: categoryId });
}

export async function getCategorySeries(params: {
  category_id: number;
  limit?: number;
  order_by?: string;
  sort_order?: string;
  filter_variable?: string;
  filter_value?: string;
}): Promise<{ count: number; seriess: FredSeries[] }> {
  return fredFetch("category/series", {
    category_id: params.category_id,
    limit: params.limit ?? 20,
    order_by: params.order_by,
    sort_order: params.sort_order,
    filter_variable: params.filter_variable,
    filter_value: params.filter_value,
  });
}

// ── Releases ───────────────────────────────────────────────────────────────

export async function listReleases(params: {
  limit?: number;
  order_by?: string;
  sort_order?: string;
}): Promise<{ count: number; releases: FredRelease[] }> {
  return fredFetch("releases", {
    limit: params.limit ?? 20,
    order_by: params.order_by,
    sort_order: params.sort_order,
  });
}

export async function getReleaseSeries(params: {
  release_id: number;
  limit?: number;
  order_by?: string;
}): Promise<{ count: number; seriess: FredSeries[] }> {
  return fredFetch("release/series", {
    release_id: params.release_id,
    limit: params.limit ?? 20,
    order_by: params.order_by,
  });
}

// ── Tags ───────────────────────────────────────────────────────────────────

export async function getSeriesTags(
  seriesId: string
): Promise<{ tags: FredTag[] }> {
  return fredFetch("series/tags", { series_id: seriesId });
}

export async function searchByTags(params: {
  tag_names: string;
  limit?: number;
  order_by?: string;
}): Promise<{ count: number; seriess: FredSeries[] }> {
  return fredFetch("tags/series", {
    tag_names: params.tag_names,
    limit: params.limit ?? 20,
    order_by: params.order_by,
  });
}
