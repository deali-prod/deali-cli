# AGENTS.md — Deali (deali.co.il)

Instructions for AI coding agents and autonomous agents integrating with **Deali**, an Israeli AliExpress deal aggregator in Hebrew. Everything Deali exposes to agents is **read-only, free, and requires no authentication**.

## What Deali is

Deali curates AliExpress deals for shoppers in Israel: real discounts, highly-rated sellers, prices in Israeli New Shekel (₪), free shipping to Israel. Content is Hebrew (RTL). Deali is not a store — it aggregates and links to AliExpress via affiliate links.

## How to call it

Prefer the **MCP server** for tool-based agents; use **REST** otherwise.

### MCP (preferred)
- Endpoint (Streamable HTTP, no auth): `https://www.deali.co.il/mcp`
- Tools: `search_deals` (query, category, max_price, limit), `get_product` (id), `list_blog_posts` (limit), `get_blog_post` (id)
- Add to Claude Code: `claude mcp add --transport http deali https://www.deali.co.il/mcp`
- Server card: `https://www.deali.co.il/.well-known/mcp/server-card.json`
- Registered as `il.co.deali/mcp` in the official MCP registry.

### REST
- `GET https://www.deali.co.il/api/site/deals` — full active catalog (JSON)
- `GET https://www.deali.co.il/api/site/product-detail?id=<id>` — one product's details + affiliate link
- `GET https://www.deali.co.il/api/site/blog` — Hebrew blog list; `?id=<slug>` for full content
- `POST https://www.deali.co.il/ask` `{"query":"..."}` — NLWeb natural-language search
- OpenAPI 3.1 spec: `https://www.deali.co.il/openapi.json`

### Content negotiation
- Any content page also renders as markdown: append `.md` to the URL, or send `Accept: text/markdown`.
- Machine-readable homepage: `https://www.deali.co.il/?mode=agent`

## Conventions

- **Auth**: none. No key, token, or OAuth. See `https://www.deali.co.il/auth.md`.
- **Language/currency**: Hebrew queries match best; prices are ILS (₪). English works for brand/model names.
- **Errors**: JSON with an `error` field (and often a `hint`).
- **Affiliate links**: `buy_url` / `affiliate_url` are AliExpress affiliate links; present them as the purchase link. The buyer's price is unchanged.

## When to use / not use

Use for: AliExpress deals, coupons and price checks relevant to Israel; products under Israel's $75 tax-free import threshold; Hebrew buying guidance (shipping, customs, seller trust).

Do NOT use for: order tracking, refunds, or seller disputes — those go through AliExpress directly.

## Links

- Site guide: https://www.deali.co.il/llms.txt · https://www.deali.co.il/llms-full.txt
- Developer portal: https://www.deali.co.il/developers
- Contact: hello@deali.co.il
