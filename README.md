# Facebook ads calculator

Three beginner-friendly Facebook ads calculators built with plain HTML, CSS, and JavaScript.

## Open it

Open `index.html` in a modern web browser. The bundled UI is included, so opening the calculator needs no package installation, build step, server, or account.

All estimates run in the browser. Your entered numbers stay in the page and are cleared if it is reloaded. When you choose a non-USD currency, the page may request a daily reference exchange rate using only the currency code; no calculator inputs are sent. The calculator still works without an internet connection.

## Use it

- Choose the one-step lead-to-contact funnel, the two-step appointment funnel, or the e-commerce products calculator.
- For a lead funnel, enter a daily budget and average sale amount, then add ad and follow-up rates. For e-commerce, enter your budget, average order amount, cost to make and deliver an order, store link click rate, and click-to-order rate.
- USD is selected by default. You can choose another currency; changing it relabels amounts and does not convert them.
- Open **Examples and starting points**, then **Find published averages**, to choose a business type and see benchmark suggestions. Suggestions appear beside matching inputs while both guides are open. Apply one value at a time or use **Use available suggestions** to fill blank matching fields. For lead funnels, the published benchmark set is U.S.-based; e-commerce comparisons use broad paid-ad category data.
- Example amounts in empty money fields follow the selected currency. They are hints only. If online, benchmark money values and these hints use a daily public reference exchange rate; your existing entries never change when the currency changes.
- **View full breakdown**, beside the Forecast heading, opens the stage-by-stage estimate and cost details.
- **Your campaign numbers** sits above three separate cards with aligned rows and equal desktop heights (stacked on mobile): budget, ad performance, and conversion rates. Choose 30 days or 365 days to update the estimate.
- Use **Try the example (USD)** to load a practice scenario. The lead funnels use a $50 daily budget and $550 average sale value. The e-commerce calculator uses $50 daily ad spend, an $80 average order, and $30 in costs per order. Ad and purchase rates are placeholders for learning, not benchmarks or promises.
- Use **Use example rates** to fill blank percentage and CPM inputs while keeping values already entered.
- Select the question mark beside a term to read its explanation. On desktop, explanations also appear on hover.

The one-step estimate counts leads you successfully reach before estimating sales. The two-step estimate counts booked appointments and the people who attend. The e-commerce estimate goes from ad displays to store link clicks to completed orders. It shows revenue, ad and order costs, the estimated gain or loss after those costs, and the orders needed to cover ad spend. Sales and orders are rounded to whole purchases. The e-commerce gain or loss excludes refunds, taxes, and fixed business costs; it is not final profit.

## Files

- `index.html` — semantic page structure
- `styles.css` — responsive layout and visual styles
- `app.js` — calculator inputs, explanations, currency examples, suggestions, and forecast formulas
- `interactions.js` — viewport-aware help positioning and motion
- `src/currency-select.jsx` — accessible Radix currency and starting-point menus
- `currency-select.js` — bundled menu UI used by the page
- `benchmarks.js` — benchmark values and source information used by optional starter suggestions

## Editing the menu UI

The calculator uses a small React/Radix Select bundle for its dropdowns; calculator formulas remain in `app.js`. Native selects remain available if the bundle cannot load.

After changing `src/currency-select.jsx`, run `npm ci` and `npm run build:ui`. Include the generated `currency-select.js` and its license file with the static website. Run `npm test` for interaction, keyboard, positioning, and currency synchronization checks.

The footer credits **AIRDOKAN** and links to `https://airdokan.com`.

## Contributing

Bug reports and pull requests are welcome. For development, use Node.js 22 or newer:

```sh
npm ci
npm run build:ui
npm test
```

Include the regenerated UI bundle when changing the menu source. Describe the change and how you checked it in your pull request.

## License

The project code is available under the [MIT License](LICENSE). Bundled dependencies retain their own licenses; see `currency-select.js.LEGAL.txt`. Published benchmark sources remain credited in the calculator; the project license does not grant rights to third-party source material or branding.

## Hosting on Cloudflare Pages

Use the Free plan with the provided `pages.dev` address. The site needs no Functions, database, or environment secrets.

For a Git-connected Pages project, select `main`, set the build command to `npm run build`, and set the output directory to `dist`. Choose no framework preset. The build copies only the public website files into `dist`.

For a direct upload, run `npm ci` and `npm run build`, then upload the `dist` directory to Pages. Direct Upload projects and Git-connected projects use different deployment workflows; choose Git integration when you want automatic deployment after pushes.
