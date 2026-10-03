import { build, transform } from "esbuild";
import { readFile } from "node:fs/promises";

await transform(await readFile(new URL("../styles.css", import.meta.url), "utf8"), { loader: "css" });
await build({
  entryPoints: ["src/currency-select.jsx"],
  outfile: "currency-select.js",
  bundle: true,
  minify: true,
  format: "iife",
  target: ["es2020"],
  define: { "process.env.NODE_ENV": '"production"' },
  legalComments: "linked",
});
