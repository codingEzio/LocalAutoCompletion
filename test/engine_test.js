await import("../src/engine.js");

const {
  characterCount,
  indexText,
  suggest,
  wordBefore,
  wordsInText,
} = globalThis.LocalAutoCompletionEngine;

function equal(actual, expected, message) {
  const actualJSON = JSON.stringify(actual);
  const expectedJSON = JSON.stringify(expected);
  if (actualJSON !== expectedJSON) {
    throw new Error(`${message}\nexpected: ${expectedJSON}\nactual:   ${actualJSON}`);
  }
}

Deno.test("finds a repeated file word from a short prefix", () => {
  const text = "#inbox archive\n#inbox active\n#inbox archive\nar";
  const words = suggest("ar", { text }).map(({ word }) => word);
  equal(words, ["archive"], "archive should be offered for ar");
});

Deno.test("does not echo the prefix back as a completion", () => {
  const words = suggest("ar", { text: "archive ar" }).map(({ word }) => word);
  equal(words, ["archive"], "a completion must add text beyond the prefix");
});

Deno.test("prefers the same casing when it is available", () => {
  const words = suggest("Ar", { text: "archive Archive Ar" }).map(({ word }) => word);
  equal(words, ["Archive"], "Archive should beat lower-case archive for Ar");
});

Deno.test("a more frequent file word ranks first", () => {
  const words = suggest("ar", { text: "array array arrival ar" }).map(({ word }) => word);
  equal(words, ["array"], "frequency in the file should lead");
});

Deno.test("returns a ranked set when choices are explicitly requested", () => {
  const words = suggest("ar", {
    text: "arrow array ar",
    dictionaryWords: [{ word: "archive", rank: 1 }],
    limit: 3,
  }).map(({ word }) => word);
  equal(words, ["array", "arrow", "archive"], "file words lead English");
});

Deno.test("keeps code-style words intact", () => {
  equal(
    wordsInText("payment_impact payment_imp").map(({ word }) => word),
    ["payment_impact", "payment_imp"],
    "underscored identifiers should remain intact",
  );
  equal(characterCount("归档"), 2, "visible CJK length still counts characters");
});

Deno.test("keeps file casing when English has the same word in typed case", () => {
  const words = suggest("scr", {
    text: "Scratch Pad\nscr",
    dictionaryWords: [{ word: "scratch", rank: 1 }],
  }).map(({ word }) => word);
  equal(words, ["Scratch"], "the file's spelling should remain");
});

Deno.test("English is a fallback behind file words, even across casing", () => {
  const words = suggest("ar", {
    text: "Architecture Ar",
    dictionaryWords: [{ word: "arc", rank: 1 }],
    limit: 8,
  }).map(({ word }) => word);
  equal(words, ["Architecture", "arc"], "the file match must lead");
});

Deno.test("tail scanning preserves long identifiers, surrogate boundaries and empty input", () => {
  for (const word of ["a".repeat(1025), "𐐀".repeat(257), "short_word-2"]) {
    equal(wordBefore("other " + word), word, "whole trailing token");
    equal(wordBefore(word + " "), "", "trailing delimiter");
  }
  equal(wordBefore(""), "", "empty regular text");
});

Deno.test("selected text is applied before the candidate limit", () => {
  const text = "Scrape ".repeat(20) + "Scratchpad Scr";
  equal(
    suggest("Scr", { text, limit: 1, requiredPrefix: "Scratch" }).map((c) => c.word),
    ["Scratchpad"],
    "compatible candidate survives",
  );
});

Deno.test("a distant file word is still in the index", () => {
  const text = "archive\n" + "other\n".repeat(400) + "ar";
  const words = indexText(text);
  equal(
    suggest("ar", { fileWords: words }).map(({ word }) => word),
    ["archive"],
    "whole-file index must retain the distant token",
  );
});
