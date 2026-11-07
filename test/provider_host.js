export class Position {
  constructor(line, character) {
    this.line = line;
    this.character = character;
  }
  translate(line, character) {
    return new Position(this.line + line, this.character + character);
  }
}
export class Range {
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }
  isEqual(other) {
    return this.start.line === other.start.line && this.start.character === other.start.character &&
      this.end.line === other.end.line && this.end.character === other.end.character;
  }
}
export function documentFor(text, languageId = "plaintext") {
  const starts = [0];
  for (let i = 0; i < text.length; i++) if (text[i] === "\n") starts.push(i + 1);
  const document = {
    uri: { scheme: "file", toString: () => "file:///synthetic/fixture.txt" },
    version: 1,
    languageId,
    lineCount: starts.length,
    offsetAt: (position) => starts[position.line] + position.character,
    positionAt(offset) {
      let low = 0, high = starts.length;
      while (low + 1 < high) {
        const mid = (low + high) >>> 1;
        if (starts[mid] <= offset) low = mid;
        else high = mid;
      }
      return new Position(low, offset - starts[low]);
    },
    lineAt(line) {
      const value = text.slice(
        starts[line],
        line + 1 < starts.length ? starts[line + 1] - 1 : text.length,
      );
      return {
        text: value,
        range: new Range(new Position(line, 0), new Position(line, value.length)),
      };
    },
    getText(range) {
      return range ? text.slice(this.offsetAt(range.start), this.offsetAt(range.end)) : text;
    },
  };
  return { document, position: document.positionAt(text.length) };
}
export async function providerFor(root, options = {}) {
  const modules = new Map();
  for (const name of ["engine", "english"]) {
    const module = { exports: {} };
    new Function("require", "module", await Deno.readTextFile(`${root}/src/${name}.js`))(
      (name) => modules.get(name.replace("./", "")),
      module,
    );
    modules.set(name, module.exports);
  }
  const metadata = JSON.parse(await Deno.readTextFile(`${root}/package.json`));
  const defaults = Object.fromEntries(
    Object.entries(metadata.contributes.configuration.properties).map((
      [key, value],
    ) => [key.replace("localAutoCompletion.", ""), value.default]),
  );
  const configuration = { ...defaults, ...options.configuration };
  const registrations = {};
  const vscode = {
    Position,
    Range,
    InlineCompletionTriggerKind: { Invoke: 0, Automatic: 1 },
    CompletionTriggerKind: { Invoke: 0, TriggerCharacter: 1, TriggerForIncompleteCompletions: 2 },
    InlineCompletionItem: class {
      constructor(insertText, range, command) {
        Object.assign(this, { insertText, range, command });
      }
    },
    CompletionItem: class {
      constructor(label) {
        this.label = label;
      }
    },
    CompletionItemKind: { Text: 0 },
    workspace: {
      getConfiguration: (namespace) => ({
        get: (name, fallback) =>
          namespace === "editor"
            ? (options.editor?.[name] ?? fallback)
            : (configuration[name] ?? fallback),
      }),
    },
    languages: {
      registerInlineCompletionItemProvider: (_selector, provider) => {
        registrations.inline = provider;
        return { dispose() {} };
      },
      registerCompletionItemProvider: (_selector, provider) => {
        registrations.menu = provider;
        return { dispose() {} };
      },
    },
  };
  const module = { exports: {} };
  const dictionary = [["the", 1], ["aberration", 200001]];
  new Function("require", "module", await Deno.readTextFile(`${root}/extension.js`))(
    (name) =>
      name === "vscode"
        ? vscode
        : name === "./data/english.json"
        ? dictionary
        : modules.get(name.replace("./src/", "")),
    module,
  );
  module.exports.activate({ subscriptions: [] });
  return {
    ...registrations,
    request(fixture, context = { triggerKind: 1 }, token = { isCancellationRequested: false }) {
      return registrations.inline.provideInlineCompletionItems(
        fixture.document,
        fixture.position,
        context,
        token,
      );
    },
  };
}
