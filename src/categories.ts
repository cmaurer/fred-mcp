export interface Category {
  id: number;
  name: string;
  children?: Category[];
}

export const CATEGORY_TREE: Category[] = [
  {
    id: 32991,
    name: "Money, Banking, & Finance",
    children: [
      { id: 22, name: "Interest Rates" },
      { id: 15, name: "Exchange Rates" },
      { id: 24, name: "Monetary Data" },
      { id: 46, name: "Financial Indicators" },
      { id: 23, name: "Banking" },
      { id: 32360, name: "Business Lending" },
      { id: 32145, name: "Foreign Exchange Intervention" },
    ],
  },
  {
    id: 10,
    name: "Population, Employment, & Labor Markets",
    children: [
      { id: 12, name: "Current Population Survey (Household Survey)" },
      { id: 11, name: "Current Employment Statistics (Establishment Survey)" },
      { id: 32250, name: "ADP Employment" },
      { id: 33500, name: "Education" },
      { id: 33001, name: "Income Distribution" },
      { id: 32241, name: "Job Openings and Labor Turnover (JOLTS)" },
      { id: 33509, name: "Labor Market Conditions" },
      { id: 104, name: "Population" },
      { id: 2, name: "Productivity & Costs" },
      { id: 33831, name: "Minimum Wage" },
      { id: 32240, name: "Weekly Initial Claims" },
      { id: 33731, name: "Tax Data" },
    ],
  },
  {
    id: 32992,
    name: "National Accounts",
    children: [
      { id: 18, name: "National Income & Product Accounts" },
      { id: 5, name: "Federal Government Debt" },
      { id: 32251, name: "Flow of Funds" },
      { id: 13, name: "U.S. Trade & International Transactions" },
    ],
  },
  {
    id: 1,
    name: "Production & Business Activity",
    children: [
      { id: 32262, name: "Business Cycle Expansions & Contractions" },
      { id: 33936, name: "Business Surveys" },
      { id: 32436, name: "Construction" },
      { id: 33940, name: "Emissions" },
      { id: 33955, name: "Expenditures" },
      { id: 33490, name: "Finance Companies" },
      { id: 32216, name: "Health Insurance" },
      { id: 97, name: "Housing" },
      { id: 3, name: "Industrial Production & Capacity Utilization" },
      { id: 32429, name: "Manufacturing" },
      { id: 33959, name: "Patents" },
      { id: 6, name: "Retail Trade" },
      { id: 33441, name: "Services" },
      { id: 33492, name: "Technology" },
      { id: 33202, name: "Transportation" },
      { id: 33203, name: "Wholesale Trade" },
    ],
  },
  {
    id: 32455,
    name: "Prices",
    children: [
      { id: 32217, name: "Commodities" },
      { id: 9, name: "Consumer Price Indexes (CPI and PCE)" },
      { id: 33913, name: "Cryptocurrencies" },
      { id: 4, name: "Employment Cost Index" },
      { id: 33717, name: "Health Care Indexes" },
      { id: 32261, name: "House Price Indexes" },
      { id: 31, name: "Producer Price Indexes (PPI)" },
      { id: 32220, name: "Trade Indexes" },
    ],
  },
  {
    id: 32263,
    name: "International Data",
    children: [
      { id: 32264, name: "Countries" },
      { id: 32955, name: "Geography" },
      { id: 32265, name: "Indicators" },
      { id: 32956, name: "Institutions" },
    ],
  },
  {
    id: 3008,
    name: "U.S. Regional Data",
    children: [
      { id: 27281, name: "States" },
      { id: 32043, name: "Census Regions" },
      { id: 32061, name: "BEA Regions" },
      { id: 32849, name: "BLS Regions" },
      { id: 32071, name: "Federal Reserve Districts" },
      { id: 32233, name: "Freddie Mac Regions" },
    ],
  },
  {
    id: 33060,
    name: "Academic Data",
    children: [
      { id: 33833, name: "Banking and Monetary Statistics, 1914-1941" },
      { id: 33951, name: "Daily Federal Funds Rate, 1928-54" },
      { id: 33825, name: "Data on the nominal term structure model from Kim and Wright" },
      { id: 33201, name: "Economic Policy Uncertainty" },
      { id: 33891, name: "Historical Federal Reserve Data" },
      { id: 33839, name: "A Millennium of Macroeconomic Data for the UK" },
      { id: 33061, name: "NBER Macrohistory Database" },
      { id: 33934, name: "New England Textile Industry, 1815-1860" },
      { id: 33100, name: "Penn World Table 7.1" },
      { id: 33402, name: "Penn World Table 11.0" },
      { id: 33120, name: "Recession Probabilities" },
      { id: 33442, name: "Sticky Wages and Comovement" },
      { id: 34000, name: "The Effects of the 1930s HOLC \"Redlining\" Maps" },
      { id: 34309, name: "U.S. Survey of Working Arrangements and Attitudes" },
      { id: 33123, name: "Weekly U.S. and State Bond Prices, 1855-1865" },
    ],
  },
];

function renderTree(categories: Category[], indent = ""): string {
  return categories
    .map((cat) => {
      const line = `${indent}[${cat.id}] ${cat.name}`;
      const childLines = cat.children ? renderTree(cat.children, indent + "  ") : "";
      return childLines ? `${line}\n${childLines}` : line;
    })
    .join("\n");
}

export const CATEGORY_TREE_TEXT = `FRED Category Tree
Use category IDs with fred_get_category_series or fred_get_category to explore further.

${renderTree(CATEGORY_TREE)}`;
