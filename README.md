# Campus EATS

**Your campus. Your cravings. One place.**

An English-language campus food-ordering application with student accounts, searchable shop menus, a cart, checkout, order tracking and administration.

> **Redesign in progress.** This repository contains the isolated working foundation for the new Campus EATS website. The requested visual reference is [Bar Topas](https://bar-topas.ch/). The reference-based redesign has not yet been implemented; inspection is blocked by the browser's saved access policy.

## Run locally

Requires Node.js 22.9 or newer.

```sh
git clone https://github.com/Tapesh001/Campus-EATS.git "Campus EATS"
cd "Campus EATS"
npm ci
npm start
```

Open **http://localhost:8877**. Keep the terminal running. This is a local development address, not a publicly hosted URL.

## Project map

| Folder | Contents |
| --- | --- |
| `01-designs/` | Standalone HTML and CSS previews, without browser JavaScript |
| `02-frontend/pages/` | Linked application pages |
| `02-frontend/styles/` | Shared and page-specific styles |
| `02-frontend/scripts/` | Forms, menus, cart, checkout and API requests |
| `02-frontend/assets/` | Images and illustrations |
| `03-backend/` | Express APIs, authentication, persistence and tests |
| `04-data/` | Public starting menu catalog |
| `05-documentation/` | Architecture, team workflow and design exporter |

## Features carried forward

- BMU-domain student registration, login and editable profiles.
- Actual provided shop menus, item options, search and stock-aware ordering.
- Cart, server-validated prices, coupons and retry-safe order submission.
- Shop-counter or hostel-gate collection requests and order tracking.
- Favourites, saved addresses and administrator tools.
- Password-reset codes through a separately configured email provider.
- Local JSON storage by default; optional MongoDB persistence.

Orders are recorded in this application. Restaurant dispatch and online payment processing are not integrated. Email-domain validation does not verify ownership of a mailbox. Sessions are held in memory and end when the server restarts.

## Separate configuration and data

This project uses its own ignored `.local-data/` folder by default. No accounts, orders, passwords, provider keys or cloud settings from the previous website are included.

Optional settings belong in a private `.env` file:

```dotenv
PORT=8877
HOST=0.0.0.0
# BMU_ADMIN_PASSWORD=choose-a-private-strong-password
# BMU_DATA_DIR=an-absolute-private-directory
```

Email and MongoDB require their own environment configuration. See [email setup](05-documentation/password-reset-setup.md). Use a separate MongoDB database for this new application. Never commit `.env` or runtime data.

## Check and export

```sh
npm test
npm run sync:designs
```

`npm start` also refreshes the design previews. Open `01-designs/html/index.html` directly to inspect the static design. Use the Express server for functional accounts, menus and checkout.

[Source repository](https://github.com/Tapesh001/Campus-EATS) · [API architecture](05-documentation/architecture.md)
