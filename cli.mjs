#!/usr/bin/env node
// deali-cli - query deali.co.il's free AliExpress-deals API from the terminal.
// Zero dependencies, no API key. https://www.deali.co.il/developers
/* eslint-disable no-console */

const BASE = process.env.DEALI_BASE_URL || "https://www.deali.co.il";
const VERSION = "1.0.0";

const HELP = `deali ${VERSION} - AliExpress deals for Israel, from the terminal

USAGE
  deali <command> [options]

COMMANDS
  deals [query]        List curated deals. Optional free-text query.
  product <id>         Full details for one product id (ali_...).
  ask <question>       Natural-language search (NLWeb) over deals + guides.
  blog [slug]          List Hebrew buying guides, or fetch one by slug.
  coupons              Deals that currently carry a coupon code.
  open <id>            Print the AliExpress buy link for a product id.

OPTIONS
  -c, --category <c>   electronics|gadgets|fashion|home|sports|kids|beauty|auto
  -m, --max <ils>      Only deals at or below this price in ILS
  -n, --limit <n>      Max results (default 10)
      --json           Raw JSON output (for scripts and agents)
  -h, --help           Show this help
  -v, --version        Show version

EXAMPLES
  deali deals "שעון חכם" --max 150
  deali deals --category electronics -n 5
  deali ask "what is the cheapest smartwatch"
  deali product ali_1005010438036376 --json

No API key required. Prices in ILS. Docs: ${BASE}/developers`;

function parseArgs(argv) {
  const opts = { _: [], json: false, limit: 10 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--json") opts.json = true;
    else if (a === "-h" || a === "--help") opts.help = true;
    else if (a === "-v" || a === "--version") opts.version = true;
    else if (a === "-c" || a === "--category") opts.category = argv[++i];
    else if (a === "-m" || a === "--max") opts.max = Number(argv[++i]);
    else if (a === "-n" || a === "--limit") opts.limit = Number(argv[++i]);
    else if (a.startsWith("-")) fail(`Unknown option: ${a}`);
    else opts._.push(a);
  }
  return opts;
}

function fail(msg, code = 1) {
  console.error(`deali: ${msg}`);
  process.exit(code);
}

async function get(path) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { accept: "application/json", "user-agent": `deali-cli/${VERSION}` },
  });
  if (!res.ok) fail(`request failed (${res.status} ${res.statusText}) for ${path}`);
  return res.json();
}

const ils = (n) => `₪${Number(n || 0).toFixed(0)}`;

function printDeal(d, i) {
  const disc = Number(d.discount) ? ` (-${d.discount}%)` : "";
  const rating = Number(d.rating) ? `  ★${Number(d.rating).toFixed(1)}` : "";
  const coupon = d.coupon_code ? `  coupon:${d.coupon_code}` : "";
  console.log(`${String(i + 1).padStart(2)}. ${d.title}`);
  console.log(`    ${ils(d.price_now)}${disc}${rating}${coupon}`);
  console.log(`    ${BASE}/product/${d.id}`);
}

function filterDeals(deals, opts, query) {
  const q = (query || "").trim().toLowerCase();
  let out = deals.filter((d) => d.active !== false);
  if (q) out = out.filter((d) => `${d.title} ${d.description || ""}`.toLowerCase().includes(q));
  if (opts.category) out = out.filter((d) => d.category === opts.category);
  if (opts.max) out = out.filter((d) => Number(d.price_now) <= opts.max);
  return out.sort((a, b) => (Number(b.discount) || 0) - (Number(a.discount) || 0));
}

async function cmdDeals(opts) {
  const { deals = [] } = await get("/api/site/deals");
  const out = filterDeals(deals, opts, opts._[1]).slice(0, opts.limit);
  if (opts.json) return console.log(JSON.stringify(out, null, 2));
  if (!out.length) return console.log("No deals matched. Try a broader query or drop --max.");
  out.forEach(printDeal);
  console.log(`\n${out.length} shown. Buy links go to AliExpress (affiliate).`);
}

async function cmdCoupons(opts) {
  const { deals = [] } = await get("/api/site/deals");
  const out = deals.filter((d) => d.coupon_code && d.active !== false).slice(0, opts.limit);
  if (opts.json) return console.log(JSON.stringify(out, null, 2));
  if (!out.length) return console.log("No active coupons right now.");
  out.forEach(printDeal);
}

async function cmdProduct(opts) {
  const id = opts._[1];
  if (!id) fail("product requires an id, e.g. deali product ali_1005010438036376");
  const { deals = [] } = await get("/api/site/deals");
  const d = deals.find((x) => String(x.id) === id);
  if (!d) fail(`product not found: ${id}`);
  if (opts.json) return console.log(JSON.stringify(d, null, 2));
  console.log(d.title);
  console.log(`price     ${ils(d.price_now)}${d.price_was > d.price_now ? `  was ${ils(d.price_was)}` : ""}`);
  if (Number(d.discount)) console.log(`discount  ${d.discount}%`);
  if (Number(d.rating)) console.log(`rating    ${Number(d.rating).toFixed(1)} (${d.reviews_count || 0} reviews)`);
  if (d.sold_count) console.log(`sold      ${d.sold_count}`);
  if (d.shipping) console.log(`shipping  ${d.shipping}`);
  if (d.coupon_code) console.log(`coupon    ${d.coupon_code}`);
  if (d.description) console.log(`\n${d.description}`);
  console.log(`\npage  ${BASE}/product/${d.id}`);
  if (d.affiliate_url) console.log(`buy   ${d.affiliate_url}`);
}

async function cmdOpen(opts) {
  const id = opts._[1];
  if (!id) fail("open requires a product id");
  const { deals = [] } = await get("/api/site/deals");
  const d = deals.find((x) => String(x.id) === id);
  if (!d) fail(`product not found: ${id}`);
  console.log(d.affiliate_url || `${BASE}/product/${d.id}`);
}

async function cmdAsk(opts) {
  const q = opts._.slice(1).join(" ").trim();
  if (!q) fail('ask requires a question, e.g. deali ask "cheap smartwatch"');
  const data = await get(`/ask?query=${encodeURIComponent(q)}`);
  if (opts.json) return console.log(JSON.stringify(data, null, 2));
  const results = (data.results || []).slice(0, opts.limit);
  if (!results.length) return console.log("No results. Try a product keyword in Hebrew or a brand name.");
  results.forEach((r, i) => {
    console.log(`${String(i + 1).padStart(2)}. ${r.name}`);
    if (r.description) console.log(`    ${r.description}`);
    console.log(`    ${r.url}`);
  });
}

async function cmdBlog(opts) {
  const slug = opts._[1];
  const data = await get(slug ? `/api/site/blog?id=${encodeURIComponent(slug)}` : "/api/site/blog");
  if (opts.json) return console.log(JSON.stringify(data, null, 2));
  if (slug) {
    const p = data.post || data;
    console.log(p.title || slug);
    if (p.excerpt) console.log(`\n${p.excerpt}`);
    console.log(`\n${BASE}/article/${encodeURIComponent(slug)}`);
    return;
  }
  const posts = (data.posts || []).slice(0, opts.limit);
  posts.forEach((p, i) => {
    console.log(`${String(i + 1).padStart(2)}. ${p.title}`);
    console.log(`    ${BASE}/article/${encodeURIComponent(p.slug || p.id)}`);
  });
}

const COMMANDS = { deals: cmdDeals, product: cmdProduct, ask: cmdAsk, blog: cmdBlog, coupons: cmdCoupons, open: cmdOpen };

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.version) return console.log(VERSION);
  const cmd = opts._[0];
  if (opts.help || !cmd) return console.log(HELP);
  const fn = COMMANDS[cmd];
  if (!fn) fail(`unknown command: ${cmd}\nRun 'deali --help' for usage.`);
  await fn(opts);
}

main().catch((err) => fail(err && err.message ? err.message : String(err)));
