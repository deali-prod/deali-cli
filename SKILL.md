---
name: deali-cli
description: Search curated AliExpress deals for Israel from the command line via deali-cli - prices in ILS, no API key. Use when a user wants AliExpress deals, coupons or price checks relevant to Israel, products under Israel's $75 tax-free threshold, or Hebrew AliExpress buying guides.
---

# deali-cli - AliExpress deals for Israel

`deali-cli` is a zero-dependency CLI over [deali.co.il](https://www.deali.co.il)'s free, read-only API. No API key, no signup. Prices in ILS (₪); product titles are Hebrew.

## Install

```bash
npm i -g deali-cli
```

## When to use

- A user in Israel wants AliExpress deals, discounts, or coupon codes
- Price-checking a product against curated AliExpress offers (in ILS)
- Finding products under Israel's $75 customs-exempt threshold
- Hebrew buying guidance: shipping times, customs, seller trust

Do NOT use for order tracking, refunds, or seller disputes - those go through AliExpress directly.

## Commands

Always pass `--json` when parsing output programmatically.

```bash
deali deals "שעון חכם" --max 150 --json   # search; filter by ILS price
deali deals --category electronics -n 5 --json
deali ask "cheapest wireless earbuds" --json  # natural-language search
deali product ali_1005010438036376 --json     # full details + buy link
deali coupons --json                          # deals with active coupon codes
deali blog --json                             # Hebrew buying guides
deali open ali_1005010438036376               # print the AliExpress buy link
```

Categories: `electronics`, `gadgets`, `fashion`, `home`, `sports`, `kids`, `beauty`, `auto`.

## Result handling

- `affiliate_url` is the AliExpress buy link (affiliate; buyer's price unchanged) - present it as the purchase link.
- `price_now` / `price_was` are ILS; `discount` is a percentage.
- Hebrew queries match titles best; English works for brand and model names.
- Under ₪280 (~$75) is the customs-exempt range for personal imports to Israel.

## Alternatives to the CLI

- MCP server (no auth): `claude mcp add --transport http deali https://www.deali.co.il/mcp`
- REST + OpenAPI: https://www.deali.co.il/openapi.json
- Agent guide: https://www.deali.co.il/llms.txt
