import { documentFor, Position, providerFor, Range } from "./provider_host.js";

function equal(actual, expected) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

Deno.test("a word anywhere in the file completes, not only nearby lines", async () => {
  const p = await providerFor(".");
  const f = documentFor("Scratch Pad\n" + "other\n".repeat(251) + "Scr");
  equal((await p.request(f)).map((x) => x.insertText), ["Scratch"]);
});

Deno.test("English fills when the file has no longer match", async () => {
  const p = await providerFor(".");
  equal((await p.request(documentFor("th"))).map((x) => x.insertText), ["the"]);
});

Deno.test("a file word beats a more common English word", async () => {
  const p = await providerFor(".");
  equal((await p.request(documentFor("threadCount\nth"))).map((x) => x.insertText), [
    "threadCount",
  ]);
});

Deno.test("selected menu text filters candidates before picking the automatic inline result", async () => {
  const p = await providerFor(".");
  const f = documentFor("Scratchpad Scrape\nScr");
  const range = new Range(new Position(1, 0), new Position(1, 3));
  equal(
    (await p.request(f, { triggerKind: 1, selectedCompletionInfo: { text: "Scratch", range } }))
      .map((x) => x.insertText),
    ["Scratchpad"],
  );
});

Deno.test("case-insensitive matches provide a filter compatible with the typed prefix", async () => {
  const p = await providerFor(".");
  const f = documentFor("Scratch Pad\nscr");
  const [item] = await p.request(f);
  equal(item.insertText, "Scratch");
  if (!(item.filterText ?? item.insertText).startsWith("scr")) {
    throw new Error("the editor can suppress this differently-cased candidate");
  }
});

Deno.test("missing suggestions have reproducible prefix and setting boundaries", async () => {
  const p = await providerFor(".");
  equal((await p.request(documentFor("Scratch Pad\nScr"))).map((x) => x.insertText), ["Scratch"]);
  equal(await p.request(documentFor("Scratch Pad\nScratch")), []);
  equal(await p.request(documentFor("Scratch Pad\nS")), []);
  equal(
    await p.request(documentFor("Scratch Pad\nScr"), { triggerKind: 1 }, {
      isCancellationRequested: true,
    }),
    [],
  );
  const disabled = await providerFor(".", { editor: { "inlineSuggest.enabled": false } });
  equal(await disabled.request(documentFor("Scratch Pad\nScr")), []);
});

Deno.test("incompatible menu replacement ranges do not produce invalid inline items", async () => {
  const p = await providerFor(".");
  const f = documentFor("Scratchpad\nScr");
  equal(
    await p.request(f, {
      triggerKind: 1,
      selectedCompletionInfo: {
        text: "Scratch",
        range: new Range(new Position(1, 1), new Position(1, 3)),
      },
    }),
    [],
  );
});
