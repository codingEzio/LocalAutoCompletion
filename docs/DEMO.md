# Try X-LocalAutoCompletion in 90 seconds

[English](#english) · [繁體中文](#繁體中文) · [简体中文](#简体中文)

## English

Install the extension, then open an empty **Plain Text** file in VS Code. Keep
`localAutoCompletion.enabled` and `editor.inlineSuggest.enabled` on, with
`localAutoCompletion.minimumPrefixLength` set to `2`.

1. Type `archive` on the first line. On the second line, type `ar`. The extension offers `archive`;
   accept the inline suggestion with **Tab**.
2. Replace the file with `array array arrival`, then type `ar` on a new line. The extension offers
   `array` first because it occurs more often in this file.
3. Run **Trigger Suggest** from the Command Palette. The extension supplies up to eight choices,
   with file matches before its offline English vocabulary.

Other installed extensions can also supply suggestions. The suggestion menu labels this extension's
entries `X-LocalAutoCompletion · this file` or `X-LocalAutoCompletion · English`. If inline text
does not appear, check the two enable settings and the minimum prefix length above.

The word index belongs to the current document and is reused until its document version changes.
Prefix lookup uses a sorted index; ranking puts file matches first, then matching case, file
frequency and English vocabulary rank. Closing a document removes its index. This is word
completion, with no model or network request; it does not infer what your program means.

## 繁體中文

安裝擴充功能，並在 VS Code 開啟空白的 **Plain Text** 檔案。開啟 `localAutoCompletion.enabled` 和
`editor.inlineSuggest.enabled`，並將 `localAutoCompletion.minimumPrefixLength` 設為 `2`。

1. 第一行輸入 `archive`，第二行輸入 `ar`。擴充功能會建議 `archive`；按 **Tab** 接受行內建議。
2. 將檔案內容改為 `array array arrival`，換行輸入 `ar`。因為 `array`
   在這個檔案出現較多次，會排在前面。
3. 從命令選擇區執行 **Trigger
   Suggest**。擴充功能會提供最多八個候選項，檔案中的匹配詞優先，再由離線英文詞表補足。

其他已安裝的擴充功能也可能提供建議。本擴充功能的選單項目會標示 `X-LocalAutoCompletion · this file`
或 `X-LocalAutoCompletion · English`。 若看不到行內建議，請檢查上述兩個開關及最短前綴長度。

單字索引屬於目前文件；文件版本未變時會重用索引。前綴查詢使用已排序的索引；排名依序考慮檔案匹配、大小寫匹配、檔案詞頻及英文詞表排名。
關閉文件會移除其索引。這是單字補全，不使用模型或網路請求，也不推斷程式的語意。

## 简体中文

安装扩展，并在 VS Code 打开空白的 **Plain Text** 文件。开启 `localAutoCompletion.enabled` 和
`editor.inlineSuggest.enabled`，并将 `localAutoCompletion.minimumPrefixLength` 设为 `2`。

1. 第一行输入 `archive`，第二行输入 `ar`。扩展会建议 `archive`；按 **Tab** 接受行内建议。
2. 将文件内容改为 `array array arrival`，换行输入 `ar`。因为 `array`
   在这个文件出现更多次，会排在前面。
3. 从命令面板执行 **Trigger
   Suggest**。扩展会提供最多八个候选项，文件中的匹配词优先，再由离线英文词表补足。

其他已安装的扩展也可能提供建议。本扩展的菜单项会标注 `X-LocalAutoCompletion · this file` 或
`X-LocalAutoCompletion · English`。 若看不到行内建议，请检查上述两个开关及最短前缀长度。

单词索引属于当前文档；文档版本未变时会重用索引。前缀查询使用已排序的索引；排名依次考虑文件匹配、大小写匹配、文件词频及英文词表排名。
关闭文档会移除其索引。这是单词补全，不使用模型或网络请求，也不推断程序的语义。
