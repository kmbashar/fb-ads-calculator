"use strict";

// Starting-point data only. Money values are stored in USD; the app converts
// them for display when a current reference exchange rate is available.
window.CALCULATOR_BENCHMARKS = {
  leadSource: {
    name: "WordStream 2026 Meta lead-campaign benchmarks",
    url: "https://www.wordstream.com/blog/facebook-ads-benchmarks-2026",
    note: "These are U.S.-based Meta lead-campaign averages. The report appears to have a typo in its stated end year, so treat these values as directional; your form, audience, offer, and follow-up process can perform differently.",
    categories: {
      overall: { label: "General / not sure", ctr: 2.70, signupRate: 8.54 },
      arts: { label: "Arts & entertainment", ctr: 3.34, signupRate: 15.31 },
      automotive: { label: "Automotive sales", ctr: 2.29, signupRate: 4.15 },
      beauty: { label: "Beauty & personal care", ctr: 1.35, signupRate: 5.63 },
      career: { label: "Career & employment", ctr: 3.52, signupRate: 5.38 },
      dental: { label: "Dental services", ctr: 1.62, signupRate: 6.07 },
      education: { label: "Education & instruction", ctr: 1.74, signupRate: 15.87 },
      furniture: { label: "Furniture", ctr: 3.78, signupRate: 5.66 },
      health: { label: "Health & fitness", ctr: 3.09, signupRate: 7.98 },
      home: { label: "Home services & improvement", ctr: 2.14, signupRate: 5.32 },
      industrial: { label: "Industrial & commercial", ctr: 2.57, signupRate: 4.50 },
      personal: { label: "Personal services", ctr: 2.24, signupRate: 6.61 },
      medical: { label: "Medical services", ctr: 4.18, signupRate: 6.41 },
      realEstate: { label: "Real estate", ctr: 4.17, signupRate: 9.95 },
      sports: { label: "Sports & recreation", ctr: 3.16, signupRate: 6.75 },
    },
  },
  ecommerceSources: {
    meta: {
      name: "Triple Whale Facebook & Instagram ad benchmarks",
      url: "https://www.triplewhale.com/blog/facebook-ads-benchmarks",
      period: "August 2025–July 2026",
    },
    commerce: {
      name: "Triple Whale ecommerce benchmarks",
      url: "https://www.triplewhale.com/blog/ecommerce-benchmarks",
      period: "August 2025–July 2026",
    },
  },
  ecommerce: {
    overall: {
      label: "General / all product types",
      cpm: 15.06,
      ctr: 2.39,
      storePurchaseRate: 1.53,
      averageOrderValue: 73.36,
      source: "meta",
    },
    automotive: { label: "Automotive", cpm: 11.66, ctr: 1.98, storePurchaseRate: 1.59, averageOrderValue: 116.34, source: "commerce", rateSource: "commerce" },
    sports: { label: "Sports & outdoors", cpm: 12.38, ctr: 2.01, storePurchaseRate: 1.28, averageOrderValue: 113.93, source: "commerce" },
    travel: { label: "Travel accessories & luggage", cpm: 15.03, ctr: 2.40, storePurchaseRate: 1.19, averageOrderValue: 130.91, source: "commerce" },
    home: { label: "Home & garden", cpm: 14.16, ctr: 2.38, storePurchaseRate: 1.24, averageOrderValue: 114.43, source: "commerce" },
    baby: { label: "Baby", cpm: 11.75, ctr: 1.98, storePurchaseRate: 1.82, averageOrderValue: 75.33, source: "commerce" },
    apparel: { label: "Apparel & accessories", cpm: 11.72, ctr: 2.44, storePurchaseRate: 1.47, averageOrderValue: 89.17, source: "commerce" },
    toys: { label: "Toys, art & collectibles", cpm: 11.84, ctr: 2.35, storePurchaseRate: 1.53, averageOrderValue: 71.68, source: "commerce" },
    lifestyle: { label: "Lifestyle & boutique", cpm: 12.35, ctr: 2.44, storePurchaseRate: 1.62, averageOrderValue: 67.05, source: "commerce" },
    electronics: { label: "Electronics", cpm: 14.11, ctr: 2.41, storePurchaseRate: 1.13, averageOrderValue: 113.41, source: "commerce" },
    food: { label: "Food & beverage", cpm: 14.55, ctr: 1.98, storePurchaseRate: 1.89, averageOrderValue: 63.32, source: "commerce" },
    pets: { label: "Pets & animals", cpm: 16.71, ctr: 2.37, storePurchaseRate: 1.63, averageOrderValue: 60.12, source: "commerce" },
    beauty: { label: "Beauty", cpm: 16.90, ctr: 2.46, storePurchaseRate: 1.79, averageOrderValue: 61.18, source: "commerce" },
    books: { label: "Books & music", cpm: 12.79, ctr: 2.62, storePurchaseRate: 1.69, averageOrderValue: 52.56, source: "commerce" },
    health: { label: "Health & wellness", cpm: 20.34, ctr: 3.02, storePurchaseRate: 1.50, averageOrderValue: 62.99, source: "commerce" },
    learning: { label: "Online courses", cpm: 14.91, ctr: 2.74, storePurchaseRate: 1.31, averageOrderValue: 42.79, source: "commerce" },
  },
};
