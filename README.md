# deali-deals (`deali` CLI)

Query **[Deali](https://www.deali.co.il)** — curated AliExpress deals for Israel — from the terminal. Zero dependencies, **no API key**, prices in ILS (₪).

```bash
npm i -g deali-deals
```

## Usage

```bash
deali deals "שעון חכם" --max 150      # search deals under ₪150
deali deals --category electronics -n 5
deali ask "what is the cheapest smartwatch"   # natural-language search
deali product ali_1005010438036376 --json
deali coupons                          # deals with an active coupon code
deali blog                             # Hebrew buying guides
deali open ali_1005010438036376        # print the AliExpress buy link
```

Add `--json` to any command for machine-readable output — handy for agents and scripts.

## Commands

| Command | What it does |
|---|---|
| `deals [query]` | List curated deals; filter with `--category`, `--max`, `--limit` |
| `product <id>` | Full details for one product |
| `ask <question>` | NLWeb natural-language search over deals + guides |
| `blog [slug]` | List Hebrew buying guides, or fetch one |
| `coupons` | Deals carrying an active coupon code |
| `open <id>` | Print the AliExpress buy link |

## For AI agents

Install the agent skill so your coding agent can call this CLI:

```bash
npx skills add deali-prod/deali-cli
```

Or skip the CLI and connect the MCP server directly:

```bash
claude mcp add --transport http deali https://www.deali.co.il/mcp
```

- Agent guide: https://www.deali.co.il/llms.txt
- Developer portal: https://www.deali.co.il/developers
- OpenAPI: https://www.deali.co.il/openapi.json

## Notes

Deali aggregates and links to AliExpress; buy links are affiliate links (the buyer's price is unchanged). Not for order tracking, refunds, or seller support — those go through AliExpress directly.

MIT
