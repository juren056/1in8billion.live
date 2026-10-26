import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  localeFromLanguageTag,
  preferredLocale,
  shouldSkipLanguagePrompt,
  supportedLocales,
} from "../language-preference-core.js";

test("browser language recommendation covers all public locales without treating language as country", () => {
  assert.equal(supportedLocales.length, 10);
  assert.equal(localeFromLanguageTag("ru-RU"), "ru");
  assert.equal(localeFromLanguageTag("zh-Hant-HK"), "zh-TW");
  assert.equal(localeFromLanguageTag("zh-Hans-SG"), "zh-CN");
  assert.equal(localeFromLanguageTag("pt-PT"), "pt-BR");
  assert.equal(localeFromLanguageTag("tr-TR"), null);
  assert.equal(preferredLocale(["ru-RU", "en-US"], "en"), "ru");
  assert.equal(preferredLocale(["en-US", "ru-RU"], "en"), null);
  assert.equal(preferredLocale(["tr-TR", "ru-RU"], "en"), "ru");
});

test("language recommendation stays away from replay and payment-return flows", () => {
  assert(shouldSkipLanguagePrompt("https://1in8billion.live/#run=v6.example"));
  assert(
    shouldSkipLanguagePrompt("https://1in8billion.live/keepsake/success/"),
  );
  assert(shouldSkipLanguagePrompt("https://1in8billion.live/keepsake/cancel/"));
  assert(shouldSkipLanguagePrompt("https://1in8billion.live/?replay=v1"));
  assert.equal(
    shouldSkipLanguagePrompt("https://1in8billion.live/guides/"),
    false,
  );
});

test("language recommendation treats only the active game view as in progress", () => {
  const source = readFileSync("language-preference.js", "utf8");
  assert.match(source, /#view-life\.active,#view-end\.active/);
  assert.doesNotMatch(source, /#view-life:not\(\[hidden\]\)/);
});
