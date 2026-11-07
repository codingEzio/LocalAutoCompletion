# X-LocalAutoCompletion

此源码不含词表。构建前请提供有权使用及再分发的兼容 CSV；详见[输入说明](../data/SOURCE.md)。生成的安装包会包含词表。

<p><img src="../assets/icon.png" width="96" height="96" alt="X-LocalAutoCompletion"></p>

从当前文件和内置离线英文词汇中快速、私密地补全单词。仅适用于 Visual Studio Code；无需模型、账户、API
密钥或网络连接。

例如，在包含 `archive` 的文件中输入 `ar`，或在任意位置输入 `th`，就可能看到 `archive` 或
`the`。这就是本产品的全部功能。

[试用 90 秒演示](DEMO.md#简体中文)。

## 功能

- 从**当前文件的任意位置**查找已出现的单词并提供补全。
- 也使用由自备 CSV 生成的离线词表；文件中的匹配结果优先。
- 输入时显示行内建议文本。按 VS Code 默认的 `Ctrl+Space` 快捷键（仅在 macOS
  未占用此快捷键时适用）触发 **Trigger Suggest**，可列出最多八个按排名排列的候选项。

## 不提供的功能

- 不提供句子、下一行或语义代码补全。
- 不会扫描工作区，也没有学习缓存、固定词汇或 CJK 专用模式。
- 不会连接云端，也没有遥测或语言模型。

## 安装

[从 Visual Studio Marketplace 安装](https://marketplace.visualstudio.com/items?itemName=codingEzio.x-local-auto-completion) ·
[在 Visual Studio Code 中打开](https://vscode.dev/redirect?url=vscode%3Aextension%2FcodingEzio.x-local-auto-completion)

```sh
deno task vocabulary /path/to/authorized.csv
deno task check
deno task package
code --install-extension dist/x-local-auto-completion-0.5.2.vsix
```

安装或更新 VSIX 后，请执行 **Developer: Reload Window**。`editor.inlineSuggest.enabled`
必须保持开启。

## 设置

```jsonc
{
  "localAutoCompletion.enabled": true,
  "localAutoCompletion.minimumPrefixLength": 2
}
```

## 开发

```sh
deno task check
deno task package
unzip -t dist/x-local-auto-completion-0.5.2.vsix
```

[词汇来源](../data/SOURCE.md)。


```sh
deno task vocabulary /path/to/authorized.csv
deno task check
deno task package
```
