import data from "../data/english.json" with { type: "json" };
await import("../src/english.js");
const { createVocabularyLookup } = globalThis.LocalAutoCompletionEnglish;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

Deno.test("English vocabulary loads common words and exam-only words once", () => {
  let loads = 0;
  const lookup = createVocabularyLookup(() => {
    loads++;
    return [["the", 1], ["thread", 800], ["abate", 20010]];
  });
  assert(lookup("归").length === 0, "skip non-English prefixes");
  assert(lookup("th").map(({ word }) => word).join(",") === "the,thread", "prefix order");
  assert(lookup("th")[0].rank === 1, "keep frequency rank");
  assert(lookup("TH")[0].word === "THE", "preserve uppercase");
  assert(lookup("Th")[0].word === "The", "preserve title case");
  assert(lookup("the").length === 0, "do not echo a complete word");
  assert(lookup("zzzz").length === 0, "missing prefix should be empty");
  lookup.preload();
  assert(loads === 1, "reuse the loaded vocabulary");
});

Deno.test("bundled vocabulary includes common English and extra exam words", () => {
  assert(data.length > 0, "generated vocabulary must not be empty");
  const keys = new Set();
  for (const [word, rank] of data) {
    assert(/^[A-Za-z]+(?:-[A-Za-z]+)*$/.test(word), `invalid word: ${word}`);
    assert(Number.isInteger(rank) && rank > 0, `invalid rank: ${word}`);
    assert(!keys.has(word.toLowerCase()), `duplicate: ${word}`);
    keys.add(word.toLowerCase());
  }
});
