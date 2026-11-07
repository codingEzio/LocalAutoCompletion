# X-LocalAutoCompletion

Этот исходный код не содержит словаря. Перед сборкой предоставьте совместимый CSV, на использование и распространение которого у вас есть права; см. [источник](../data/SOURCE.md). Полученный пакет будет содержать словарь.

<p><img src="../assets/icon.png" width="96" height="96" alt="X-LocalAutoCompletion"></p>

Мгновенное локальное автодополнение слов в Visual Studio Code. Без модели, учетной записи, API-ключа
и сети.

Введите `ar` в файле, где встречается `archive`, или просто введите `th`: расширение может
предложить `archive` или `the`. В этом и состоит весь продукт.

Русский · [Українська](README.uk.md)

## Что делает расширение

- Дополняет слова, которые уже встречаются **в любом месте текущего файла**.
- Использует автономный словарь, созданный из вашего CSV; совпадения из файла имеют приоритет.
- Во время ввода показывает подсказку прямо в тексте. Выполните команду **Trigger Suggest**, чтобы
  увидеть до восьми вариантов, отсортированных по приоритету. В Visual Studio Code сочетание
  `Ctrl+Space` назначено этой команде по умолчанию, если macOS не зарезервировала его для системного
  действия.

## Чего расширение не делает

- Не предлагает предложения, следующую строку или семантическое дополнение кода.
- Не сканирует рабочую область, не обучается на кэше, не закрепляет слова и не имеет отдельного
  режима для CJK.
- Не отправляет запросы в облако, не собирает телеметрию и не использует языковую модель.

## Установка

[Установить из Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=codingEzio.x-local-auto-completion) ·
[Открыть в Visual Studio Code](https://vscode.dev/redirect?url=vscode%3Aextension%2FcodingEzio.x-local-auto-completion)

```sh
deno task vocabulary /path/to/authorized.csv
deno task check
deno task package
code --install-extension dist/x-local-auto-completion-0.5.2.vsix
```

После установки обновленного VSIX выполните **Developer: Reload Window**. Параметр
`editor.inlineSuggest.enabled` должен оставаться включенным.

Visual Studio Code — поддерживаемое хост-приложение для этого расширения; совместимость проверена.

## Настройка

```jsonc
{
  "localAutoCompletion.enabled": true,
  "localAutoCompletion.minimumPrefixLength": 2
}
```

## Разработка

```sh
deno task check
deno task package
unzip -t dist/x-local-auto-completion-0.5.2.vsix
```

[Источники словаря](../data/SOURCE.md).


```sh
deno task vocabulary /path/to/authorized.csv
deno task check
deno task package
```
