import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { handleTool, type Args } from "./tools.js";
import { CATEGORY_TREE_TEXT } from "./categories.js";

const server = new McpServer({ name: "fred-mcp", version: "1.0.0" });

// ── Shared schema fragments ────────────────────────────────────────────────

const seriesOrderBy = z
  .enum(["series_id", "title", "units", "frequency", "seasonal_adjustment", "last_updated", "observation_start", "observation_end", "popularity"])
  .optional();

const sortOrder = z.enum(["asc", "desc"]).optional();

// ── Tools ──────────────────────────────────────────────────────────────────

server.registerTool(
  "fred_search_series",
  {
    description:
      "Search FRED for economic data series by keyword. Returns series ID, title, frequency, units, and date range. Use the series ID with fred_get_observations to retrieve data.",
    inputSchema: {
      search_text: z.string().describe("Keywords to search for (e.g. 'unemployment rate', 'GDP', 'CPI')"),
      limit: z.number().optional().describe("Number of results to return (default 10, max 1000)"),
      order_by: z
        .enum(["search_rank", "popularity", "last_updated", "title", "observation_end"])
        .optional()
        .describe("Sort results by this field (default: search_rank)"),
      sort_order: sortOrder.describe("Sort direction (default: desc for search_rank/popularity)"),
      filter_variable: z
        .enum(["frequency", "units", "seasonal_adjustment"])
        .optional()
        .describe("Filter results by this variable"),
      filter_value: z.string().optional().describe("Value to filter by (e.g. 'Monthly', 'Percent')"),
      tag_names: z.string().optional().describe("Semicolon-separated tag names to filter by (e.g. 'usa;monthly')"),
    },
  },
  async (args) => ({
    content: [{ type: "text" as const, text: await handleTool("fred_search_series", args as Args) }],
  })
);

server.registerTool(
  "fred_get_series",
  {
    description:
      "Get metadata for a specific FRED series by its ID (e.g. UNRATE, GDP, CPIAUCSL). Returns title, frequency, units, seasonal adjustment, date range, and notes.",
    inputSchema: {
      series_id: z.string().describe("FRED series ID (e.g. 'UNRATE', 'GDP', 'FEDFUNDS')"),
    },
  },
  async (args) => ({
    content: [{ type: "text" as const, text: await handleTool("fred_get_series", args as Args) }],
  })
);

server.registerTool(
  "fred_get_observations",
  {
    description:
      "Get the actual data values (observations) for a FRED series. Returns date/value pairs as CSV. Supports date range filtering, unit transformations, and frequency aggregation.",
    inputSchema: {
      series_id: z.string().describe("FRED series ID (e.g. 'UNRATE', 'GDP', 'FEDFUNDS')"),
      observation_start: z.string().optional().describe("Start date in YYYY-MM-DD format"),
      observation_end: z.string().optional().describe("End date in YYYY-MM-DD format"),
      limit: z.number().optional().describe("Number of observations to return (default 100, max 100000)"),
      sort_order: sortOrder.describe("Date sort order (default: asc)"),
      units: z
        .enum(["lin", "chg", "pch", "pc1", "pca", "cch", "cca", "log"])
        .optional()
        .describe(
          "Data transformation: lin=levels, chg=change, pch=% change, pc1=% change from year ago, pca=compounded annual % change, cch=continuously compounded change, cca=compounded annual rate, log=natural log"
        ),
      frequency: z
        .enum(["d", "w", "bw", "m", "q", "sa", "a"])
        .optional()
        .describe("Aggregate to lower frequency: d=daily, w=weekly, bw=biweekly, m=monthly, q=quarterly, sa=semiannual, a=annual"),
      aggregation_method: z
        .enum(["avg", "sum", "eop"])
        .optional()
        .describe("How to aggregate when changing frequency: avg=average, sum=sum, eop=end of period"),
    },
  },
  async (args) => ({
    content: [{ type: "text" as const, text: await handleTool("fred_get_observations", args as Args) }],
  })
);

server.registerTool(
  "fred_get_series_updates",
  {
    description: "List FRED series that were recently updated. Useful for checking what new data has been published.",
    inputSchema: {
      limit: z.number().optional().describe("Number of series to return (default 20)"),
      filter_value: z
        .enum(["macro", "regional", "all"])
        .optional()
        .describe("Filter by data scope (default: all)"),
    },
  },
  async (args) => ({
    content: [{ type: "text" as const, text: await handleTool("fred_get_series_updates", args as Args) }],
  })
);

server.registerTool(
  "fred_get_category",
  {
    description:
      "Get the child subcategories of a FRED category. Use the fred://categories resource for the top-level tree. Use this tool to drill deeper into a specific category branch.",
    inputSchema: {
      category_id: z.number().describe("FRED category ID. Use 0 for the root, or an ID from fred://categories"),
    },
  },
  async (args) => ({
    content: [{ type: "text" as const, text: await handleTool("fred_get_category", args as Args) }],
  })
);

server.registerTool(
  "fred_get_category_series",
  {
    description:
      "List series that belong to a specific FRED category. Use fred://categories or fred_get_category to find category IDs.",
    inputSchema: {
      category_id: z.number().describe("FRED category ID"),
      limit: z.number().optional().describe("Number of results to return (default 20)"),
      order_by: seriesOrderBy.describe("Sort field (default: series_id)"),
      sort_order: sortOrder,
      filter_variable: z.enum(["frequency", "units", "seasonal_adjustment"]).optional(),
      filter_value: z.string().optional(),
    },
  },
  async (args) => ({
    content: [{ type: "text" as const, text: await handleTool("fred_get_category_series", args as Args) }],
  })
);

server.registerTool(
  "fred_list_releases",
  {
    description:
      "List FRED data releases (e.g. 'Consumer Price Index', 'Gross Domestic Product'). Each release groups related series. Use release IDs with fred_get_release_series.",
    inputSchema: {
      limit: z.number().optional().describe("Number of releases to return (default 20)"),
      order_by: z
        .enum(["release_id", "name", "press_release", "realtime_start", "realtime_end"])
        .optional()
        .describe("Sort field (default: release_id)"),
      sort_order: sortOrder,
    },
  },
  async (args) => ({
    content: [{ type: "text" as const, text: await handleTool("fred_list_releases", args as Args) }],
  })
);

server.registerTool(
  "fred_get_release_series",
  {
    description:
      "List all series belonging to a specific data release. Use fred_list_releases to find release IDs.",
    inputSchema: {
      release_id: z.number().describe("FRED release ID"),
      limit: z.number().optional().describe("Number of series to return (default 20)"),
      order_by: seriesOrderBy,
    },
  },
  async (args) => ({
    content: [{ type: "text" as const, text: await handleTool("fred_get_release_series", args as Args) }],
  })
);

server.registerTool(
  "fred_get_series_tags",
  {
    description:
      "Get the tags associated with a specific FRED series. Tags describe geography, frequency, source, seasonal adjustment, and topic.",
    inputSchema: {
      series_id: z.string().describe("FRED series ID"),
    },
  },
  async (args) => ({
    content: [{ type: "text" as const, text: await handleTool("fred_get_series_tags", args as Args) }],
  })
);

server.registerTool(
  "fred_search_by_tags",
  {
    description:
      "Find FRED series by tag names. Useful for finding all series with specific characteristics (e.g. all monthly, seasonally-adjusted unemployment series for a specific state).",
    inputSchema: {
      tag_names: z
        .string()
        .describe("Semicolon-separated tag names (e.g. 'unemployment;monthly;sa' or 'usa;annual'). All tags must match."),
      limit: z.number().optional().describe("Number of results (default 20)"),
      order_by: seriesOrderBy,
    },
  },
  async (args) => ({
    content: [{ type: "text" as const, text: await handleTool("fred_search_by_tags", args as Args) }],
  })
);

// ── Resource ───────────────────────────────────────────────────────────────

server.registerResource(
  "FRED Category Tree",
  "fred://categories",
  {
    description:
      "Top-level FRED data categories with subcategory IDs. Use these IDs with fred_get_category_series or fred_get_category.",
    mimeType: "text/plain",
  },
  async () => ({
    contents: [{ uri: "fred://categories", mimeType: "text/plain", text: CATEGORY_TREE_TEXT }],
  })
);

// ── Start ──────────────────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
