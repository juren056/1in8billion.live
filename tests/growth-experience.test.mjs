import test from "node:test";
import assert from "node:assert/strict";
import { latestNarrative } from "../growth-copy.js";
test("story focus includes family narratives even when the engine milestone pointer is empty", () => {
  const life = {
      age: 2,
      latestEvent: null,
      log: [
        { age: 0, kind: "birth", text: "event.birth" },
        { age: 2, kind: "family", text: "Father was conscripted" },
        { age: 2, kind: "focus", text: "Focus: study" },
      ],
    },
    before = JSON.stringify(life);
  assert.equal(latestNarrative(life).text, "Father was conscripted");
  assert.equal(JSON.stringify(life), before);
  assert.equal(
    latestNarrative({
      age: 0,
      log: [{ age: 0, text: "event.birth", kind: "birth" }],
    }),
    null,
  );
});
