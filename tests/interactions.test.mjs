import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const source = readFileSync(new URL('../interactions.js', import.meta.url), 'utf8');
function fixture({ reduced = true } = {}) {
  const dom = new JSDOM(`<body><div class="help-wrap"><button class="help-trigger" aria-expanded="false">?</button><div class="tooltip" hidden><button class="tooltip-close">Close</button>Explanation</div></div><details class="currency-info"><summary>?</summary><p class="currency-note">Currency explanation</p></details><details class="input-help"><summary>Examples</summary><div>Optional content</div></details></body>`, { runScripts: 'outside-only', pretendToBeVisual: true });
  dom.window.matchMedia = (query) => ({ matches: query.includes('reduced-motion') ? reduced : true });
  dom.window.eval(source);
  return dom;
}
function fakeAnimation(element) {
  const animations = [];
  element.animate = () => {
    let resolve, reject;
    const finished = new Promise((yes, no) => { resolve = yes; reject = no; });
    const animation = { finished, complete: resolve, cancel: () => reject(new Error('canceled')) };
    animations.push(animation);
    return animation;
  };
  return animations;
}

for (const viewport of [{ width: 320, height: 640 }, { width: 375, height: 320 }, { width: 1280, height: 720 }, { left: 25, top: 180, width: 320, height: 280 }]) {
  test(`popovers stay inside ${JSON.stringify(viewport)}, including oversized content`, () => {
    const dom = fixture();
    const { popupLayout } = dom.window.AdMathInteractions;
    for (const x of [0, viewport.width / 2, viewport.width - 44]) {
      for (const y of [0, viewport.height / 2, viewport.height - 44]) {
        for (const height of [90, 280, 1000]) {
          for (const align of ['start', 'end']) {
            const anchor = { left: x + (viewport.left || 0), top: y + (viewport.top || 0), right: x + 44 + (viewport.left || 0), bottom: y + 44 + (viewport.top || 0) };
            const layout = popupLayout(anchor, { width: 620, height }, viewport, align);
            assert.ok(layout.left >= (viewport.left || 0) + 16);
            assert.ok(layout.top >= (viewport.top || 0) + 16);
            assert.ok(layout.left + layout.width <= (viewport.left || 0) + viewport.width - 16);
            assert.ok(layout.top + layout.maxHeight <= (viewport.top || 0) + viewport.height - 16);
          }
        }
      }
    }
    dom.window.close();
  });
}

test('help flips above a trigger near the bottom', () => {
  const dom = fixture();
  const layout = dom.window.AdMathInteractions.popupLayout({ left: 280, right: 324, top: 580, bottom: 624 }, { width: 310, height: 220 }, { width: 375, height: 640 });
  assert.equal(layout.side, 'top');
  assert.equal(layout.top, 352);
  assert.equal(layout.left, 49);
  dom.window.close();
});

test('pinned help closes with Escape, returns focus, and does not reopen', () => {
  const dom = fixture();
  const { window } = dom;
  const wrapper = window.document.querySelector('.help-wrap');
  window.AdMathInteractions.bindTooltip(wrapper);
  const trigger = wrapper.querySelector('.help-trigger');
  const panel = wrapper.querySelector('.tooltip');
  trigger.click();
  assert.equal(panel.hidden, false);
  assert.equal(wrapper.dataset.pinned, 'true');
  panel.querySelector('button').focus();
  panel.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  assert.equal(panel.hidden, true);
  assert.equal(panel.inert, true);
  assert.equal(trigger.getAttribute('aria-expanded'), 'false');
  assert.equal(window.document.activeElement, trigger);
  assert.equal(wrapper.dataset.pinned, 'false');
  dom.window.close();
});

test('reopening a closing tooltip cancels the stale hide completion', async () => {
  const dom = fixture({ reduced: false });
  const { window } = dom;
  const panel = window.document.querySelector('.tooltip');
  const trigger = window.document.querySelector('.help-trigger');
  const animations = fakeAnimation(panel);
  window.AdMathInteractions.showPopup(panel, trigger);
  window.AdMathInteractions.hidePopup(panel);
  window.AdMathInteractions.showPopup(panel, trigger);
  animations.at(-1).complete();
  await Promise.resolve(); await Promise.resolve();
  assert.equal(panel.hidden, false);
  assert.equal(panel.inert, false);
  assert.equal(panel.dataset.motion, 'open');
  dom.window.close();
});

test('repeated dismissal preserves the exit animation; popover can reopen during it', async () => {
  const dom = fixture({ reduced: false });
  const { window } = dom;
  const details = window.document.querySelector('.currency-info');
  const panel = details.querySelector('p');
  const animations = fakeAnimation(panel);
  window.AdMathInteractions.setDisclosure(details, true);
  window.AdMathInteractions.setDisclosure(details, false);
  window.AdMathInteractions.setDisclosure(details, false);
  assert.equal(details.open, true, 'content stays mounted during exit');
  details.querySelector('summary').click();
  assert.equal(details.dataset.motion, 'open');
  animations.at(-1).complete();
  await Promise.resolve(); await Promise.resolve();
  assert.equal(details.open, true);
  assert.equal(panel.hidden, false);
  window.AdMathInteractions.setDisclosure(details, false);
  animations.at(-1).complete();
  await Promise.resolve();
  assert.equal(details.open, false);
  assert.equal(panel.hidden, true);
  dom.window.close();
});

test('reduced motion disclosures toggle immediately and closed content is inert', () => {
  const dom = fixture();
  const details = dom.window.document.querySelector('.input-help');
  details.querySelector('summary').click();
  assert.equal(details.open, true);
  assert.equal(details.querySelector('div').inert, false);
  details.querySelector('summary').click();
  assert.equal(details.open, false);
  assert.equal(details.querySelector('div').inert, true);
  dom.window.close();
});

test('currency explanation opens on hover, stays reachable, and closes after leaving', async () => {
  const dom = fixture();
  try {
    const { window } = dom;
    const details = window.document.querySelector('.currency-info');
    const summary = details.querySelector('summary');
    const panel = details.querySelector('p');
    summary.dispatchEvent(new window.Event('pointerenter'));
    assert.equal(details.open, true);
    assert.equal(panel.hidden, false);
    assert.equal(panel.dataset.motion, 'open');
    details.dispatchEvent(new window.Event('pointerleave'));
    details.dispatchEvent(new window.Event('pointerenter'));
    await new Promise((resolve) => setTimeout(resolve, 160));
    assert.equal(details.open, true, 'moving into the explanation cancels dismissal');
    details.dispatchEvent(new window.Event('pointerleave'));
    await new Promise((resolve) => setTimeout(resolve, 160));
    assert.equal(details.open, false);
    assert.equal(panel.hidden, true);
  } finally { dom.window.close(); }
});

test('currency help opens by focus and can be pinned or dismissed by click and Escape', async () => {
  const dom = fixture();
  try {
    const { window } = dom;
    const details = window.document.querySelector('.currency-info');
    const summary = details.querySelector('summary');
    summary.focus();
    assert.equal(details.open, true);
    summary.click();
    assert.equal(details.dataset.pinned, 'true');
    details.dispatchEvent(new window.Event('pointerleave'));
    await new Promise((resolve) => setTimeout(resolve, 160));
    assert.equal(details.open, true);
    summary.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    assert.equal(details.open, false);
    assert.equal(details.dataset.pinned, 'false');
    summary.click();
    assert.equal(details.open, true);
    summary.click();
    assert.equal(details.open, false);
  } finally { dom.window.close(); }
});
