import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("homepage keeps the game entry stable while each theme uses its own real-photo memory stack", () => {
  const entry = readFileSync("game-entry.js", "utf8");
  const entryCss = readFileSync("game-entry.css", "utf8");
  const home = readFileSync("dist/index.html", "utf8");
  const themeCss = readFileSync("dist/theme-system.css", "utf8");

  assert.doesNotMatch(entry, /game-lobby|replaceWith\(|entry_demo_choice/);
  assert.doesNotMatch(entryCss, /game-lobby|lobby-scene|lobby-mobile-person/);
  assert.match(home, /class="theme-book theme-memory-stack"/);
  assert.equal((home.match(/data-theme-memory-card/g) || []).length, 3);
  assert.match(home, /memory-night-station\.avif/);
  assert.match(home, /memory-blue-bike\.avif/);
  assert.doesNotMatch(home, /keepsake\/thumbnails\//);
  assert.doesNotMatch(home, /rebirth\/thumbs\/lake-home\.webp/);
  assert.match(themeCss, /\[data-appearance=journal\] \.theme-book/);
  assert.match(themeCss, /\[data-appearance=editorial\] \.theme-book/);
  assert.match(themeCss, /\[data-appearance=night\] \.theme-book/);
});
