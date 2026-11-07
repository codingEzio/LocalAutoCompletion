# X-LocalAutoCompletion

このソースには語彙データは含まれません。ビルド前に使用・再配布の権利がある対応 CSV を用意してください。[入力の説明](../data/SOURCE.md)。生成したパッケージには語彙が含まれます。

<p><img src="../assets/icon.png" width="96" height="96" alt="X-LocalAutoCompletion"></p>

Visual Studio Code 専用の、高速でプライバシーに配慮した単語補完です。モデル、アカウント、API
キー、ネットワーク接続は必要ありません。

`archive` を含むファイルで `ar` と入力するか、どこでも `th` と入力すると、`archive` や `the`
を候補として表示します。機能はこれだけです。

## できること

- 現在のファイル内のどこかにすでにある単語を補完します。
- 自分の CSV から生成したオフライン語彙も補完候補になります。ファイル内の候補が優先されます。
- 入力中にゴーストテキストを表示します。VS Code の既定の **Trigger Suggest** ショートカット
  `Ctrl+Space` で、順位付けされた候補を最大 8 件表示します。macOS がこのキーの組み合わせを予約
  していない場合にのみ、このショートカットを使用できます。

## できないこと

- 文、次の行、または意味に基づくコード補完は行いません。
- ワークスペースの走査、学習キャッシュ、単語の固定、CJK 専用モードには対応していません。
- クラウドへのリクエスト、テレメトリー、言語モデルは使用しません。

## インストール

[Visual Studio Marketplace からインストール](https://marketplace.visualstudio.com/items?itemName=codingEzio.x-local-auto-completion) ·
[Visual Studio Code で開く](https://vscode.dev/redirect?url=vscode%3Aextension%2FcodingEzio.x-local-auto-completion)

```sh
deno task vocabulary /path/to/authorized.csv
deno task check
deno task package
code --install-extension dist/x-local-auto-completion-0.5.2.vsix
```

更新した VSIX のインストール後に **Developer: Reload Window**
を実行してください。`editor.inlineSuggest.enabled` は有効のままにしてください。

## 設定

```jsonc
{
  "localAutoCompletion.enabled": true,
  "localAutoCompletion.minimumPrefixLength": 2
}
```

## 開発

```sh
deno task check
deno task package
unzip -t dist/x-local-auto-completion-0.5.2.vsix
```

[語彙の出典](../data/SOURCE.md)


```sh
deno task vocabulary /path/to/authorized.csv
deno task check
deno task package
```
