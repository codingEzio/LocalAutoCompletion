const vscode = require("vscode");
const { characterCount, indexText, suggest, wordBefore } = require("./src/engine");
const { createVocabularyLookup } = require("./src/english");

const documents = [
  { scheme: "file" },
  { scheme: "untitled" },
  { scheme: "vscode-remote" },
];

function integer(configuration, name, fallback, minimum, maximum) {
  const value = configuration.get(name, fallback);
  if (!Number.isFinite(value)) {
    return fallback;
  }
  return Math.min(maximum, Math.max(minimum, Math.floor(value)));
}

function activate(context) {
  const englishWordsFor = createVocabularyLookup(() => require("./data/english.json"));
  englishWordsFor.preload();
  const indexes = new Map();

  function fileWordsFor(document) {
    const key = document.uri.toString();
    const cached = indexes.get(key);
    if (cached && cached.version === document.version) {
      return cached.words;
    }
    const words = indexText(document.getText());
    indexes.set(key, { version: document.version, words });
    return words;
  }

  function suggestionsAt(document, position, token, configuration, limit, requiredPrefix) {
    if (token.isCancellationRequested || !configuration.get("enabled", true)) {
      return undefined;
    }

    const lineBeforeCursor = document.lineAt(position.line).text.slice(0, position.character);
    const prefix = wordBefore(lineBeforeCursor);
    const minimumPrefixLength = integer(configuration, "minimumPrefixLength", 2, 1, 6);
    if (characterCount(prefix) < minimumPrefixLength) {
      return undefined;
    }

    return {
      prefix,
      range: new vscode.Range(position.translate(0, -prefix.length), position),
      candidates: suggest(prefix, {
        fileWords: fileWordsFor(document),
        dictionaryWords: englishWordsFor(prefix),
        limit,
        requiredPrefix,
      }),
    };
  }

  function inlineSuggestionsEnabled(document) {
    return vscode.workspace.getConfiguration("editor", document.uri)
      .get("inlineSuggest.enabled", true);
  }

  const inlineProvider = {
    provideInlineCompletionItems(document, position, inlineContext, token) {
      const configuration = vscode.workspace.getConfiguration(
        "localAutoCompletion",
        document.uri,
      );
      if (!inlineSuggestionsEnabled(document)) {
        return [];
      }

      const limit = inlineContext.triggerKind === vscode.InlineCompletionTriggerKind.Invoke ? 8 : 1;
      const selected = inlineContext.selectedCompletionInfo;
      const request = suggestionsAt(
        document,
        position,
        token,
        configuration,
        limit,
        selected?.text,
      );
      if (!request) {
        return [];
      }
      if (selected && !request.range.isEqual(selected.range)) return [];
      return request.candidates.map(({ word }) => {
        const item = new vscode.InlineCompletionItem(word, request.range);
        item.filterText = request.prefix + word.slice(request.prefix.length);
        return item;
      });
    },
  };

  const menuProvider = {
    provideCompletionItems(document, position, token, completionContext) {
      const configuration = vscode.workspace.getConfiguration(
        "localAutoCompletion",
        document.uri,
      );
      if (completionContext.triggerKind !== vscode.CompletionTriggerKind.Invoke) {
        return [];
      }

      const request = suggestionsAt(document, position, token, configuration, 8);
      if (!request) {
        return [];
      }

      return request.candidates.map((candidate, index) => {
        const item = new vscode.CompletionItem(candidate.word, vscode.CompletionItemKind.Text);
        item.range = request.range;
        item.filterText = candidate.word;
        item.sortText = `${String(index).padStart(2, "0")}-${candidate.word.toLocaleLowerCase()}`;
        item.detail = candidate.fileCount > 0
          ? "X-LocalAutoCompletion · this file"
          : "X-LocalAutoCompletion · English";
        return item;
      });
    },
  };

  context.subscriptions.push(
    vscode.languages.registerInlineCompletionItemProvider(documents, inlineProvider),
    vscode.languages.registerCompletionItemProvider(documents, menuProvider),
  );
  if (typeof vscode.workspace.onDidCloseTextDocument === "function") {
    context.subscriptions.push(
      vscode.workspace.onDidCloseTextDocument((document) => {
        indexes.delete(document.uri.toString());
      }),
    );
  }
}

function deactivate() {}

module.exports = { activate, deactivate };
