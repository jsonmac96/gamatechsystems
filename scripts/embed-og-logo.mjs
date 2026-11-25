// Regenerates lib/og-logo.ts from public/brand/logo-white.png.
// See the comment in lib/og-logo.ts for why the logo is embedded in code.
import { readFileSync, writeFileSync } from "node:fs";

const target = "lib/og-logo.ts";
const current = readFileSync(target, "utf8");
const b64 = readFileSync("public/brand/logo-white.png").toString("base64");
const next = current.replace(/data:image\/png;base64,[A-Za-z0-9+/=]+/, `data:image/png;base64,${b64}`);
writeFileSync(target, next);
console.log(next === current ? "lib/og-logo.ts already up to date" : "lib/og-logo.ts updated");
