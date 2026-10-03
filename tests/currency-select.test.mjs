import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const root = new URL('../', import.meta.url);
const read = (file) => readFileSync(new URL(file, root), 'utf8');
const tick = () => new Promise((resolve) => setTimeout(resolve, 25));
function fixture() {
  const dom = new JSDOM(read('index.html'), { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://calculator.test/' });
  const { window } = dom;
  window.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {} });
  window.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
  window.HTMLElement.prototype.scrollIntoView = function () {};
  window.HTMLElement.prototype.hasPointerCapture = () => false;
  window.HTMLElement.prototype.setPointerCapture = function () {};
  window.HTMLElement.prototype.releasePointerCapture = function () {};
  window.fetch = () => Promise.reject(new Error('Offline test'));
  for (const script of ['benchmarks.js', 'interactions.js', 'currency-select.js', 'app.js']) window.eval(read(script));
  return dom;
}
function mode(window, value) {
  const radio = window.document.querySelector(`input[name="funnel-mode"][value="${value}"]`);
  radio.checked = true;
  radio.dispatchEvent(new window.Event('change', { bubbles: true }));
}

test('Radix replaces the native currency picker and stays synchronized across modes and examples', async () => {
  const dom = fixture();
  try {
    const { window } = dom;
    const native = window.document.getElementById('currency-select');
    const trigger = window.document.getElementById('currency-select-trigger');
    assert.equal(native.hidden, true);
    assert.equal(trigger.getAttribute('role'), 'combobox');
    assert.equal(window.document.getElementById('currency-label').htmlFor, trigger.id);
    window.document.querySelector('[data-action="load-example"]').click();
    const before = Array.from(window.document.querySelectorAll('#form-one [data-input-key]'), (input) => input.value);
    native.value = 'BDT';
    native.dispatchEvent(new window.Event('change', { bubbles: true }));
    await tick();
    assert.match(trigger.textContent, /BDT ৳/);
    assert.deepEqual(Array.from(window.document.querySelectorAll('#form-one [data-input-key]'), (input) => input.value), before);
    mode(window, 'commerce'); await tick();
    assert.match(trigger.textContent, /USD \$/);
    mode(window, 'one'); await tick();
    assert.match(trigger.textContent, /BDT ৳/);
    window.document.querySelector('[data-action="load-example"]').click(); await tick();
    assert.match(trigger.textContent, /USD \$/);
    assert.equal(native.value, 'USD');
  } finally { dom.window.close(); }
});

test('keyboard opens Radix options, selects a currency, and Escape restores focus', async () => {
  const dom = fixture();
  try {
    const { window } = dom;
    const trigger = window.document.getElementById('currency-select-trigger');
    trigger.focus();
    trigger.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await tick();
    assert.equal(trigger.getAttribute('aria-expanded'), 'true');
    const list = window.document.querySelector('[role="listbox"]');
    assert.ok(list);
    const options = [...list.querySelectorAll('[role="option"]')];
    assert.equal(options.length, 7);
    const bdt = options.find((option) => option.textContent.includes('BDT'));
    bdt.focus();
    bdt.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await tick();
    assert.equal(window.document.getElementById('currency-select').value, 'BDT');
    assert.match(trigger.textContent, /BDT ৳/);
    trigger.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await tick();
    window.document.activeElement.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await tick();
    assert.equal(trigger.getAttribute('aria-expanded'), 'false');
    assert.equal(window.document.activeElement, trigger);
  } finally { dom.window.close(); }
});

test('starting-point menus follow the chosen market and changing category options', async () => {
  const dom = fixture();
  try {
    const { window } = dom;
    const market = window.document.getElementById('starter-market');
    const industry = window.document.getElementById('starter-industry');
    await tick();
    assert.equal(market.hidden, true);
    assert.equal(industry.hidden, true);
    market.value = 'other';
    market.dispatchEvent(new window.Event('change', { bubbles: true }));
    await tick();
    assert.match(window.document.getElementById('starter-market-trigger').textContent, /Outside the United States/);
    assert.equal(window.document.getElementById('currency-select').value, 'USD');
    const leadValues = Array.from(industry.options, (option) => option.value);
    const chosen = leadValues.find((value) => value !== 'overall');
    industry.value = chosen;
    industry.dispatchEvent(new window.Event('change', { bubbles: true }));
    await tick();
    assert.equal(window.document.getElementById('starter-industry-trigger').textContent, industry.selectedOptions[0].textContent);
    mode(window, 'commerce'); await tick();
    assert.equal(window.document.getElementById('starter-market-wrap').hidden, true);
    const trigger = window.document.getElementById('starter-industry-trigger');
    trigger.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await tick();
    assert.deepEqual([...window.document.querySelectorAll('[role="option"]')].map((option) => option.textContent), Array.from(industry.options, (option) => option.textContent));
    window.document.activeElement.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await tick();
    mode(window, 'one'); await tick();
    assert.equal(industry.value, chosen);
    assert.equal(market.value, 'other');
    assert.equal(window.document.getElementById('starter-industry-trigger').textContent, industry.selectedOptions[0].textContent);
  } finally { dom.window.close(); }
});

test('forecast breakdown action reveals details for every mode and resets when numbers are cleared', async () => {
  const dom = fixture();
  try {
    const { window } = dom;
    const button = window.document.getElementById('breakdown-toggle');
    const details = window.document.getElementById('breakdown-details');
    assert.equal(button.hidden, true, 'no breakdown action without a complete forecast');
    for (const value of ['one', 'two', 'commerce']) {
      mode(window, value);
      window.document.querySelector('[data-action="load-example"]').click();
      assert.equal(button.hidden, false);
      assert.equal(button.getAttribute('aria-expanded'), 'false');
      button.click();
      assert.equal(details.open, true);
      assert.equal(button.getAttribute('aria-expanded'), 'true');
      assert.match(button.textContent, /Hide full breakdown/);
      const period = window.document.querySelector('input[name="period"][value="365"]');
      period.checked = true;
      period.dispatchEvent(new window.Event('change', { bubbles: true }));
      assert.equal(details.open, true);
      assert.equal(button.getAttribute('aria-expanded'), 'true');
      assert.match(window.document.getElementById('breakdown-content').textContent, /365 days/);
      button.click();
      assert.equal(details.open, false);
      assert.equal(button.getAttribute('aria-expanded'), 'false');
      assert.match(button.textContent, /View full breakdown/);
      button.click();
      window.document.querySelector('[data-action="clear"]').click();
      assert.equal(details.open, false);
      assert.equal(button.hidden, true);
      assert.equal(button.getAttribute('aria-expanded'), 'false');
    }
  } finally { dom.window.close(); }
});
