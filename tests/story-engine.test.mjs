import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createStoryEngine, livingPeople } from "../story-engine.js";
import { catalog } from "../content/story/catalog-source.mjs";
import { decisions } from "../content/story/decisions-source.mjs";
const dictionary = JSON.parse(fs.readFileSync("content/story/locales/en.json"));
const engine = createStoryEngine({ catalog, decisions, dictionary });
const make = () => ({
  rulesVersion: 3,
  year: 2026,
  age: 0,
  name: { full: "Test" },
  replayV1: { seed: "repeatable", eligible: true },
  stats: {
    health: 100,
    happiness: 99,
    knowledge: 99,
    social: 50,
    employment: "none",
  },
  log: [],
  family: {
    parents: [
      { id: "parent", name: "P", birth: { year: 1990 }, death: { year: 2066 } },
    ],
  },
});
test("all 160 narratives and 12 decisions have complete ten-language copy and mapped scene contracts", () => {
  assert.equal(catalog.length, 160);
  for (const e of catalog) {
    assert(e.min >= 1 && e.max >= e.min);
    assert(e.scene && e.interaction && e.cooldown >= 8);
  }
  const keys = Object.keys(dictionary).sort();
  for (const lang of [
    "en",
    "zh-CN",
    "zh-TW",
    "ja",
    "ko",
    "es",
    "pt-BR",
    "fr",
    "de",
    "ru",
  ]) {
    const d = JSON.parse(
      fs.readFileSync("content/story/locales/" + lang + ".json"),
    );
    assert.deepEqual(Object.keys(d).sort(), keys);
    assert(
      Object.values(d).every(
        (x) => typeof x === "string" && x.trim() && !x.includes("[[["),
      ),
    );
  }
  for (const d of decisions) {
    assert(d.options.length >= 2 && d.options.length <= 4);
    assert(d.followAge > d.age);
  }
});
test("new stories enforce age, employment, living people, cooldown and deterministic independent selection", () => {
  for (let seed = 0; seed < 1000; seed++) {
    const a = make(),
      b = make();
    a.replayV1.seed = b.replayV1.seed = String(seed);
    for (let age = 1; age <= 110; age++) {
      a.age = b.age = age;
      const x = engine.year(a),
        y = engine.year(b);
      assert.deepEqual(x, y);
      assert.deepEqual(engine.year(a), x);
      if (!x) continue;
      const c = catalog.find((e) => e.id === x.eventId);
      assert(age >= c.min && age <= c.max);
      assert.notEqual(c.category, "work");
      if (age < 5) assert.equal(c.category, "childhood");
      if (age >= 40) assert.notEqual(c.category, "family");
      const h = a.storyHistory.filter((e) => e.id === x.eventId);
      if (h.length > 1) assert(age - h.at(-2).age >= c.cooldown);
    }
  }
});
test("choices clamp actual changes, resolve once, preserve default replay and store real followups", () => {
  const life = make();
  life.age = 2;
  engine.afterYear(life, 1, engine.values(life.stats));
  assert.equal(engine.pending(life).id, "choice.1");
  assert.equal(engine.resolve(life, 999), false);
  const c = engine.resolve(life, 0);
  assert.deepEqual(c.effects, { knowledge: 1 });
  assert.equal(life.stats.knowledge, 100);
  assert.equal(engine.resolve(life, 0), false);
  assert.equal(life.replayV1.eligible, false);
  life.age = 4;
  engine.afterYear(life, 3, engine.values(life.stats));
  assert(life.log.some((e) => e.linkedEventId === "choice.1"));
  const auto = make();
  auto.age = 2;
  engine.afterYear(auto, 1, engine.values(auto.stats));
  engine.resolve(auto, 2, { automatic: true });
  assert.equal(auto.replayV1.eligible, true);
});
test("scheduled relatives remain alive until actual year and old records are never rewritten", () => {
  const life = make();
  life.age = 39;
  assert.equal(livingPeople(life).length, 1);
  engine.afterYear(life, 38, engine.values(life.stats));
  assert(!life.log.some((e) => e.eventId?.startsWith("family.death")));
  life.age = 40;
  engine.afterYear(life, 39, engine.values(life.stats));
  assert.equal(livingPeople(life).length, 0);
  assert.equal(
    life.log.filter((e) => e.eventId === "family.death.parent").length,
    1,
  );
  engine.afterYear(life, 39, engine.values(life.stats));
  assert.equal(
    life.log.filter((e) => e.eventId === "family.death.parent").length,
    1,
  );
  const legacy = { ...make(), rulesVersion: undefined };
  const before = JSON.stringify(legacy);
  engine.afterYear(legacy, -1, {});
  assert.equal(JSON.stringify(legacy), before);
});
