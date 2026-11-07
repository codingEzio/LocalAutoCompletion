// Generate a vocabulary locally from an explicitly supplied compatible CSV.
const wordPattern = /^[A-Za-z]+(?:-[A-Za-z]+)*$/;
const examTags = new Set(["gre", "ielts", "toefl"]);

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < text.length; index++) {
    const character = text[index];
    if (character === '"') {
      if (quoted && text[index + 1] === '"') {
        field += '"';
        index++;
      } else {
        quoted = !quoted;
      }
    } else if (!quoted && (character === "," || character === "\n" || character === "\r")) {
      row.push(field);
      field = "";
      if (character !== ",") {
        if (character === "\r" && text[index + 1] === "\n") index++;
        rows.push(row);
        row = [];
      }
    } else {
      field += character;
    }
  }
  if (quoted) throw new Error("Unclosed CSV quote");
  if (field || row.length) rows.push([...row, field]);
  return rows;
}

export function buildVocabulary(rows: string[][], commonLimit = 10_000): [string, number][] {
  const [header, ...data] = rows;
  const wordColumn = header?.indexOf("word") ?? -1;
  const tagColumn = header?.indexOf("tag") ?? -1;
  const frequencyColumn = header?.indexOf("frq") ?? -1;
  if (wordColumn < 0 || tagColumn < 0 || frequencyColumn < 0) {
    throw new Error("CSV source is missing word, tag, or frq");
  }

  const entries = new Map<string, { word: string; frequency: number; exam: boolean }>();
  for (const row of data) {
    const word = row[wordColumn] ?? "";
    if (!wordPattern.test(word)) continue;
    const key = word.toLowerCase();
    const frequency = Number(row[frequencyColumn]) || Number.POSITIVE_INFINITY;
    const exam = (row[tagColumn] ?? "").split(" ").some((tag) => examTags.has(tag));
    const current = entries.get(key);
    if (current) {
      current.frequency = Math.min(current.frequency, frequency);
      current.exam ||= exam;
      if (word === key) current.word = word;
    } else {
      entries.set(key, { word: word === key ? word : key, frequency, exam });
    }
  }

  const common = [...entries.values()]
    .filter(({ frequency }) => Number.isFinite(frequency))
    .sort((left, right) => left.frequency - right.frequency || left.word.localeCompare(right.word))
    .slice(0, commonLimit);
  const ranks = new Map(common.map(({ word }, index) => [word.toLowerCase(), index + 1]));
  const extras = [...entries.values()]
    .filter(({ word, exam }) => exam && !ranks.has(word.toLowerCase()))
    .sort((left, right) => left.word.localeCompare(right.word));
  extras.forEach(({ word }, index) => ranks.set(word.toLowerCase(), 200_001 + index));

  return [...ranks]
    .map(([word, rank]) => [word, rank] as [string, number])
    .sort(([left], [right]) => left.localeCompare(right));
}

if (import.meta.main) {
  const input = Deno.args[0];
  if (!input) {
    throw new Error("Usage: deno task vocabulary PATH_TO_AUTHORIZED_CSV");
  }
  const bytes = await Deno.readFile(input);
  const digest = [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))]
    .map((byte) => byte.toString(16).padStart(2, "0")).join("");

  const entries = buildVocabulary(parseCsv(new TextDecoder().decode(bytes)));
  const output = `[\n${entries.map((entry) => `  ${JSON.stringify(entry)}`).join(",\n")}\n]\n`;
  if (!entries.length) throw new Error("Input contains no usable ranked or exam-tagged words");
  const resultHash = [
    ...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(output))),
  ]
    .map((byte) => byte.toString(16).padStart(2, "0")).join("");
  await Deno.writeTextFile(new URL("../data/english.json", import.meta.url), output);
  await Deno.writeTextFile(
    new URL("../data/vocabulary-receipt.json", import.meta.url),
    JSON.stringify({ schemaVersion: 1, sourceSHA256: digest, outputSHA256: resultHash }, null, 2) +
      "\n",
  );
  console.log(`${entries.length} words; source SHA-256 ${digest}; output SHA-256 ${resultHash}`);
}
