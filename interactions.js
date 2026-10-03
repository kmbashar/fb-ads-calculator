/* Shared viewport positioning and motion for calculator help and disclosures. */
(() => {
  const easing = 'cubic-bezier(0.22, 1, 0.36, 1)';
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

  function popupLayout(anchor, size, viewport, align = 'start') {
    const margin = 16;
    const gap = 8;
    const leftEdge = (viewport.left || 0) + margin;
    const topEdge = (viewport.top || 0) + margin;
    const rightEdge = (viewport.left || 0) + viewport.width - margin;
    const bottomEdge = (viewport.top || 0) + viewport.height - margin;
    const width = Math.min(size.width, Math.max(1, rightEdge - leftEdge));
    let height = Math.min(size.height, Math.max(1, bottomEdge - topEdge));
    const below = Math.max(0, bottomEdge - anchor.bottom - gap);
    const above = Math.max(0, anchor.top - gap - topEdge);
    let side = 'bottom';
    let top;
    if (below >= height) {
      top = anchor.bottom + gap;
    } else if (above >= height) {
      side = 'top';
      top = anchor.top - gap - height;
    } else if (Math.max(below, above) >= 96) {
      side = above > below ? 'top' : 'bottom';
      height = Math.min(height, side === 'top' ? above : below);
      top = side === 'top' ? anchor.top - gap - height : anchor.bottom + gap;
    } else {
      // Little space around the trigger: use a bounded, internally scrolling panel.
      top = topEdge;
    }
    return {
      left: clamp(align === 'end' ? anchor.right - width : anchor.left, leftEdge, rightEdge - width),
      top: clamp(top, topEdge, bottomEdge - height),
      width,
      maxHeight: height,
      side,
    };
  }

  function viewportBounds() {
    const viewport = window.visualViewport;
    return {
      left: viewport?.offsetLeft || 0,
      top: viewport?.offsetTop || 0,
      width: viewport?.width || window.innerWidth,
      height: viewport?.height || window.innerHeight,
    };
  }

  function positionPopup(panel, anchor, options = {}) {
    const viewport = viewportBounds();
    const width = Math.min(options.width || 310, viewport.width - 32);
    panel.style.width = `${width}px`;
    panel.style.maxHeight = `${Math.max(1, viewport.height - 32)}px`;
    const layout = popupLayout(anchor.getBoundingClientRect(), { width, height: panel.getBoundingClientRect().height }, viewport, options.align);
    panel.style.left = `${layout.left}px`;
    panel.style.top = `${layout.top}px`;
    panel.style.maxHeight = `${layout.maxHeight}px`;
    panel.dataset.side = layout.side;
    panel._popupAnchor = anchor;
    panel._popupOptions = options;
  }

  function animate(element, frames, duration, finish = () => {}) {
    const previous = element._calculatorAnimation;
    // Invalidate a previous completion before canceling it.
    element._calculatorAnimation = null;
    previous?.cancel();
    if (reducedMotion() || typeof element.animate !== 'function') {
      finish();
      return;
    }
    const animation = element.animate(frames, { duration, easing });
    element._calculatorAnimation = animation;
    animation.finished.then(() => {
      if (element._calculatorAnimation !== animation) return;
      element._calculatorAnimation = null;
      finish();
    }).catch(() => {});
  }

  function showPopup(panel, anchor, options = {}) {
    const opening = panel.hidden || panel.dataset.motion !== 'open';
    panel.hidden = false;
    panel.inert = false;
    panel.dataset.motion = 'open';
    positionPopup(panel, anchor, options);
    if (opening) animate(panel, [
      { opacity: 0, transform: 'translateY(5px) scale(0.98)' },
      { opacity: 1, transform: 'translateY(0) scale(1)' },
    ], 180);
  }

  function hidePopup(panel, finish = () => {}) {
    if (panel.hidden) {
      finish();
      return;
    }
    if (panel.dataset.motion === 'closed') return;
    panel.inert = true;
    panel.dataset.motion = 'closed';
    animate(panel, [
      { opacity: 1, transform: 'translateY(0) scale(1)' },
      { opacity: 0, transform: 'translateY(4px) scale(0.98)' },
    ], 150, () => {
      panel.hidden = true;
      panel._popupAnchor = null;
      finish();
    });
  }

  function revealPanel(panel) {
    if (panel) animate(panel, [{ opacity: 0.45 }, { opacity: 1 }], 180);
  }

  function bindTooltip(wrapper) {
    const trigger = wrapper.querySelector('.help-trigger');
    const panel = wrapper.querySelector('.tooltip');
    const close = wrapper.querySelector('.tooltip-close');
    let leaveTimer;
    let returningFocus = false;
    const clearLeave = () => window.clearTimeout(leaveTimer);
    const open = (pin = false) => {
      clearLeave();
      trigger.setAttribute('aria-expanded', 'true');
      if (pin) wrapper.dataset.pinned = 'true';
      showPopup(panel, trigger);
    };
    const dismiss = (returnFocus = false) => {
      clearLeave();
      trigger.setAttribute('aria-expanded', 'false');
      wrapper.dataset.pinned = 'false';
      hidePopup(panel);
      if (returnFocus) {
        returningFocus = true;
        trigger.focus();
        returningFocus = false;
      }
    };
    wrapper.dataset.pinned = 'false';
    wrapper._closeHelp = dismiss;
    trigger.addEventListener('pointerenter', () => {
      if (window.matchMedia('(hover: hover)').matches) open();
    });
    wrapper.addEventListener('pointerenter', clearLeave);
    wrapper.addEventListener('pointerleave', () => {
      if (wrapper.dataset.pinned !== 'true' && !wrapper.contains(document.activeElement)) {
        leaveTimer = window.setTimeout(() => dismiss(), 140);
      }
    });
    wrapper.addEventListener('focusin', () => { if (!returningFocus) open(); });
    wrapper.addEventListener('focusout', (event) => {
      if (!wrapper.contains(event.relatedTarget) && wrapper.dataset.pinned !== 'true') {
        leaveTimer = window.setTimeout(() => dismiss(), 140);
      }
    });
    trigger.addEventListener('click', () => wrapper.dataset.pinned === 'true' ? dismiss() : open(true));
    close.addEventListener('click', () => dismiss(true));
    wrapper.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !panel.hidden) {
        event.stopPropagation();
        dismiss(true);
      }
    });
  }

  function reflectDisclosure(details, open) {
    if (details.id !== 'breakdown-details') return;
    const button = document.getElementById('breakdown-toggle');
    button?.setAttribute('aria-expanded', String(open));
    const label = document.getElementById('breakdown-toggle-label');
    if (label) label.textContent = open ? 'Hide full breakdown' : 'View full breakdown';
  }

  function resetDisclosure(details) {
    const animation = details._calculatorAnimation;
    details._calculatorAnimation = null;
    animation?.cancel();
    details.open = false;
    details.dataset.motion = 'closed';
    details.style.overflow = '';
    Array.from(details.children).filter((element) => element.tagName !== 'SUMMARY').forEach((element) => { element.inert = true; });
    reflectDisclosure(details, false);
  }

  function bindHoverDisclosure(details) {
    const summary = details.querySelector(':scope > summary');
    let leaveTimer;
    const clearLeave = () => window.clearTimeout(leaveTimer);
    details._clearLeave = clearLeave;
    details.dataset.pinned = 'false';
    summary.addEventListener('pointerenter', () => {
      clearLeave();
      if (window.matchMedia('(hover: hover)').matches) setDisclosure(details, true);
    });
    details.addEventListener('pointerenter', clearLeave);
    const scheduleLeave = () => {
      if (details.dataset.pinned !== 'true' && !details.contains(document.activeElement)) {
        leaveTimer = window.setTimeout(() => setDisclosure(details, false), 140);
      }
    };
    details.addEventListener('pointerleave', scheduleLeave);
    details.addEventListener('focusin', () => { clearLeave(); setDisclosure(details, true); });
    details.addEventListener('focusout', (event) => {
      if (!details.contains(event.relatedTarget)) scheduleLeave();
    });
    details.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        clearLeave();
        setDisclosure(details, false);
      }
    });
  }

  function setDisclosure(details, open) {
    const summary = details.querySelector(':scope > summary');
    if (!summary) return;
    const content = Array.from(details.children).filter((child) => child !== summary);
    reflectDisclosure(details, open);
    const popup = details.matches('.journey-guide, .currency-info');
    if (popup) {
      details._clearLeave?.();
      if (!open) details.dataset.pinned = 'false';
      const panel = content[0];
      details.dataset.motion = open ? 'open' : 'closed';
      if (open) {
        details.open = true;
        showPopup(panel, summary, { width: details.matches('.journey-guide') ? 620 : 300, align: 'end' });
      } else {
        hidePopup(panel, () => { details.open = false; });
      }
      return;
    }
    const start = details.getBoundingClientRect().height;
    details.open = true;
    content.forEach((element) => { element.inert = !open; });
    const end = open ? details.scrollHeight : summary.getBoundingClientRect().height;
    details.style.overflow = 'hidden';
    details.dataset.motion = open ? 'open' : 'closed';
    animate(details, [{ height: `${start}px` }, { height: `${end}px` }], 220, () => {
      details.open = open;
      details.style.overflow = '';
      content.forEach((element) => { element.inert = !open; });
    });
  }

  document.querySelectorAll('.currency-info').forEach(bindHoverDisclosure);

  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-disclosure]');
    if (button) {
      const details = document.getElementById(button.dataset.disclosure);
      if (details && !details.hidden) setDisclosure(details, button.getAttribute('aria-expanded') !== 'true');
      return;
    }
    const summary = event.target.closest('summary');
    const details = summary?.parentElement;
    if (!details || details.tagName !== 'DETAILS') return;
    event.preventDefault();
    if (details.matches('.currency-info')) {
      const pin = details.dataset.pinned !== 'true';
      setDisclosure(details, pin);
      details.dataset.pinned = String(pin);
      return;
    }
    const closing = details.dataset.motion === 'closed' && details.open;
    setDisclosure(details, closing || !details.open);
  });

  let repositionFrame;
  function repositionVisible() {
    if (repositionFrame) return;
    repositionFrame = window.requestAnimationFrame(() => {
      repositionFrame = null;
      document.querySelectorAll('.tooltip, .journey, .currency-note').forEach((panel) => {
        if (panel._popupAnchor && panel.dataset.motion === 'open') positionPopup(panel, panel._popupAnchor, panel._popupOptions);
      });
    });
  }
  window.addEventListener('resize', repositionVisible);
  window.addEventListener('scroll', repositionVisible, true);
  window.visualViewport?.addEventListener('resize', repositionVisible);
  window.visualViewport?.addEventListener('scroll', repositionVisible);

  window.AdMathInteractions = { popupLayout, positionPopup, bindTooltip, setDisclosure, showPopup, hidePopup, revealPanel, resetDisclosure };
})();
