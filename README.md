# X-LocalAutoCompletion

**Source-only candidate:** no vocabulary is included. Before building, provide an authorized compatible CSV; see [input and redistribution requirements](data/SOURCE.md). The generated VSIX contains that vocabulary. The Marketplace link refers to the separately published product, not this source candidate.

<p><img src="assets/icon.png" width="96" height="96" alt="X-LocalAutoCompletion"></p>

Private, instant word completion for Visual Studio Code. No model, account, API key, or network.

Type `ar` in a file that contains `archive`, or type `th` anywhere: it can offer `archive` or `the`.
That is the whole product.

[Try the 90-second demo](docs/DEMO.md#english).

[繁體中文](docs/README.zh-TW.md) · [简体中文](docs/README.zh-CN.md) · [한국어](docs/README.ko.md) ·
[日本語](docs/README.ja.md) · [Español](docs/README.es.md) · [Русский](docs/README.ru.md) ·
[Українська](docs/README.uk.md)

### What it does

- Completes words that already appear **anywhere in the current file**.
- Completes from the offline vocabulary generated from your CSV. File matches rank first.
- Shows ghost text while typing. **Trigger Suggest** lists up to eight ranked choices; its default
  VS Code shortcut is `Ctrl+Space` when macOS does not reserve that shortcut.

### What it does not do

- No sentence, next-line, or semantic code completion.
- No workspace crawler, learning cache, pinned words, or CJK-specific mode.
- No cloud request, telemetry, or language model.

### Install

[Install from Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=codingEzio.x-local-auto-completion) ·
[Open in Visual Studio Code](https://vscode.dev/redirect?url=vscode%3Aextension%2FcodingEzio.x-local-auto-completion)

```sh
deno task vocabulary /path/to/authorized.csv
deno task check
deno task package
code --install-extension dist/x-local-auto-completion-0.5.2.vsix
```

Use **Developer: Reload Window** after installing an updated VSIX. `editor.inlineSuggest.enabled`
must stay on.

### Configure

```jsonc
{
  "localAutoCompletion.enabled": true,
  "localAutoCompletion.minimumPrefixLength": 2
}
```

### Development

```sh
deno task check
deno task package
unzip -t dist/x-local-auto-completion-0.5.2.vsix
```

[Vocabulary sources](data/SOURCE.md) · [Changelog](CHANGELOG.md)

### Local maintenance

Deno 2 and native zip/unzip are required. Run `deno task vocabulary` before checks or packaging. The source input and generated vocabulary may have separate rights; the generated VSIX includes the vocabulary. See [input and redistribution requirements](data/SOURCE.md).
