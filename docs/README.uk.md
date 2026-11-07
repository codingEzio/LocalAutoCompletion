# X-LocalAutoCompletion

Цей вихідний код не містить словника. Перед складанням надайте сумісний CSV, на використання і поширення якого ви маєте права; див. [джерело](../data/SOURCE.md). Створений пакет міститиме словник.

<p><img src="../assets/icon.png" width="96" height="96" alt="X-LocalAutoCompletion"></p>

Миттєве локальне автодоповнення слів у Visual Studio Code. Без моделі, облікового запису, ключа API
та мережі.

Введіть `ar` у файлі, де є `archive`, або просто введіть `th`: розширення може запропонувати
`archive` чи `the`. У цьому й полягає весь продукт.

Українська · [Русский](README.ru.md)

## Що робить розширення

- Доповнює слова, які вже трапляються **в будь-якому місці поточного файла**.
- Використовує автономний словник, створений з вашого CSV; збіги з файла мають пріоритет.
- Під час введення показує підказку безпосередньо в тексті. Виконайте команду **Trigger Suggest**,
  щоб переглянути до восьми варіантів, упорядкованих за пріоритетом. У Visual Studio Code сполучення
  `Ctrl+Space` типово призначене цій команді, якщо macOS не зарезервувала його для системної дії.

## Чого розширення не робить

- Не пропонує речення, наступний рядок або семантичне доповнення коду.
- Не сканує робочий простір, не навчається на кеші, не закріплює слова й не має окремого режиму для
  CJK.
- Не надсилає запитів у хмару, не збирає телеметрію та не використовує мовну модель.

## Установлення

[Установити з Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=codingEzio.x-local-auto-completion) ·
[Відкрити у Visual Studio Code](https://vscode.dev/redirect?url=vscode%3Aextension%2FcodingEzio.x-local-auto-completion)

```sh
deno task vocabulary /path/to/authorized.csv
deno task check
deno task package
code --install-extension dist/x-local-auto-completion-0.5.2.vsix
```

Після встановлення оновленого VSIX виконайте **Developer: Reload Window**. Параметр
`editor.inlineSuggest.enabled` має залишатися ввімкненим.

Visual Studio Code — підтримувана програма-хост для цього розширення; сумісність перевірено.

## Налаштування

```jsonc
{
  "localAutoCompletion.enabled": true,
  "localAutoCompletion.minimumPrefixLength": 2
}
```

## Розробка

```sh
deno task check
deno task package
unzip -t dist/x-local-auto-completion-0.5.2.vsix
```

[Джерела словника](../data/SOURCE.md).


```sh
deno task vocabulary /path/to/authorized.csv
deno task check
deno task package
```
