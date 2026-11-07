import { buildVocabulary, parseCsv } from "../scripts/import-vocabulary.ts";

function equal(actual: unknown, expected: unknown) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

Deno.test("builds common and exam vocabulary from the reviewed ECDICT fields", () => {
  const rows = parseCsv(
    "word,tag,bnc,frq\r\n" +
      "archive,gre,40,20\r\n" +
      "the,,1,1\r\n" +
      "zebra,toefl,30,0\r\n" +
      "two words,ielts,2,2\r\n" +
      "Archive,ielts,50,10\r\n",
  );

  equal(buildVocabulary(rows, 2), [
    ["archive", 2],
    ["the", 1],
    ["zebra", 200001],
  ]);
});

Deno.test("CSV parser preserves quoted commas and newlines", () => {
  equal(parseCsv('word,definition,frq\nentry,"first, second\nthird",7\n'), [
    ["word", "definition", "frq"],
    ["entry", "first, second\nthird", "7"],
  ]);
});

Deno.test("restricted Google corpus derivative is absent", async () => {
  try {
    await Deno.stat(new URL("../data/google-10000-english-usa.txt", import.meta.url));
    throw new Error("restricted vocabulary source must not be present");
  } catch (error) {
    if (!(error instanceof Deno.errors.NotFound)) throw error;
  }
});
