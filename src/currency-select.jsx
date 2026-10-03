import React, { useLayoutEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import * as Select from "@radix-ui/react-select";

const currencies = [
  ["USD", "$", "US Dollar"],
  ["BDT", "৳", "Bangladeshi Taka"],
  ["AUD", "A$", "Australian Dollar"],
  ["CAD", "C$", "Canadian Dollar"],
  ["GBP", "£", "British Pound"],
  ["EUR", "€", "Euro"],
  ["INR", "₹", "Indian Rupee"],
];

function Chevron({ up = false }) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d={up ? "m6 15 6-6 6 6" : "m6 9 6 6 6-6"} /></svg>;
}

function CurrencyPicker({ nativeSelect, label, currencyMode = false }) {
  const readOptions = () => Array.from(nativeSelect.options, (option) => [option.value, option.textContent, ""]);
  const [options, setOptions] = useState(currencyMode ? currencies : readOptions());
  const [value, setValue] = useState(nativeSelect.value);
  const selected = options.find(([code]) => code === value) ?? options[0];
  const triggerId = `${nativeSelect.id}-trigger`;

  useLayoutEffect(() => {
    const sync = () => {
      setValue(nativeSelect.value);
      if (!currencyMode) setOptions(readOptions());
    };
    const observer = new MutationObserver(sync);
    observer.observe(nativeSelect, { childList: true, subtree: true, characterData: true });
    nativeSelect.addEventListener("change", sync);
    window.addEventListener("calculator:currency", sync);
    nativeSelect.hidden = true;
    label.htmlFor = triggerId;
    return () => {
      nativeSelect.removeEventListener("change", sync);
      window.removeEventListener("calculator:currency", sync);
      observer.disconnect();
      nativeSelect.hidden = false;
      label.htmlFor = nativeSelect.id;
    };
  }, [nativeSelect, label, currencyMode]);

  const choose = (nextValue) => {
    setValue(nextValue);
    nativeSelect.value = nextValue;
    nativeSelect.dispatchEvent(new Event("change", { bubbles: true }));
  };

  return (
    <Select.Root value={value} onValueChange={choose}>
      <Select.Trigger id={triggerId} className={`currency-trigger${currencyMode ? "" : " starter-trigger"}`} aria-labelledby={currencyMode ? "currency-label" : nativeSelect.id === "starter-market" ? "starter-market-label" : "starter-industry-label"} aria-describedby={currencyMode ? "currency-help" : undefined}>
        <Select.Value>{currencyMode ? `${selected[0]} ${selected[1]}` : selected?.[1]}</Select.Value>
        <Select.Icon className="currency-chevron"><Chevron /></Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className={`currency-menu${currencyMode ? "" : " starter-menu"}`} position="popper" sideOffset={8} align="end" collisionPadding={16} avoidCollisions>
          <Select.ScrollUpButton className="currency-scroll"><Chevron up /></Select.ScrollUpButton>
          <Select.Viewport className="currency-viewport">
            {options.map(([code, symbol, name]) => (
              <Select.Item className="currency-option" value={code} key={code}>
                <Select.ItemText>{currencyMode ? <><span className="currency-code">{code} {symbol}</span><span className="currency-name">{name}</span></> : symbol}</Select.ItemText>
                <Select.ItemIndicator className="currency-check"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m5 12 4 4 10-10" /></svg></Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
          <Select.ScrollDownButton className="currency-scroll"><Chevron /></Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

for (const [id, hostId, labelId, currencyMode] of [
  ["currency-select", "currency-picker", "currency-label", true],
  ["starter-market", "starter-market-picker", "starter-market-wrap", false],
  ["starter-industry", "starter-industry-picker", "starter-industry-control", false],
]) {
  const host = document.getElementById(hostId);
  const nativeSelect = document.getElementById(id);
  const label = document.getElementById(labelId);
  if (host && nativeSelect && label) {
    flushSync(() => createRoot(host).render(<CurrencyPicker nativeSelect={nativeSelect} label={label} currencyMode={currencyMode} />));
  }
}
