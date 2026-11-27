# DealSleuth — Real Black Friday Deals, Checked by Hand

[![Black Friday Deal Finder](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/bounty/black-friday-deal-finder-01)
[![Rank](https://make.fun/badge/black-friday-deal-finder-01/encoderrrr/black-friday-deals-27nov/rank.svg)](https://make.fun/bounty/black-friday-deal-finder-01)
[![Reward](https://make.fun/badge/black-friday-deal-finder-01/encoderrrr/black-friday-deals-27nov/reward.svg)](https://make.fun/bounty/black-friday-deal-finder-01)

Entry for [Build the best real Black Friday deal finder](https://make.fun/bounty/black-friday-deal-finder-01) — a static deal-finder site of real Black Friday and Cyber Monday 2026 deals, each checked by the maker on 27 November 2026.

## What it is

DealSleuth lists **29 deals** across 8 categories (Audio, TVs, Laptops & Tablets, Gaming, Home, Toys & Kids, Wearables, Streaming) from Amazon, Best Buy and the PlayStation Store, with a total saving of **$4,487.45** if you bought one of each.

Every deal shows its product, store, a link to the product at that store, the sale price, the usual price, the discount and saving, and the time its price was checked — plus an honest verdict on whether it is really a deal:

- **REAL DEAL** — half price or better off the usual price
- **GOOD DEAL** — 30–49% off
- **DECENT DEAL** — 20–29% off
- **SMALL CUT** — under 20%; worth it only if you need it now

Search and filters by category, store and minimum discount all work, as does sorting by discount, saving or price. A filtered view can be shared as a link, e.g. `index.html?category=TVs&discount=50`.

## How the deals were checked

Each price was read on **27 November 2026, 09:00 UTC**, in one of two ways, and the site says which on every card:

- **On the store's own page** (4 deals): LG B6E OLED TV, Sony WH-1000XM4C and Bose QuietComfort Headphones (2nd Gen) at Best Buy, and 007 First Light at the PlayStation Store.
- **In a named deals roundup** (25 deals): The Verge's “The best Black Friday deals we've already found”, updated 26 November 2026, which names the store for each price. Each store link is the real product page that roundup linked to.

Nothing here is invented: no product, store, price or link appears that no store or deals source showed when it was checked. Prices move fast over the weekend — the store link always shows the live price.

## The site

- `app/` — the whole site as static files, no build step and no network: `index.html`, `style.css`, `deals.js` (the 29 deals) and `app.js` (rendering, search, filters, sorting, verdicts).
- `screenshots/` — four real renders of the site in headless Chromium: the full list, the 50%-off-or-more filter, a search for “tv”, and a phone-size view (390×844).
- `main.ts` — the hand-in program (Node 22, standard library only): copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library.
- `vendor/makefun-frontend.ts` — the kit's copy, unchanged.

Run it with `mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts`, then serve `out/app` with any static server and open `index.html`.

## License

MIT — see [LICENSE](LICENSE).
