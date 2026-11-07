# X-LocalAutoCompletion

此來源不含詞表。建置前請提供有權使用及再散布的相容 CSV；詳見[輸入說明](../data/SOURCE.md)。產生的安裝套件會包含詞表。

<p><img src="../assets/icon.png" width="96" height="96" alt="X-LocalAutoCompletion"></p>

在目前檔案與內建離線英文詞彙中，快速、私密地補全單字。僅適用於 Visual Studio
Code；不需要模型、帳號、API 金鑰或網路連線。

例如，在含有 `archive` 的檔案中輸入 `ar`，或在任何位置輸入 `th`，就可能看到 `archive` 或
`the`。這就是本產品的全部功能。

[試用 90 秒示範](DEMO.md#繁體中文)。

## 功能

- 從**目前檔案的任何位置**找出已出現的單字並提供補全。
- 也使用由自備 CSV 產生的離線詞表；檔案中的匹配結果優先。
- 輸入時顯示行內建議文字。按 VS Code 預設的 `Ctrl+Space` 快捷鍵（僅在 macOS
  未保留此快捷鍵時適用）觸發 **Trigger Suggest**，可列出最多八個依排名排列的候選項。

## 不提供的功能

- 不提供句子、下一行或語意程式碼補全。
- 不會掃描工作區，也沒有學習快取、固定詞彙或 CJK 專用模式。
- 不會連線至雲端，也沒有遙測或語言模型。

## 安裝

[從 Visual Studio Marketplace 安裝](https://marketplace.visualstudio.com/items?itemName=codingEzio.x-local-auto-completion) ·
[在 Visual Studio Code 中開啟](https://vscode.dev/redirect?url=vscode%3Aextension%2FcodingEzio.x-local-auto-completion)

```sh
deno task vocabulary /path/to/authorized.csv
deno task check
deno task package
code --install-extension dist/x-local-auto-completion-0.5.2.vsix
```

安裝或更新 VSIX 後，請執行 **Developer: Reload Window**。`editor.inlineSuggest.enabled`
必須保持開啟。

## 設定

```jsonc
{
  "localAutoCompletion.enabled": true,
  "localAutoCompletion.minimumPrefixLength": 2
}
```

## 開發

```sh
deno task check
deno task package
unzip -t dist/x-local-auto-completion-0.5.2.vsix
```

[詞彙來源](../data/SOURCE.md)。


```sh
deno task vocabulary /path/to/authorized.csv
deno task check
deno task package
```
