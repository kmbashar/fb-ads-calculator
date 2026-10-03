"use strict";

const CURRENCY_SYMBOLS = {
  BDT: "৳",
  USD: "$",
  AUD: "A$",
  CAD: "C$",
  GBP: "£",
  EUR: "€",
  INR: "₹",
};

const BENCHMARKS = window.CALCULATOR_BENCHMARKS;
const PLACEHOLDER_AMOUNTS_USD = {
  dailyBudget: 50,
  averageSaleValue: 550,
  averageOrderValue: 73.36,
  orderCost: 30,
  cpm: 20,
};
const APPROXIMATE_OFFLINE_EXAMPLE_RATES = {
  USD: 1,
  BDT: 120,
  AUD: 1.5,
  CAD: 1.4,
  GBP: 0.8,
  EUR: 0.9,
  INR: 83,
};

const MODES = ["one", "two", "commerce"];

const EXAMPLE_VALUES = {
  one: {
    dailyBudget: 50,
    averageSaleValue: 550,
    cpm: 20,
    ctr: 1.5,
    signupRate: 10,
    contactRate: 50,
    purchaseRate: 25,
  },
  two: {
    dailyBudget: 50,
    averageSaleValue: 550,
    cpm: 20,
    ctr: 1.5,
    signupRate: 10,
    bookingRate: 30,
    showRate: 70,
    purchaseRate: 25,
  },
  commerce: {
    dailyBudget: 50,
    averageOrderValue: 80,
    orderCost: 30,
    cpm: 20,
    storeClickRate: 1.5,
    storePurchaseRate: 2,
  },
};

const RATE_FIELDS = {
  one: ["cpm", "ctr", "signupRate", "contactRate", "purchaseRate"],
  two: ["cpm", "ctr", "signupRate", "bookingRate", "showRate", "purchaseRate"],
  commerce: ["cpm", "storeClickRate", "storePurchaseRate"],
};

const EXAMPLE_HINTS = {
  one: "The optional USD example uses $50 per day and a $550 average sale, midway between $400 and $700. Its ad rates are just for practice. Adjust the sale amount to match the service your ad promotes.",
  two: "The optional USD example uses $50 per day and a $550 average sale, midway between $400 and $700. Its ad rates are just for practice. Adjust the sale amount to match the service your ad promotes.",
  commerce: "The optional USD product example uses $50 per day, $80 per order, and $30 to make and deliver each order. Its ad and purchase rates are practice assumptions, not typical results.",
};

const JOURNEY_STEPS = {
  one: ["Ad displayed", "Ad clicked", "Details shared", "Lead contacted", "Purchase made"],
  two: ["Ad displayed", "Ad clicked", "Details shared", "Appointment booked", "Appointment attended", "Purchase made"],
  commerce: ["Ad displayed", "Store link clicked", "Order placed"],
};

const FIELD_GROUPS = {
  one: [
    {
      title: "Your budget and offer",
      description: "Start with what you plan to spend and what one sale is worth.",
      fields: ["dailyBudget", "averageSaleValue"],
    },
    {
      title: "Your ads",
      description: "Estimate how often your ad is shown and clicked.",
      fields: ["cpm", "ctr"],
    },
    {
      title: "From interest to a sale",
      description: "Estimate signups, people you reach, and the people who buy.",
      fields: ["signupRate", "contactRate", "purchaseRate"],
    },
  ],
  two: [
    {
      title: "Your budget and offer",
      description: "Start with what you plan to spend and what one sale is worth.",
      fields: ["dailyBudget", "averageSaleValue"],
    },
    {
      title: "Your ads",
      description: "Estimate how often your ad is shown and clicked.",
      fields: ["cpm", "ctr"],
    },
    {
      title: "From interest to a sale",
      description: "Estimate signups, appointments, and the people who buy.",
      fields: ["signupRate", "bookingRate", "showRate", "purchaseRate"],
    },
  ],
  commerce: [
    {
      title: "Your budget and orders",
      description: "Start with your ad budget and how much an order brings in and costs you.",
      fields: ["dailyBudget", "averageOrderValue", "orderCost"],
    },
    {
      title: "Your ads",
      description: "Estimate how many people see your ad and click through to your store.",
      fields: ["cpm", "storeClickRate"],
    },
    {
      title: "From store clicks to orders",
      description: "Estimate the share of store clicks that become completed orders.",
      fields: ["storePurchaseRate"],
    },
  ],
};

const COMPACT_FIELD_LABELS = {
  dailyBudget: "Daily budget",
  averageSaleValue: "Average sale",
  averageOrderValue: "Average order",
  orderCost: "Cost per order",
  cpm: "CPM",
  ctr: "Ad click rate",
  storeClickRate: "Store click rate",
  signupRate: "Lead signup rate",
  contactRate: "Contact rate",
  bookingRate: "Booking rate",
  showRate: "Attendance rate",
  purchaseRate: "Close rate",
  storePurchaseRate: "Order rate",
};

const FIELDS = {
  dailyBudget: {
    label: "Daily advertising budget",
    unit: "money",
    prefix: true,
    placeholder: "e.g. 20",
    helpTitle: "Daily advertising budget",
    help: "How much you plan to spend on ads each day. A budget of 10 per day becomes 300 over a 30-day forecast.",
    description: "Enter the amount you plan to spend each day.",
  },
  averageSaleValue: {
    label: "Average sale or job amount",
    unit: "money",
    prefix: true,
    placeholder: "e.g. 500",
    helpTitle: "Average amount per sale or job",
    help: "About how much a customer pays for one sale or completed job. The practice example uses $550, midway between $400 and $700. If your ad promotes different types of work, use an average that fits the jobs you expect. This is revenue per job, not profit.",
    description: "Use the average invoice for the type of work your ad promotes.",
  },
  averageOrderValue: {
    label: "Average amount per order (AOV)",
    unit: "money",
    prefix: true,
    placeholder: "e.g. 80",
    helpTitle: "AOV: average amount per order",
    help: "How much you receive for a typical order after discounts and before costs, excluding sales tax. If most orders contain one item, use its selling price. If customers pay you a delivery fee, include that fee here and include your delivery expense in the cost per order.",
    description: "Use your usual order total after discounts, before costs.",
  },
  orderCost: {
    label: "Product and delivery cost per order",
    unit: "money",
    prefix: true,
    placeholder: "e.g. 30",
    helpTitle: "Cost to make and deliver one order",
    help: "Add what you pay for the products in one order, packaging, shipping, and payment processing. Leave advertising cost out; the calculator adds ad spend separately. Use your best estimate if you are just starting out.",
    description: "Include product, packing, shipping, and payment fees.",
  },
  cpm: {
    label: "Cost per 1,000 ad displays (CPM)",
    unit: "money",
    prefix: true,
    placeholder: "e.g. 10",
    helpTitle: "CPM: cost per 1,000 ad displays",
    help: "CPM tells you how much it costs to show your ad 1,000 times. A CPM of 10 means each 1,000 displays costs 10 in your chosen currency.",
    description: "If you do not know this yet, use example rates to explore.",
    validate(value) {
      if (value === null) return "Enter a CPM greater than zero.";
      if (value <= 0) return "Enter a CPM greater than zero.";
      return "";
    },
  },
  ctr: {
    label: "Ad click rate (CTR)",
    unit: "percent",
    placeholder: "e.g. 1",
    helpTitle: "CTR: ad click rate",
    help: "The percentage of ad displays that result in someone clicking through to the next step. At 1%, 1,000 displays produce about 10 clicks. Count clicks to your page, not reactions or likes.",
    description: "Enter a percentage, like 1 for 1%.",
    validate: validatePercentage,
  },
  storeClickRate: {
    label: "Store link click rate (CTR)",
    unit: "percent",
    placeholder: "e.g. 1.5",
    helpTitle: "CTR: clicks from your ad to your store",
    help: "Of all times your ad is shown, the percentage that lead to a click on your store or product link. At 1%, 1,000 ad displays lead to about 10 store clicks. Do not count reactions or likes.",
    description: "Out of 100 ad displays, how many clicks go to your store?",
    validate: validatePercentage,
  },
  storePurchaseRate: {
    label: "Store clicks that become orders",
    unit: "percent",
    placeholder: "e.g. 2",
    helpTitle: "Purchase rate from store clicks",
    help: "Of the clicks from your ad to your store, the percentage that become completed orders. If 2 of 100 store clicks lead to an order, enter 2. This is a click-to-order estimate; a person can click more than once, and not every click loads a page.",
    description: "Out of 100 store clicks, how many lead to a purchase?",
    validate: validatePercentage,
  },
  signupRate: {
    label: "Contact-detail signup rate",
    unit: "percent",
    placeholder: "e.g. 20",
    helpTitle: "Contact-detail signup rate",
    help: "Of the people who click your ad, the percentage who leave contact details such as a name, email, or phone number. At 20%, 100 clicks produce about 20 leads.",
    description: "Out of every 100 ad clicks, how many people leave their details?",
    validate: validatePercentage,
  },
  contactRate: {
    label: "Leads you reach (contact rate)",
    unit: "percent",
    placeholder: "e.g. 50",
    helpTitle: "Contact rate: leads you reach",
    help: "Of the people who leave their details, the percentage you successfully speak with. For example, if you reach 50 out of every 100 leads, your contact rate is 50%.",
    description: "Out of 10 leads, about how many can you speak with?",
    validate: validatePercentage,
  },
  bookingRate: {
    label: "Appointment booking rate",
    unit: "percent",
    placeholder: "e.g. 50",
    helpTitle: "Appointment booking rate",
    help: "Of the people who leave their details, the percentage who book an appointment. At 50%, 100 leads produce about 50 bookings.",
    description: "Out of every 100 leads, how many book an appointment?",
    validate: validatePercentage,
  },
  showRate: {
    label: "Appointment attendance rate (show rate)",
    unit: "percent",
    placeholder: "e.g. 55",
    helpTitle: "Show rate: appointment attendance",
    help: "Of the people who book, the percentage who attend. At 55%, 100 bookings produce about 55 attendees.",
    description: "Out of every 100 bookings, how many people show up?",
    validate: validatePercentage,
  },
  purchaseRate: {
    label: "People you reach who buy (close rate)",
    unit: "percent",
    placeholder: "e.g. 30",
    helpTitle: "Close rate: people who become customers",
    help: "Of the people you speak with or meet, the percentage who make a purchase. For example, if 25 out of every 100 become customers, the close rate is 25%.",
    description: "Out of 10 people you speak with or meet, how many buy?",
    validate: validatePercentage,
  },
};

const STAGE_HELP = {
  impressions: {
    title: "Impressions: times your ad is shown",
    copy: "Each time your ad appears on someone's screen counts as one impression. One person can see the ad more than once, so impressions are not a count of different people.",
  },
  clicks: {
    title: "Ad clicks",
    copy: "The estimated number of times someone clicks through from your ad to the next step, such as your signup page. The same person may click more than once.",
  },
  leads: {
    title: "Leads: people who leave their details",
    copy: "People who share contact details, such as a name, email, or phone number, so you can follow up. A lead has not necessarily bought anything.",
  },
  bookings: {
    title: "Appointments booked",
    copy: "Estimated appointments booked by your leads. Some people who book may not attend.",
  },
  contact: {
    title: "Leads contacted",
    copy: "Estimated number of leads you successfully speak with, based on the contact rate you entered.",
  },
  appointmentAttendance: {
    title: "Appointment attendees",
    copy: "Estimated number of booked appointments people attend, based on the appointment attendance rate you entered.",
  },
  sales: {
    title: "Estimated sales",
    copy: "Estimated purchases based on the leads you speak with or the appointment attendees you meet, depending on the funnel. Fractional expected purchases are rounded to a whole number for this estimate.",
  },
};

const COST_HELP = {
  spend: {
    title: "Total advertising cost",
    copy: "Your daily advertising budget multiplied by the number of days in this forecast.",
  },
  click: {
    title: "Advertising cost per click",
    copy: "Total advertising cost divided by the estimated number of clicks. If no clicks are estimated, there is no cost per click to show.",
  },
  lead: {
    title: "Advertising cost per lead",
    copy: "Total advertising cost divided by the estimated number of people who leave their contact details.",
  },
  booking: {
    title: "Advertising cost per booking",
    copy: "Total advertising cost divided by the estimated number of appointments booked.",
  },
  attendee: {
    title: "Advertising cost per attendee",
    copy: "Total advertising cost divided by the estimated number of booked appointments people attend.",
  },
  contacted: {
    title: "Advertising cost per contacted lead",
    copy: "Total advertising cost divided by the estimated number of leads you successfully speak with.",
  },
  sale: {
    title: "Advertising cost per sale",
    copy: "Total advertising cost divided by rounded estimated sales for this forecast period.",
  },
};

const COMMERCE_HELP = {
  storeClicks: {
    title: "Clicks to your store",
    copy: "Estimated clicks on the store or product link in your ad. The same person may click more than once, and a click does not guarantee that your store page loaded.",
  },
  orders: {
    title: "Estimated completed orders",
    copy: "Store clicks multiplied by the click-to-order rate you entered. The estimate is rounded to a whole order before revenue and costs are calculated.",
  },
  revenue: {
    title: "Estimated sales revenue",
    copy: "Estimated completed orders multiplied by your average order amount. It is the money collected before product, delivery, and advertising costs.",
  },
  orderCosts: {
    title: "Product and delivery costs",
    copy: "Estimated completed orders multiplied by the cost to make and deliver one order. Advertising cost is calculated separately.",
  },
  balance: {
    title: "Estimated gain or loss",
    copy: "Sales revenue minus product and delivery costs, then minus advertising cost. This is before refunds, taxes, rent, salaries, and other fixed business costs, so it is not final profit.",
  },
  adCostPerClick: {
    title: "Advertising cost per store click",
    copy: "Total advertising cost divided by the estimated number of clicks to your store. If no store clicks are estimated, there is no cost per click to show.",
  },
  adCostPerOrder: {
    title: "Advertising cost per order",
    copy: "Total advertising cost divided by rounded estimated orders. If no orders are estimated, there is no cost per order to show.",
  },
  roas: {
    title: "Return on ad spend (ROAS)",
    copy: "Sales revenue divided by advertising cost. A result of 2× means 2 in sales revenue for each 1 spent on ads. ROAS does not subtract product or delivery costs.",
  },
  breakEvenOrders: {
    title: "Orders needed to cover these costs",
    copy: "The smallest whole number of orders whose amount left after product and delivery costs can cover this period's advertising cost. If one order costs at least as much as it brings in, there is no break-even order count in this model.",
  },
  breakEvenRoas: {
    title: "Break-even ROAS",
    copy: "The revenue per 1 spent on ads needed to cover product, delivery, and ad costs. It equals average order amount divided by the amount left per order before ads. If an order leaves no money before ads, break-even ROAS is unavailable.",
  },
  perOrderRoom: {
    title: "Amount left per order before ads",
    copy: "Average order amount minus product and delivery cost per order. This is the most you can spend on ads per order to break even on the costs included here.",
  },
};

const state = {
  mode: "one",
  period: 30,
  market: "US",
  industry: {
    one: "overall",
    two: "overall",
    commerce: "overall",
  },
  exchangeRates: {
    USD: { rate: 1, date: "", live: true },
  },
  exchangeRequests: {},
  currency: {
    one: "USD",
    two: "USD",
    commerce: "USD",
  },
  values: {
    one: makeEmptyValues("one"),
    two: makeEmptyValues("two"),
    commerce: makeEmptyValues("commerce"),
  },
  exampleFields: {
    one: new Set(),
    two: new Set(),
    commerce: new Set(),
  },
  benchmarkFields: {
    one: new Set(),
    two: new Set(),
    commerce: new Set(),
  },
  origin: {
    one: "own",
    two: "own",
    commerce: "own",
  },
  touched: {
    one: new Set(),
    two: new Set(),
    commerce: new Set(),
  },
};

let liveAnnouncementTimer = null;

function makeEmptyValues(mode) {
  return Object.fromEntries(Object.keys(EXAMPLE_VALUES[mode]).map((key) => [key, ""]));
}

function validatePercentage(value) {
  if (value === null) return "Enter a percentage from 0 to 100.";
  if (value < 0 || value > 100) return "Enter a percentage from 0 to 100.";
  return "";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderFields(mode) {
  const container = document.getElementById(`fields-${mode}`);
  const rowCount = Math.max(...FIELD_GROUPS[mode].map((group) => group.fields.length));
  container.setAttribute("style", `--field-rows: ${rowCount}`);
  const groupHtml = FIELD_GROUPS[mode]
    .map((group, index) => {
      const fields = group.fields.map((key) => renderField(mode, key)).join("");
      const titles = mode === "commerce"
        ? ["Budget & order costs", "Ad performance", "Order conversion"]
        : ["Budget & offer", "Ad performance", mode === "two" ? "Appointment conversion" : "Lead conversion"];
      return `
        <section class="field-group" aria-label="${escapeHtml(group.title)}">
          <div class="field-group-header">
            <div>
              <h4 class="field-group-heading">${escapeHtml(titles[index])}</h4>
              <p class="field-group-description visually-hidden">${escapeHtml(group.description)}</p>
            </div>
          </div>
          <div class="field-list">${fields}</div>
        </section>`;
    })
    .join("");

  container.innerHTML = groupHtml;
  bindHelp(container);
}

function renderField(mode, key) {
  const field = { ...FIELDS[key] };
  if (key === "purchaseRate") {
    if (mode === "one") {
      field.label = "People you reach who buy (close rate)";
      field.helpTitle = "Close rate: people you reach who buy";
      field.help = "Of the leads you successfully speak with, the percentage who become paying customers. For example, if you reach 10 leads and 2 buy, your close rate is 20%.";
      field.description = "Out of 10 people you speak with, how many become customers?";
    } else {
      field.label = "Appointment attendees who buy (close rate)";
      field.helpTitle = "Close rate: appointment attendees who buy";
      field.help = "Of the people who attend an appointment, the percentage who become paying customers. For example, if 10 people attend and 2 buy, your close rate is 20%.";
      field.description = "Out of 10 people who attend, how many become customers?";
    }
  }
  const id = `${mode}-${key}`;
  const tipId = `${id}-help`;
  const errorId = `${id}-error`;
  const unit = field.unit === "percent" ? "percent" : "amount";
  const min = key === "cpm" ? "0.01" : "0";
  const prefix = field.prefix
    ? `<span class="input-prefix currency-prefix" aria-hidden="true">${CURRENCY_SYMBOLS[state.currency[mode]]}</span>`
    : "";
  const suffix = field.unit === "percent" ? '<span class="input-suffix" aria-hidden="true">%</span>' : "";
  const placeholder = field.unit === "money" ? placeholderAmount(mode, key) : field.placeholder;


  return `
    <div class="field-card" data-field-card="${key}">
      <div class="field-label-row">
        <label class="field-label" for="${id}">${escapeHtml(COMPACT_FIELD_LABELS[key] ?? field.label)}</label>
          <div class="field-actions">
          <div class="help-wrap">
            <button
              class="help-trigger"
              type="button"
              aria-label="Explain ${escapeHtml(field.helpTitle)}"
              aria-expanded="false"
              aria-controls="${tipId}"
            >?</button>
            <div class="tooltip" id="${tipId}" role="dialog" aria-modal="false" aria-labelledby="${tipId}-title" hidden>
              <div class="tooltip-heading" id="${tipId}-title">
                <span>${escapeHtml(field.helpTitle)}</span>
                <button class="tooltip-close" type="button" aria-label="Close explanation">×</button>
              </div>
              <span class="tooltip-copy">${escapeHtml(field.help)}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="field-input-row">
        ${prefix}
        <input
          class="field-input"
          id="${id}"
          name="${key}"
          aria-label="${escapeHtml(`${COMPACT_FIELD_LABELS[key] ?? field.label}: ${field.label}`)}"
          type="number"
          inputmode="decimal"
          autocomplete="off"
          min="${min}"
          ${field.unit === "percent" ? 'max="100"' : ""}
          step="any"
          placeholder="${placeholder}"
          aria-describedby="${id}-description ${errorId} ${tipId} ${id}-suggestion"
          aria-invalid="false"
          data-input-key="${key}"
          data-unit="${unit}"
        />
        ${suffix}
      </div>
      <span class="assumption-badge" data-assumption-for="${key}" hidden></span>
      <p class="field-description visually-hidden" id="${id}-description">${escapeHtml(field.description)}</p>
      <div class="field-suggestion" id="${id}-suggestion" data-suggestion-for="${key}" hidden>
        <p class="field-suggestion-copy" data-suggestion-copy="${key}"></p>
        <button class="text-button suggestion-use-button" type="button" data-action="use-suggestion" data-suggestion-field="${key}">Use this value</button>
      </div>
      <p class="field-error" id="${errorId}" hidden></p>
    </div>`;
}

function bindHelp(root) {
  if (window.AdMathInteractions) {
    root.querySelectorAll(".help-wrap").forEach(window.AdMathInteractions.bindTooltip);
    return;
  }
  root.querySelectorAll(".help-wrap").forEach((wrapper) => {
    const trigger = wrapper.querySelector(".help-trigger");
    const tooltip = wrapper.querySelector(".tooltip");
    const close = wrapper.querySelector(".tooltip-close");

    const closePopover = (returnFocus = false) => {
      trigger.setAttribute("aria-expanded", "false");
      tooltip.hidden = true;
      wrapper.dataset.pinned = "false";
      if (returnFocus) trigger.focus();
    };

    const openPopover = (pin = false) => {
      tooltip.hidden = false;
      trigger.setAttribute("aria-expanded", "true");
      if (pin) wrapper.dataset.pinned = "true";
    };

    wrapper.dataset.pinned = "false";
    trigger.addEventListener("pointerenter", () => {
      if (window.matchMedia("(hover: hover)").matches) openPopover(false);
    });
    wrapper.addEventListener("pointerleave", () => {
      if (
        window.matchMedia("(hover: hover)").matches &&
        wrapper.dataset.pinned !== "true" &&
        !wrapper.contains(document.activeElement)
      ) {
        closePopover();
      }
    });
    wrapper.addEventListener("focusin", () => openPopover(false));
    wrapper.addEventListener("focusout", (event) => {
      if (!wrapper.contains(event.relatedTarget) && wrapper.dataset.pinned !== "true") {
        window.setTimeout(() => {
          if (!wrapper.contains(document.activeElement) && wrapper.dataset.pinned !== "true") {
            closePopover();
          }
        }, 0);
      }
    });
    trigger.addEventListener("click", () => {
      if (wrapper.dataset.pinned === "true") {
        closePopover();
      } else {
        openPopover(true);
      }
    });
    close.addEventListener("click", () => closePopover(true));
    wrapper.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !tooltip.hidden) {
        event.stopPropagation();
        closePopover(true);
      }
    });
  });
}

function closeAllHelp() {
  document.querySelectorAll(".help-trigger[aria-expanded='true']").forEach((trigger) => {
    const wrapper = trigger.closest(".help-wrap");
    if (wrapper._closeHelp) {
      wrapper._closeHelp();
      return;
    }
    trigger.setAttribute("aria-expanded", "false");
    wrapper.querySelector(".tooltip").hidden = true;
    wrapper.dataset.pinned = "false";
  });
}

function setFieldError(mode, key, message, show) {
  const card = document.querySelector(`#panel-${mode} [data-field-card="${key}"]`);
  if (!card) return;
  const input = card.querySelector("input[data-input-key]");
  const error = card.querySelector(".field-error");
  const visible = show && Boolean(message);

  card.classList.toggle("is-invalid", visible);
  input.setAttribute("aria-invalid", String(visible));
  error.textContent = visible ? message : "";
  error.hidden = !visible;
}

function setMode(mode, focusForm = false) {
  closeAllHelp();
  state.mode = mode;
  for (const candidate of MODES) {
    document.getElementById(`panel-${candidate}`).hidden = mode !== candidate;
    document.getElementById(`form-${candidate}`).setAttribute("aria-hidden", String(mode !== candidate));
  }
  document.querySelectorAll('input[name="funnel-mode"]').forEach((input) => {
    input.checked = input.value === mode;
  });
  syncCurrency(false);
  renderJourney(mode);
  updateStarterGuide(mode);
  updateExampleHint(mode);
  updateExampleNotice();
  updateForm(mode);
  updateExampleButtonLabel(mode);
  renderResults();
  window.AdMathInteractions?.revealPanel(document.getElementById(`panel-${mode}`));
  if (focusForm) {
    document.querySelector(`#panel-${mode} .form-panel input`)?.focus();
  }
}

function renderJourney(mode) {
  const steps = JOURNEY_STEPS[mode];
  document.getElementById("journey").innerHTML = steps
    .map((step, index) => `
      <li><span class="journey-index" aria-hidden="true">${index + 1}</span><span>${escapeHtml(step)}</span></li>`)
    .join("");
  document.getElementById("journey").setAttribute("aria-label", `Selected journey: ${steps.join(", then ")}`);
}

function getIndustryOptions(mode) {
  const categories = mode === "commerce"
    ? BENCHMARKS.ecommerce
    : BENCHMARKS.leadSource.categories;
  return Object.entries(categories).map(([key, entry]) => ({ key, label: entry.label }));
}

function getIndustryEntry(mode) {
  const categories = mode === "commerce"
    ? BENCHMARKS.ecommerce
    : BENCHMARKS.leadSource.categories;
  return categories[state.industry[mode]] ?? categories.overall;
}

function getSuggestionEntries(mode) {
  if (mode === "commerce") {
    const entry = getIndustryEntry(mode);
    const rateSourceKey = entry.rateSource ?? (entry.source === "meta" ? "meta" : "meta");
    const hasMetaCategoryRates = rateSourceKey === "meta";
    const rateSource = BENCHMARKS.ecommerceSources[rateSourceKey];
    const amountSource = entry.source === "meta" ? BENCHMARKS.ecommerceSources.meta : BENCHMARKS.ecommerceSources.commerce;
    return [
      { key: "cpm", value: entry.cpm, unit: "money", category: entry.label, source: amountSource, context: "Median CPM for the selected ecommerce group." },
      { key: "averageOrderValue", value: entry.averageOrderValue, unit: "money", category: entry.label, source: amountSource, context: "Median order value for the selected ecommerce group." },
      { key: "storeClickRate", value: entry.ctr, unit: "percent", category: entry.label, source: rateSource, context: hasMetaCategoryRates ? "Median Meta ad click-through rate for the selected group." : "Median ecommerce ad click-through rate for the selected group." },
      { key: "storePurchaseRate", value: entry.storePurchaseRate, unit: "percent", category: entry.label, source: rateSource, context: hasMetaCategoryRates ? "Median share of ad clickers who became customers in the selected group." : "Median ecommerce ad conversion rate for the selected group; the source measures store visits, while this simple forecast treats ad clicks as visits." },
    ];
  }

  if (state.market !== "US") return [];
  const entry = getIndustryEntry(mode);
  return [
    { key: "ctr", value: entry.ctr, unit: "percent", category: entry.label, source: BENCHMARKS.leadSource, context: "Median click-through rate for U.S. Meta lead campaigns in the selected business category." },
    { key: "signupRate", value: entry.signupRate, unit: "percent", category: entry.label, source: BENCHMARKS.leadSource, context: "Median conversion rate for U.S. Meta lead campaigns in the selected business category. Website forms may perform differently from in-app forms." },
  ];
}

function amountFormatter(currency, digits = 2) {
  const locale = currency === "BDT" ? "en-BD" : currency === "INR" ? "en-IN" : "en-US";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      maximumFractionDigits: digits,
      minimumFractionDigits: digits,
    });
  } catch {
    return new Intl.NumberFormat(locale, { maximumFractionDigits: digits, minimumFractionDigits: digits });
  }
}

function formatCurrencyAmount(amount, currency, digits = 2) {
  try {
    return amountFormatter(currency, digits).format(amount);
  } catch {
    return `${CURRENCY_SYMBOLS[currency] ?? currency} ${amount.toFixed(digits)}`;
  }
}

function formatPlaceholderAmount(amount, currency) {
  const ratio = Math.abs(amount);
  if (!Number.isFinite(ratio) || ratio === 0) return "0";
  const magnitude = 10 ** Math.floor(Math.log10(ratio));
  const step = magnitude >= 100 ? magnitude / 10 : magnitude >= 10 ? 1 : 0.1;
  const rounded = Math.round(amount / step) * step;
  const digits = currency === "BDT" || currency === "INR" ? 0 : 2;
  const locale = currency === "BDT" ? "en-BD" : currency === "INR" ? "en-IN" : "en-US";
  return new Intl.NumberFormat(locale, { maximumFractionDigits: digits, minimumFractionDigits: 0 }).format(rounded);
}

function liveExchangeRate(currency) {
  return state.exchangeRates[currency] ?? null;
}

function placeholderAmount(mode, key) {
  const suggestion = getSuggestionEntries(mode).find((entry) => entry.key === key && entry.unit === "money");
  const baseAmount = suggestion?.value ?? PLACEHOLDER_AMOUNTS_USD[key];
  const currency = state.currency[mode];
  const rate = liveExchangeRate(currency);
  const displayRate = currency === "USD" ? 1 : rate?.live ? rate.rate : APPROXIMATE_OFFLINE_EXAMPLE_RATES[currency] ?? 1;
  return `e.g. ${formatPlaceholderAmount(baseAmount * displayRate, currency)}`;
}

function updateCurrencyPlaceholders() {
  for (const mode of MODES) {
    document.querySelectorAll(`#panel-${mode} [data-input-key]`).forEach((input) => {
      if (FIELDS[input.dataset.inputKey].unit === "money") {
        input.placeholder = placeholderAmount(mode, input.dataset.inputKey);
      }
    });
  }
}

function renderSuggestionCopy(entry, mode, canApply, rateInfo) {
  const currency = state.currency[mode];
  const monetary = entry.unit === "money";
  const convertedValue = monetary && currency !== "USD" && rateInfo?.live
    ? entry.value * rateInfo.rate
    : entry.value;
  const canConvert = currency === "USD" || rateInfo?.live;
  const valueCurrency = monetary && !canConvert ? "USD" : currency;
  const valueText = monetary
    ? formatCurrencyAmount(convertedValue, valueCurrency, 2)
    : `${numberFormat(entry.value, 2)}%`;
  const sourcePeriod = entry.source.period ? `, ${entry.source.period}` : "";
  const message = monetary && currency !== "USD" && !rateInfo?.live
    ? state.exchangeRequests[currency]
      ? " Getting the current exchange rate for this suggestion."
      : ` USD amount; select USD or connect to the internet to convert this suggestion.`
    : "";

  return `<strong>Starting point: ${escapeHtml(valueText)}</strong> ${escapeHtml(entry.context)} <a href="${escapeHtml(entry.source.url)}" target="_blank" rel="noopener noreferrer">Source: ${escapeHtml(entry.source.name)}${escapeHtml(sourcePeriod)}</a>.${escapeHtml(message)}`;
}

function updateSuggestionCards(mode) {
  const entries = getSuggestionEntries(mode);
  const currency = state.currency[mode];
  const rateInfo = liveExchangeRate(currency);
  const revealSuggestions = document.querySelector(".input-help")?.open && document.getElementById("starter-guide")?.open;
  document.querySelectorAll(`#panel-${mode} [data-suggestion-for]`).forEach((card) => {
    const key = card.dataset.suggestionFor;
    const entry = entries.find((candidate) => candidate.key === key);
    const copy = card.querySelector("[data-suggestion-copy]");
    const button = card.querySelector("[data-suggestion-field]");
    if (!entry || !revealSuggestions) {
      card.hidden = true;
      return;
    }

    const moneyNeedsRate = entry.unit === "money" && currency !== "USD" && !rateInfo?.live;
    const ratePending = moneyNeedsRate && Boolean(state.exchangeRequests[currency]);
    card.hidden = false;
    copy.innerHTML = renderSuggestionCopy(entry, mode, !moneyNeedsRate, rateInfo);
    button.disabled = moneyNeedsRate;
    button.textContent = ratePending ? "Getting exchange rate…" : moneyNeedsRate ? "Conversion unavailable" : "Use this value";
    const accessibleValue = entry.unit === "money"
      ? formatCurrencyAmount(entry.value * (currency === "USD" ? 1 : rateInfo?.rate ?? 1), currency !== "USD" && !rateInfo?.live ? "USD" : currency, 2)
      : `${entry.value}%`;
    button.setAttribute("aria-label", `Use ${accessibleValue} as the ${FIELDS[key]?.label ?? key} starting point`);
  });
}

function updateStarterGuide(mode) {
  const industrySelect = document.getElementById("starter-industry");
  const marketWrap = document.getElementById("starter-market-wrap");
  const industryLabel = document.getElementById("starter-industry-label");
  const sourceNote = document.getElementById("starter-source-note");
  const isCommerce = mode === "commerce";
  const options = getIndustryOptions(mode);
  industrySelect.innerHTML = options
    .map((option) => `<option value="${escapeHtml(option.key)}">${escapeHtml(option.label)}</option>`)
    .join("");
  industrySelect.value = state.industry[mode];
  industryLabel.textContent = isCommerce ? "Product category" : "Business type";
  marketWrap.hidden = isCommerce;
  document.getElementById("starter-market").value = state.market;

  if (isCommerce) {
    const metaSource = BENCHMARKS.ecommerceSources.meta;
    const commerceSource = BENCHMARKS.ecommerceSources.commerce;
    sourceNote.innerHTML = `Product categories use paid-ad benchmarks from ${escapeHtml(commerceSource.period)} for CPM and order value, plus Meta-specific click and purchase benchmarks for matching categories. The comparison groups are broad; they are not a promise for your product or location. <a href="${escapeHtml(commerceSource.url)}" target="_blank" rel="noopener noreferrer">Ecommerce source</a> · <a href="${escapeHtml(metaSource.url)}" target="_blank" rel="noopener noreferrer">Meta source</a>.`;
  } else if (state.market === "US") {
    sourceNote.innerHTML = `${escapeHtml(BENCHMARKS.leadSource.note)} Follow-up, booking, attendance, closing rates, daily budget, and CPM still depend on your business. <a href="${escapeHtml(BENCHMARKS.leadSource.url)}" target="_blank" rel="noopener noreferrer">Read the 2026 report</a>.`;
  } else {
    sourceNote.textContent = "The published lead-campaign figures in this starter guide are U.S.-based. There is no matching local rate set here, so use your own results or the practice rates for a first estimate.";
  }

  updateSuggestionCards(mode);
  updateCurrencyPlaceholders();
  const applyButton = document.querySelector('[data-action="apply-benchmarks"]');
  applyButton.disabled = getSuggestionEntries(mode).length === 0;
  updateCurrencyReferenceNote();
}

function updateCurrencyReferenceNote() {
  const note = document.getElementById("currency-rate-note");
  if (!note) return;
  const currency = state.currency[state.mode];
  const currencyHelp = document.getElementById("currency-help");
  if (currency === "USD") {
    currencyHelp.textContent = "Amounts you enter stay as written. Example and benchmark amounts use USD.";
    note.innerHTML = "Dollar benchmark amounts are shown in USD. The example numbers in the input boxes are hints; they do not fill an input.";
    return;
  }
  const rateInfo = liveExchangeRate(currency);
  if (rateInfo?.live) {
    currencyHelp.textContent = `Amounts you enter stay as written. Examples and dollar benchmarks use ${currency} at the ${rateInfo.date} reference rate.`;
    note.innerHTML = `Dollar benchmarks and example amounts use a public reference rate dated ${escapeHtml(rateInfo.date)}. Existing entries are never converted. <a href="https://frankfurter.dev/" target="_blank" rel="noopener noreferrer">About the exchange-rate source</a>.`;
  } else if (state.exchangeRequests[currency]) {
    currencyHelp.textContent = `Amounts you enter stay as written. Getting a reference rate for ${currency} examples and benchmark amounts.`;
    note.textContent = "Getting the latest reference rate for example and benchmark amounts. Your entered values will stay unchanged.";
  } else {
    currencyHelp.textContent = `Amounts you enter stay as written. ${currency} hints are approximate offline examples; USD money suggestions need an exchange rate.`;
    note.innerHTML = `A current reference rate is unavailable. Input hints use approximate offline examples; USD money suggestions cannot be applied until a rate is available. <a href="https://frankfurter.dev/" target="_blank" rel="noopener noreferrer">About the exchange-rate source</a>.`;
  }
}

async function refreshExchangeRate(currency) {
  if (currency === "USD" || liveExchangeRate(currency)?.live) return;
  if (state.exchangeRequests[currency]) return state.exchangeRequests[currency];

  state.exchangeRequests[currency] = fetch(`https://api.frankfurter.dev/v2/rate/usd/${currency.toLowerCase()}`)
    .then((response) => {
      if (!response.ok) throw new Error("Exchange rate request failed.");
      return response.json();
    })
    .then((data) => {
      if (!Number.isFinite(data.rate) || !data.date) throw new Error("Exchange rate was incomplete.");
      state.exchangeRates[currency] = { rate: data.rate, date: data.date, live: true };
    })
    .catch(() => {
      state.exchangeRates[currency] = { rate: null, date: "", live: false };
    })
    .finally(() => {
      delete state.exchangeRequests[currency];
      updateCurrencyPlaceholders();
      updateSuggestionCards(state.mode);
      updateCurrencyReferenceNote();
    });
  updateCurrencyReferenceNote();
  return state.exchangeRequests[currency];
}

function updateExampleHint(mode) {
  document.getElementById("example-hint").textContent = EXAMPLE_HINTS[mode];
}

function updateForm(mode) {
  document.querySelectorAll(`#form-${mode} [data-input-key]`).forEach((input) => {
    const key = input.dataset.inputKey;
    input.value = state.values[mode][key];
    const badge = document.querySelector(`#panel-${mode} [data-assumption-for="${key}"]`);
    const isPractice = state.exampleFields[mode].has(key);
    const isBenchmark = state.benchmarkFields[mode].has(key);
    badge.hidden = !isPractice && !isBenchmark;
    badge.textContent = isBenchmark ? "Benchmark starting point" : "Practice example";

    const field = FIELDS[key];
    const value = state.values[mode][key] === "" ? null : Number(state.values[mode][key]);
    const error = field.validate
      ? field.validate(value)
      : value !== null && value < 0
        ? "Enter zero or a positive amount."
        : "";
    setFieldError(mode, key, error, state.touched[mode].has(key));
  });
}

function readInputs(mode) {
  const keys = Object.keys(EXAMPLE_VALUES[mode]);
  const parsed = {};
  const errors = [];
  const missing = [];

  for (const key of keys) {
    const raw = state.values[mode][key];
    const value = raw === "" ? null : Number(raw);
    parsed[key] = value;

    if (value === null || !Number.isFinite(value)) {
      missing.push(key);
      setFieldError(mode, key, "", false);
      continue;
    }

    const field = FIELDS[key];
    const error = field.validate
      ? field.validate(value)
      : value < 0
        ? "Enter zero or a positive amount."
        : "";
    setFieldError(mode, key, error, true);
    if (error) errors.push({ key, message: error });
  }

  return { parsed, errors, missing };
}

function calculate(mode, days, values) {
  const spend = values.dailyBudget * days;
  const impressions = (spend / values.cpm) * 1000;
  const clicks = impressions * (values.ctr / 100);
  const leads = clicks * (values.signupRate / 100);
  let bookings = null;
  let closingOpportunities;

  if (mode === "two") {
    bookings = leads * (values.bookingRate / 100);
    closingOpportunities = bookings * (values.showRate / 100);
  } else {
    closingOpportunities = leads * (values.contactRate / 100);
  }

  const sales = Math.round(closingOpportunities * (values.purchaseRate / 100));
  const revenue = sales * values.averageSaleValue;
  const ratioCost = (count) => count > 0 ? spend / count : null;

  return {
    days,
    spend,
    impressions,
    clicks,
    leads,
    bookings,
    closingOpportunities,
    sales,
    revenue,
    costPerClick: ratioCost(clicks),
    costPerLead: ratioCost(leads),
    costPerBooking: bookings === null ? null : ratioCost(bookings),
    costPerClosingOpportunity: ratioCost(closingOpportunities),
    costPerSale: ratioCost(sales),
    roas: spend > 0 ? revenue / spend : null,
  };
}

function calculateCommerce(days, values) {
  const spend = values.dailyBudget * days;
  const impressions = (spend / values.cpm) * 1000;
  const storeClicks = impressions * (values.storeClickRate / 100);
  const rawOrders = storeClicks * (values.storePurchaseRate / 100);
  const orders = Math.round(rawOrders);
  const revenue = orders * values.averageOrderValue;
  const orderCosts = orders * values.orderCost;
  const balance = revenue - orderCosts - spend;
  const perOrderRoom = values.averageOrderValue - values.orderCost;

  return {
    days,
    spend,
    impressions,
    storeClicks,
    rawOrders,
    orders,
    revenue,
    orderCosts,
    balance,
    perOrderRoom,
    adCostPerClick: storeClicks > 0 ? spend / storeClicks : null,
    adCostPerOrder: orders > 0 ? spend / orders : null,
    roas: spend > 0 ? revenue / spend : null,
    breakEvenOrders: perOrderRoom > 0 ? Math.ceil(spend / perOrderRoom) : null,
    breakEvenRoas: perOrderRoom > 0 ? values.averageOrderValue / perOrderRoom : null,
  };
}

function numberFormat(value, digits = 0) {
  const currency = state.currency[state.mode];
  const locale = currency === "BDT" ? "en-BD" : currency === "INR" ? "en-IN" : "en-US";
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  }).format(value);
}

function money(value, digits = 2) {
  if (value === null || !Number.isFinite(value)) return "—";
  const currency = state.currency[state.mode];
  try {
    return new Intl.NumberFormat(currency === "BDT" ? "en-BD" : currency === "INR" ? "en-IN" : "en-US", {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      maximumFractionDigits: digits,
      minimumFractionDigits: digits,
    }).format(value);
  } catch {
    return `${CURRENCY_SYMBOLS[currency] ?? currency} ${numberFormat(value, digits)}`;
  }
}

function countLabel(value) {
  return `about ${numberFormat(value)}`;
}

function setBreakdownAvailability(available) {
  const details = document.getElementById("breakdown-details");
  const button = document.getElementById("breakdown-toggle");
  details.hidden = !available;
  button.hidden = !available;
  const open = available && details.open;
  button.setAttribute("aria-expanded", String(open));
  document.getElementById("breakdown-toggle-label").textContent = open ? "Hide full breakdown" : "View full breakdown";
}

function renderEmptyResults({ title, message, error = false }) {
  const results = document.getElementById("results-content");
  const details = document.getElementById("breakdown-details");
  if (window.AdMathInteractions) window.AdMathInteractions.resetDisclosure(details);
  else details.open = false;
  setBreakdownAvailability(false);
  window.clearTimeout(liveAnnouncementTimer);
  document.getElementById("live-summary").textContent = "";
  const labels = state.mode === "commerce"
    ? ["Estimated orders", "Sales revenue", "Estimated gain or loss", "Revenue per 1 spent on ads", "Orders needed to cover ad costs"]
    : ["Estimated sales", "Sales revenue", "Advertising cost", "Cost per sale", "Revenue per 1 spent on ads"];
  results.innerHTML = `
    <div class="metric-grid metric-grid-empty" aria-label="Forecast unavailable until the inputs are complete">
      ${labels.map((label, index) => metricCard({ id: `empty-${index}`, label, value: "—" })).join("")}
    </div>
    <div class="empty-result${error ? " empty-result-error" : ""}">
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(message)}</p>
    </div>`;
  if (error) document.getElementById("live-summary").textContent = `${title}. ${message}`;
}

function helpPopover(id, label, title, copy) {
  const tipId = `${id}-help`;
  return `
    <div class="help-wrap metric-help">
      <button class="help-trigger" type="button" aria-label="Explain ${escapeHtml(label)}" aria-expanded="false" aria-controls="${tipId}">?</button>
      <div class="tooltip" id="${tipId}" role="dialog" aria-modal="false" aria-labelledby="${tipId}-title" hidden>
        <div class="tooltip-heading" id="${tipId}-title"><span>${escapeHtml(title)}</span><button class="tooltip-close" type="button" aria-label="Close explanation">×</button></div>
        <span class="tooltip-copy">${escapeHtml(copy)}</span>
      </div>
    </div>`;
}

function metricCard({ label, value, description, primary = false, tone = null, help = null, id = "metric" }) {
  const helpHtml = help
    ? helpPopover(id, label, help.title, help.copy)
    : "";
  const explainRounding = value === "Under 1" || value === "Cannot break even";
  return `
    <article class="metric-card${primary ? " metric-card-primary" : ""}${tone === "negative" ? " metric-card-negative" : ""}">
      <div class="metric-label"><span>${escapeHtml(label)}</span>${helpHtml}</div>
      <div class="metric-value${value === "Cannot break even" ? " metric-value-long" : ""}">${escapeHtml(value)}</div>
      ${description ? `<p class="metric-description${explainRounding ? " metric-description-visible" : ""}">${escapeHtml(description)}</p>` : ""}
    </article>`;
}

function getNarrative(mode, results, origin) {
  const exampleLabel = origin === "example" ? "Practice example" : origin === "rates" ? "Example rates" : "Your scenario";
  const salesPhrase = results.sales === 0 && results.closingOpportunities > 0
    ? "less than one sale after rounding"
    : `about ${numberFormat(results.sales)} ${results.sales === 1 ? "sale" : "sales"}`;
  return `${exampleLabel}: over ${results.days} days, ${money(results.spend)} in advertising could lead to ${salesPhrase} and ${money(results.revenue)} in sales revenue.`;
}

function stageDetails(mode, results) {
  const stages = [
    {
      name: "Ad displays",
      help: STAGE_HELP.impressions,
      count: results.impressions,
      detail: `The ad is shown about ${numberFormat(results.impressions)} times.`,
      formula: `${money(results.spend)} ad spend ÷ ${money(Number(state.values[mode].cpm))} CPM × 1,000`,
    },
    {
      name: "Ad clicks",
      help: STAGE_HELP.clicks,
      count: results.clicks,
      detail: `About ${numberFormat(state.values[mode].ctr, 2)}% of displays lead to a click.`,
      formula: `${numberFormat(results.impressions)} displays × ${numberFormat(state.values[mode].ctr, 2)}%`,
    },
    {
      name: "People who leave their details",
      help: STAGE_HELP.leads,
      count: results.leads,
      detail: `About ${numberFormat(state.values[mode].signupRate, 2)}% of clicks become leads.`,
      formula: `${numberFormat(results.clicks)} clicks × ${numberFormat(state.values[mode].signupRate, 2)}%`,
    },
  ];

  if (mode === "two") {
    stages.push({
      name: "Appointments booked",
      help: STAGE_HELP.bookings,
      count: results.bookings,
      detail: `About ${numberFormat(state.values[mode].bookingRate, 2)}% of leads book.`,
      formula: `${numberFormat(results.leads)} leads × ${numberFormat(state.values[mode].bookingRate, 2)}%`,
    });
    stages.push({
      name: "Appointments attended",
      help: STAGE_HELP.appointmentAttendance,
      count: results.closingOpportunities,
      detail: `About ${numberFormat(state.values[mode].showRate, 2)}% of bookings are attended.`,
      formula: `${numberFormat(results.bookings)} bookings × ${numberFormat(state.values[mode].showRate, 2)}%`,
    });
  } else {
    stages.push({
      name: "Leads contacted",
      help: STAGE_HELP.contact,
      count: results.closingOpportunities,
      detail: `About ${numberFormat(state.values[mode].contactRate, 2)}% of leads are reached.`,
      formula: `${numberFormat(results.leads)} leads × ${numberFormat(state.values[mode].contactRate, 2)}%`,
    });
  }

  const closingPeople = mode === "two" ? "appointment attendees" : "leads contacted";
  stages.push({
    name: "Estimated sales",
    help: STAGE_HELP.sales,
    count: results.sales,
    detail: `About ${numberFormat(state.values[mode].purchaseRate, 2)}% of ${closingPeople} buy; sales are rounded to whole people.`,
    formula: `${numberFormat(results.closingOpportunities)} ${closingPeople} × ${numberFormat(state.values[mode].purchaseRate, 2)}%`,
    exact: true,
  });

  return stages;
}

function flowRows(mode, stages) {
  return stages.map((stage, index) => `
    <li class="flow-item">
      <span class="flow-index" aria-hidden="true">${index + 1}</span>
      <div class="flow-main">
        <div class="flow-name-row"><span class="flow-name">${escapeHtml(stage.name)}</span>${helpPopover(`flow-${mode}-${index}`, stage.name, stage.help.title, stage.help.copy)}</div>
        <span class="flow-detail">${escapeHtml(stage.detail)}</span>
        <span class="flow-detail">Calculation: ${escapeHtml(stage.formula)}</span>
      </div>
      <span class="flow-value">${stage.exact ? numberFormat(stage.count) : countLabel(stage.count)}</span>
    </li>`).join("");
}

function renderBreakdown(mode, results) {
  const stageRows = flowRows(mode, stageDetails(mode, results));

  const costValues = [
    ["Ad cost", money(results.spend), "spend"],
    ["Cost per click", money(results.costPerClick), "click"],
    ["Cost per lead", money(results.costPerLead), "lead"],
  ];
  if (mode === "two") costValues.push(["Cost per booking", money(results.costPerBooking), "booking"]);
  if (mode === "two") costValues.push(["Cost per attendee", money(results.costPerClosingOpportunity), "attendee"]);
  if (mode === "one") costValues.push(["Cost per contacted lead", money(results.costPerClosingOpportunity), "contacted"]);
  costValues.push(["Cost per sale", money(results.costPerSale), "sale"]);

  document.getElementById("breakdown-content").innerHTML = `
    <p class="breakdown-intro">${results.days} days · Each stage is estimated from the rate entered above. Intermediate counts are rounded here for easier reading.</p>
    <ol class="flow-list">${stageRows}</ol>
    <div class="flow-costs" aria-label="Advertising costs by stage">
      ${costValues.map(([label, value, key]) => `
        <div class="flow-cost">
          <div class="flow-cost-title"><span class="flow-cost-label">${escapeHtml(label)}</span>${helpPopover(`cost-${mode}-${key}`, label, COST_HELP[key].title, COST_HELP[key].copy)}</div>
          <span class="flow-cost-value">${escapeHtml(value)}</span>
        </div>`).join("")}
    </div>`;
}

function renderCommerceBreakdown(results, values) {
  const stages = [
    {
      name: "Ad displays",
      help: STAGE_HELP.impressions,
      count: results.impressions,
      detail: `The ad is shown about ${numberFormat(results.impressions)} times.`,
      formula: `${money(results.spend)} ad spend ÷ ${money(values.cpm)} CPM × 1,000`,
    },
    {
      name: "Store link clicks",
      help: COMMERCE_HELP.storeClicks,
      count: results.storeClicks,
      detail: `About ${numberFormat(values.storeClickRate, 2)}% of ad displays lead to a store click.`,
      formula: `${numberFormat(results.impressions)} ad displays × ${numberFormat(values.storeClickRate, 2)}%`,
    },
    {
      name: "Estimated orders",
      help: COMMERCE_HELP.orders,
      count: results.orders,
      detail: `About ${numberFormat(values.storePurchaseRate, 2)}% of store clicks become orders; orders are rounded to whole purchases.`,
      formula: `${numberFormat(results.storeClicks)} store clicks × ${numberFormat(values.storePurchaseRate, 2)}%`,
      exact: true,
    },
  ];

  const costValues = [
    ["Ad cost", money(results.spend), COST_HELP.spend, "spend"],
    ["Ad cost per store click", money(results.adCostPerClick), COMMERCE_HELP.adCostPerClick, "click"],
    ["Ad cost per order", money(results.adCostPerOrder), COMMERCE_HELP.adCostPerOrder, "order"],
    ["Product and delivery costs", money(results.orderCosts), COMMERCE_HELP.orderCosts, "order-costs"],
    ["Amount left per order before ads", money(results.perOrderRoom), COMMERCE_HELP.perOrderRoom, "room"],
    ["Break-even ROAS", results.breakEvenRoas === null ? "—" : `${numberFormat(results.breakEvenRoas, 2)}×`, COMMERCE_HELP.breakEvenRoas, "break-even-roas"],
  ];

  document.getElementById("breakdown-content").innerHTML = `
    <p class="breakdown-intro">${results.days} days · Store clicks are estimated from ad displays, then completed orders are rounded to whole purchases.</p>
    <ol class="flow-list">${flowRows("commerce", stages)}</ol>
    <div class="flow-costs" aria-label="Order and advertising costs">
      ${costValues.map(([label, value, help, key]) => `
        <div class="flow-cost">
          <div class="flow-cost-title"><span class="flow-cost-label">${escapeHtml(label)}</span>${helpPopover(`cost-commerce-${key}`, label, help.title, help.copy)}</div>
          <span class="flow-cost-value">${escapeHtml(value)}</span>
        </div>`).join("")}
    </div>`;
}

function renderCommerceResults(values) {
  const results = calculateCommerce(state.period, values);
  const orderText = results.orders === 0 && results.rawOrders > 0 ? "Under 1" : numberFormat(results.orders);
  const orderDescription = results.orders === 0 && results.rawOrders > 0
    ? "Fewer than 0.5 expected orders, rounded to a whole number."
    : "Completed orders rounded to whole purchases.";
  const breakEvenText = results.breakEvenOrders === null ? "Cannot break even" : numberFormat(results.breakEvenOrders);
  const breakEvenDescription = results.breakEvenOrders === null
    ? "Each order leaves no money to cover ads."
    : `At ${money(results.perOrderRoom)} left per order before ads.`;
  const orderPhrase = results.orders === 0 && results.rawOrders > 0
    ? "less than one order after rounding"
    : `about ${numberFormat(results.orders)} ${results.orders === 1 ? "order" : "orders"}`;
  const balancePhrase = results.balance < 0
    ? `${money(Math.abs(results.balance))} short of covering order and ad costs`
    : results.balance > 0
      ? `${money(results.balance)} left after order and ad costs`
      : "exactly covering order and ad costs";
  const originLabel = state.origin.commerce === "example" ? "Practice example" : state.origin.commerce === "rates" ? "Example rates" : "Your scenario";
  const narrative = `${originLabel}: over ${results.days} days, ${money(results.spend)} in ads could lead to ${orderPhrase} and ${money(results.revenue)} in sales revenue. After ${money(results.orderCosts)} in product and delivery costs, that is ${balancePhrase}.`;

  document.getElementById("results-content").innerHTML = `
    <div class="result-summary">
      <div class="metric-grid metric-grid-commerce">
        ${metricCard({
          id: "commerce-orders",
          label: "Estimated orders",
          value: orderText,
          description: orderDescription,
          primary: true,
          help: COMMERCE_HELP.orders,
        })}
        ${metricCard({
          id: "commerce-revenue",
          label: "Sales revenue",
          value: money(results.revenue),
          description: "Before product, delivery, and ad costs.",
          help: COMMERCE_HELP.revenue,
        })}
        ${metricCard({
          id: "commerce-balance",
          label: "Estimated gain or loss",
          value: money(results.balance),
          description: "After order and ad costs; before fixed costs.",
          tone: results.balance < 0 ? "negative" : null,
          help: COMMERCE_HELP.balance,
        })}
        ${metricCard({
          id: "commerce-roas",
          label: "Revenue per 1 spent on ads",
          value: results.roas === null ? "—" : `${numberFormat(results.roas, 2)}×`,
          description: results.roas === null ? "No ad spend in this period." : "Also called return on ad spend (ROAS).",
          help: COMMERCE_HELP.roas,
        })}
        ${metricCard({
          id: "commerce-break-even",
          label: "Orders needed to cover ad costs",
          value: breakEvenText,
          description: breakEvenDescription,
          help: COMMERCE_HELP.breakEvenOrders,
        })}
      </div>
      <details class="result-context">
        <summary>About this forecast</summary>
        <p class="result-narrative">${escapeHtml(narrative)}</p>
        <p class="result-caveat">An estimate from the numbers entered. Refunds, taxes, and fixed business costs are not included; real results may differ.</p>
      </details>
    </div>`;

  bindHelp(document.getElementById("results-content"));
  renderCommerceBreakdown(results, values);
  bindHelp(document.getElementById("breakdown-content"));
  setBreakdownAvailability(true);
  const live = document.getElementById("live-summary");
  window.clearTimeout(liveAnnouncementTimer);
  live.textContent = "";
  liveAnnouncementTimer = window.setTimeout(() => {
    live.textContent = `${numberFormat(results.orders)} estimated orders over ${results.days} days. Sales revenue ${money(results.revenue)}. Estimated gain or loss ${money(results.balance)}.`;
  }, 600);
}

function renderResults() {
  const mode = state.mode;
  const { parsed, errors, missing } = readInputs(mode);
  const live = document.getElementById("live-summary");

  if (errors.length) {
    const error = errors[0];
    const fieldLabel = COMPACT_FIELD_LABELS[error.key] ?? FIELDS[error.key].label;
    renderEmptyResults({
      title: "One number needs attention",
      message: `Check “${fieldLabel}” in the form to continue.`,
      error: true,
    });
    return;
  }

  if (missing.length) {
    const isCommerce = mode === "commerce";
    const requiredKnown = isCommerce
      ? parsed.dailyBudget !== null && parsed.averageOrderValue !== null && parsed.orderCost !== null
      : parsed.dailyBudget !== null && parsed.averageSaleValue !== null;
    const title = requiredKnown ? "Add your rate estimates" : isCommerce ? "Start with three numbers" : "Start with two numbers";
    const message = requiredKnown
      ? isCommerce
        ? "Enter the ad and store purchase rates, or use example rates to explore how the forecast works."
        : "Enter the ad and follow-up rates, or use example rates to explore how the forecast works."
      : isCommerce
        ? "Enter your daily ad budget, average order amount, and cost per order, or try the example."
        : "Enter your daily ad budget and average sale amount, or load an example to see the full forecast.";
    renderEmptyResults({ title, message });
    return;
  }

  if (mode === "commerce") {
    renderCommerceResults(parsed);
    return;
  }

  const results = calculate(mode, state.period, parsed);
  const closingPeople = mode === "two" ? "appointment attendees" : "leads you reach";
  const mainHelp = {
    title: "Estimated sales",
    copy: `The estimated number of purchases. The calculator applies your close rate to ${closingPeople}, then rounds to a whole sale.`,
  };
  const revenueHelp = {
    title: "Estimated sales revenue",
    copy: "Estimated sales multiplied by the average amount per sale. This is before advertising, product, and other business costs, so it is not profit.",
  };
  const spendHelp = {
    title: "Total advertising cost",
    copy: "Your daily advertising budget multiplied by the forecast period. The monthly estimate uses 30 days; the annual estimate uses 365 days.",
  };
  const saleCostHelp = {
    title: "Advertising cost per sale",
    copy: "Total advertising cost divided by the estimated number of sales for this same time period. If no sales are estimated, there is no cost per sale to show.",
  };
  const roasHelp = {
    title: "Revenue for each 1 spent on ads (ROAS)",
    copy: "Sales revenue divided by advertising cost. A result of 3× means the forecast estimates 3 in sales revenue for every 1 spent on ads. It does not subtract the cost of delivering your product or service.",
  };

  const origin = state.origin[mode];
  const salesText = results.sales === 0 && results.closingOpportunities > 0
    ? "Under 1"
    : numberFormat(results.sales);
  const salesDescription = results.sales === 0 && results.closingOpportunities > 0
    ? "Fewer than 0.5 expected sales, rounded to a whole number."
    : "A forecast, rounded to whole sales.";
  const narrative = getNarrative(mode, results, origin);

  document.getElementById("results-content").innerHTML = `
    <div class="result-summary">
      <div class="metric-grid">
        ${metricCard({
          id: "metric-sales",
          label: "Estimated sales",
          value: salesText,
          description: salesDescription,
          primary: true,
          help: mainHelp,
        })}
        ${metricCard({
          id: "metric-revenue",
          label: "Sales revenue",
          value: money(results.revenue),
          description: "Before advertising and other business costs.",
          help: revenueHelp,
        })}
        ${metricCard({
          id: "metric-spend",
          label: "Advertising cost",
          value: money(results.spend),
          description: `${results.days} days at ${money(parsed.dailyBudget)} per day.`,
          help: spendHelp,
        })}
        ${metricCard({
          id: "metric-cpa",
          label: "Cost per sale",
          value: money(results.costPerSale),
          description: results.costPerSale === null ? "No sales are estimated for this scenario." : `For this ${results.days}-day period.`,
          help: saleCostHelp,
        })}
        ${metricCard({
          id: "metric-roas",
          label: "Revenue per 1 spent on ads",
          value: results.roas === null ? "—" : `${numberFormat(results.roas, 2)}×`,
          description: "Also called return on ad spend (ROAS).",
          help: roasHelp,
        })}
      </div>
      <details class="result-context">
        <summary>About this forecast</summary>
        <p class="result-narrative">${escapeHtml(narrative)}</p>
        <p class="result-caveat">An estimate based on the numbers entered. Revenue is not profit, and real results may differ.</p>
      </details>
    </div>`;

  bindHelp(document.getElementById("results-content"));
  renderBreakdown(mode, results);
  bindHelp(document.getElementById("breakdown-content"));
  setBreakdownAvailability(true);
  const announcement = `${numberFormat(results.sales)} estimated sales over ${results.days} days. Estimated sales revenue ${money(results.revenue)}. Advertising cost ${money(results.spend)}.`;
  window.clearTimeout(liveAnnouncementTimer);
  live.textContent = "";
  liveAnnouncementTimer = window.setTimeout(() => {
    live.textContent = announcement;
  }, 600);
}

function syncCurrency(render = true) {
  const activeCurrency = state.currency[state.mode];
  document.getElementById("currency-select").value = activeCurrency;
  window.dispatchEvent?.(new CustomEvent("calculator:currency", { detail: activeCurrency }));
  for (const mode of MODES) {
    document.querySelectorAll(`#panel-${mode} .currency-prefix`).forEach((node) => {
      node.textContent = CURRENCY_SYMBOLS[state.currency[mode]] ?? state.currency[mode];
    });
  }
  updateCurrencyPlaceholders();
  void refreshExchangeRate(activeCurrency);
  updateStarterGuide(state.mode);
  if (render) renderResults();
}

function updateExampleNotice() {
  const mode = state.mode;
  const message = document.getElementById("example-notice");
  const hasPracticeRates = state.exampleFields[mode].size > 0;
  const hasBenchmarkRates = state.benchmarkFields[mode].size > 0;
  if (!hasPracticeRates && !hasBenchmarkRates) {
    message.hidden = true;
    message.textContent = "";
    return;
  }

  message.hidden = false;
  if (state.origin[mode] === "example") {
    message.textContent = mode === "commerce"
      ? "The rates are practice assumptions, not benchmarks or promised results. Try changing the order amount, delivery cost, or purchase rate to see how each affects the estimate."
      : "The rates are practice assumptions, not benchmarks or promised results. Try changing one rate at a time to see how it affects the estimate.";
  } else if (hasPracticeRates && hasBenchmarkRates) {
    message.textContent = "Some fields use published starting points and others use practice assumptions. Benchmarks describe broad averages, not promises; replace them with your own campaign numbers when available.";
  } else if (hasBenchmarkRates) {
    message.textContent = "Fields marked “Benchmark starting point” use broad published averages for the selected business type. Results vary by market, offer, and campaign; replace them with your own numbers when available.";
  } else {
    message.textContent = "Fields marked “Practice example” use teaching assumptions, not benchmarks or expected results. Replace them with your own campaign numbers when you have them.";
  }
  if (mode !== "commerce" && state.market !== "US" && hasBenchmarkRates) {
    message.textContent += " Any benchmark values already entered are U.S. references; update them for your market.";
  }
}

function loadFullExample() {
  closeAllHelp();
  const mode = state.mode;
  state.values[mode] = Object.fromEntries(
    Object.entries(EXAMPLE_VALUES[mode]).map(([key, value]) => [key, String(value)]),
  );
  state.exampleFields[mode] = new Set(RATE_FIELDS[mode]);
  state.benchmarkFields[mode].clear();
  state.origin[mode] = "example";
  state.currency[mode] = "USD";
  syncCurrency(false);
  state.touched[mode].clear();
  updateForm(mode);
  updateExampleButtonLabel(mode);
  updateExampleNotice();
  renderResults();
}

function useExampleRates() {
  closeAllHelp();
  const mode = state.mode;
  const example = EXAMPLE_VALUES[mode];
  let filled = 0;
  for (const key of RATE_FIELDS[mode]) {
    if (state.values[mode][key] !== "") continue;
    state.values[mode][key] = String(example[key]);
    state.exampleFields[mode].add(key);
    state.touched[mode].delete(key);
    filled += 1;
  }

  state.origin[mode] = "rates";
  updateForm(mode);
  updateExampleNotice();
  renderResults();

  const message = document.getElementById("example-notice");
  if (filled === 0) {
    message.hidden = false;
    message.textContent = "Your rate fields already have values, so we kept them as entered.";
  } else {
    message.hidden = false;
    message.textContent = `${filled} empty rate ${filled === 1 ? "field was" : "fields were"} filled with practice assumptions. Your existing numbers were kept. These rates are for learning how the forecast works, not benchmarks.`;
  }
}

function resolvedSuggestionValue(entry, mode) {
  if (entry.unit !== "money") return entry.value;
  const currency = state.currency[mode];
  if (currency === "USD") return entry.value;
  const rateInfo = liveExchangeRate(currency);
  return rateInfo?.live ? entry.value * rateInfo.rate : null;
}

function applyFieldSuggestion(mode, key, onlyIfEmpty = false) {
  const entry = getSuggestionEntries(mode).find((candidate) => candidate.key === key);
  if (!entry || (onlyIfEmpty && state.values[mode][key] !== "")) return false;
  const value = resolvedSuggestionValue(entry, mode);
  if (value === null) return false;

  state.values[mode][key] = String(value);
  state.exampleFields[mode].delete(key);
  state.benchmarkFields[mode].add(key);
  state.touched[mode].delete(key);
  return true;
}

function applyAvailableSuggestions() {
  const mode = state.mode;
  let filled = 0;
  let skippedExisting = 0;
  let skippedCurrency = 0;

  for (const entry of getSuggestionEntries(mode)) {
    if (state.values[mode][entry.key] !== "") {
      skippedExisting += 1;
      continue;
    }
    if (resolvedSuggestionValue(entry, mode) === null) {
      skippedCurrency += 1;
      continue;
    }
    if (applyFieldSuggestion(mode, entry.key, true)) filled += 1;
  }

  if (filled > 0) state.origin[mode] = "benchmarks";
  updateForm(mode);
  updateExampleButtonLabel(mode);
  updateExampleNotice();
  renderResults();

  const status = document.getElementById("starter-status");
  if (filled === 0 && skippedExisting > 0) {
    status.textContent = "Your suggested fields already have values, so they were kept.";
  } else if (filled === 0 && skippedCurrency > 0) {
    status.textContent = "We need an exchange rate before we can apply money suggestions. Try again when you are online, or switch to USD.";
  } else if (filled === 0) {
    status.textContent = "No published starting points match this market. Use the practice rates to explore instead.";
  } else {
    const keptText = skippedExisting > 0 ? ` ${skippedExisting} existing ${skippedExisting === 1 ? "value was" : "values were"} kept.` : "";
    const rateText = skippedCurrency > 0 ? ` ${skippedCurrency} money ${skippedCurrency === 1 ? "value needs" : "values need"} an exchange rate before it can be applied.` : "";
    status.textContent = `Filled ${filled} empty ${filled === 1 ? "field" : "fields"} with published starting points.${keptText}${rateText}`;
  }
}

function clearCurrentValues() {
  closeAllHelp();
  const mode = state.mode;
  state.values[mode] = makeEmptyValues(mode);
  state.exampleFields[mode].clear();
  state.benchmarkFields[mode].clear();
  state.touched[mode].clear();
  state.origin[mode] = "own";
  document.getElementById("starter-status").textContent = "";
  updateForm(mode);
  updateExampleButtonLabel(mode);
  updateExampleNotice();
  renderResults();
  document.getElementById("live-summary").textContent = "Your numbers have been cleared.";
  document.querySelector(`#panel-${mode} input`)?.focus();
}

function onFieldInput(event) {
  const input = event.target.closest("[data-input-key]");
  if (!input) return;

  const mode = state.mode;
  const key = input.dataset.inputKey;
  state.values[mode][key] = input.value;
  state.touched[mode].add(key);
  state.origin[mode] = "own";
  if (state.exampleFields[mode].has(key)) state.exampleFields[mode].delete(key);
  if (state.benchmarkFields[mode].has(key)) state.benchmarkFields[mode].delete(key);

  const field = FIELDS[key];
  const value = input.value === "" ? null : Number(input.value);
  const error = input.value === ""
    ? ""
    : field.validate
      ? field.validate(value)
      : value < 0
        ? "Enter zero or a positive amount."
        : "";
  setFieldError(mode, key, error, true);
  updateExampleButtonLabel(mode);
  updateFormBadges(mode);
  updateExampleNotice();
  renderResults();
}

function updateFormBadges(mode) {
  document.querySelectorAll(`#panel-${mode} [data-assumption-for]`).forEach((badge) => {
    const key = badge.dataset.assumptionFor;
    const isBenchmark = state.benchmarkFields[mode].has(key);
    const isPractice = state.exampleFields[mode].has(key);
    badge.hidden = !isBenchmark && !isPractice;
    badge.textContent = isBenchmark ? "Benchmark starting point" : "Practice example";
  });
}

function updateExampleButtonLabel(mode) {
  const hasValues = Object.values(state.values[mode]).some((value) => value !== "");
  document.querySelector('[data-action="load-example"]').textContent = hasValues
    ? "Replace with example (USD)"
    : "Try the example (USD)";
}

function bindEvents() {
  document.querySelectorAll(".input-help, #starter-guide").forEach((details) => {
    details.addEventListener("toggle", () => updateSuggestionCards(state.mode));
  });
  document.querySelectorAll('input[name="funnel-mode"]').forEach((input) => {
    input.addEventListener("change", () => setMode(input.value));
  });

  document.querySelectorAll('input[name="period"]').forEach((input) => {
    input.addEventListener("change", () => {
      state.period = Number(input.value);
      renderResults();
    });
  });

  document.getElementById("currency-select").addEventListener("change", (event) => {
    state.currency[state.mode] = event.target.value;
    syncCurrency();
    updateExampleNotice();
  });

  document.getElementById("starter-market").addEventListener("change", (event) => {
    state.market = event.target.value;
    document.getElementById("starter-status").textContent = "";
    updateStarterGuide(state.mode);
    updateExampleNotice();
  });

  document.getElementById("starter-industry").addEventListener("change", (event) => {
    state.industry[state.mode] = event.target.value;
    document.getElementById("starter-status").textContent = state.benchmarkFields[state.mode].size > 0
      ? "The suggestion list changed. Numbers already in your estimate were kept; use a new suggestion to replace one."
      : "";
    updateStarterGuide(state.mode);
  });

  document.querySelector('[data-action="apply-benchmarks"]').addEventListener("click", applyAvailableSuggestions);

  document.addEventListener("click", (event) => {
    const button = event.target.closest('[data-action="use-suggestion"]');
    if (!button) return;
    const key = button.dataset.suggestionField;
    if (!applyFieldSuggestion(state.mode, key)) return;
    state.origin[state.mode] = "benchmarks";
    updateForm(state.mode);
    updateExampleButtonLabel(state.mode);
    updateExampleNotice();
    renderResults();
    document.getElementById("starter-status").textContent = `Added the published starting point to ${FIELDS[key].label.toLowerCase()}. You can edit it at any time.`;
  });

  for (const mode of MODES) {
    document.getElementById(`form-${mode}`).addEventListener("input", onFieldInput);
    document.getElementById(`form-${mode}`).addEventListener("blur", onFieldBlur, true);
  }

  document.querySelector('[data-action="load-example"]').addEventListener("click", loadFullExample);
  document.querySelector('[data-action="use-rates"]').addEventListener("click", useExampleRates);
  document.querySelector('[data-action="clear"]').addEventListener("click", clearCurrentValues);

  document.addEventListener("pointerdown", (event) => {
    document.querySelectorAll(".currency-info, .journey-guide").forEach((details) => {
      if (!details.contains(event.target) && details.open) {
        if (window.AdMathInteractions) window.AdMathInteractions.setDisclosure(details, false);
        else details.open = false;
      }
    });
    if (event.target.closest(".help-wrap")) return;
    document.querySelectorAll(".help-wrap[data-pinned='true']").forEach((wrapper) => {
      if (wrapper._closeHelp) {
        wrapper._closeHelp();
        return;
      }
      wrapper.querySelector(".help-trigger").setAttribute("aria-expanded", "false");
      wrapper.querySelector(".tooltip").hidden = true;
      wrapper.dataset.pinned = "false";
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAllHelp();
      document.querySelectorAll(".currency-info, .journey-guide").forEach((details) => {
        if (details.open && window.AdMathInteractions) window.AdMathInteractions.setDisclosure(details, false);
        else details.open = false;
      });
    }
  });

  document.querySelector(".mobile-result-link").addEventListener("click", () => {
    window.setTimeout(() => document.getElementById("results-title").focus(), 150);
  });

  document.querySelectorAll("form").forEach((form) => {
    form.addEventListener("submit", (event) => event.preventDefault());
  });
}

function onFieldBlur(event) {
  const input = event.target.closest("[data-input-key]");
  if (!input) return;
  const mode = state.mode;
  const key = input.dataset.inputKey;
  state.touched[mode].add(key);
  const raw = state.values[mode][key];
  const value = raw === "" ? null : Number(raw);
  const field = FIELDS[key];
  const error = field.validate
    ? field.validate(value)
    : value !== null && value < 0
      ? "Enter zero or a positive amount."
      : "";
  setFieldError(mode, key, error, raw !== "");
}

function renderInitial() {
  for (const mode of MODES) renderFields(mode);
  renderJourney("one");
  updateExampleHint("one");
  updateExampleButtonLabel("one");
  updateStarterGuide("one");
  renderResults();
  bindEvents();
}

renderInitial();
