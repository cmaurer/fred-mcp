# fred-mcp

A [Model Context Protocol](https://modelcontextprotocol.io) server for the [Federal Reserve Economic Data (FRED)](https://fred.stlouisfed.org) API. Gives Claude Desktop direct access to 800,000+ economic time-series: GDP, unemployment, inflation, interest rates, and more.

## Tools

| Tool | Description |
|---|---|
| `fred_search_series` | Search series by keyword with optional filters for frequency, units, and seasonal adjustment |
| `fred_get_series` | Get metadata for a series by ID (title, frequency, units, date range) |
| `fred_get_observations` | Fetch data values as CSV, with support for date ranges, unit transforms, and frequency aggregation |
| `fred_get_series_updates` | List recently updated series |
| `fred_get_category` | Get subcategories for a given category ID |
| `fred_get_category_series` | List series belonging to a category |
| `fred_list_releases` | List all FRED data releases (CPI, GDP, etc.) |
| `fred_get_release_series` | List series belonging to a release |
| `fred_get_series_tags` | Get tags for a series (geography, frequency, source, topic) |
| `fred_search_by_tags` | Find series by tag combination (e.g. `unemployment;monthly;sa`) |

The server also exposes a `fred://categories` resource — a static two-level category tree loaded into Claude's context without an API call.

## Requirements

- Node.js 18+
- A free [FRED API key](https://fred.stlouisfed.org/docs/api/api_key.html)

## Claude Desktop Setup

Add the following to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "fred": {
      "command": "node",
      "args": ["/path/to/fred-mcp/dist/index.js"],
      "env": {
        "FRED_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

Then restart Claude Desktop. You should see `fred` in the MCP tools list.

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Watch mode
npm run test:watch

# Run locally (dev, no build step)
FRED_API_KEY=your_key npm run dev
```

## Example Prompts

Once connected to Claude Desktop, try:

- *"What was the US unemployment rate last month?"*
- *"Show me CPI inflation over the last 5 years."*
- *"Find GDP data and plot the trend since 2000."*
- *"What FRED series are available for mortgage rates?"*
- *"Compare the fed funds rate to the 10-year Treasury yield since 2020."*

## Releases

This project uses [semantic-release](https://semantic-release.gitbook.io) with [conventional commits](https://www.conventionalcommits.org). Merging to `main` automatically determines the version bump and publishes a GitHub release.

| Commit prefix | Version bump |
|---|---|
| `fix:` | Patch (1.0.x) |
| `feat:` | Minor (1.x.0) |
| `BREAKING CHANGE:` | Major (x.0.0) |
| `chore:`, `docs:`, `test:` | No release |
