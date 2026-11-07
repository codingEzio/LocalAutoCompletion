# Changelog

[繁體中文](docs/CHANGELOG.zh-TW.md) · [简体中文](docs/CHANGELOG.zh-CN.md) ·
[한국어](docs/CHANGELOG.ko.md) · [日本語](docs/CHANGELOG.ja.md) · [Español](docs/CHANGELOG.es.md) ·
[Русский](docs/CHANGELOG.ru.md) · [Українська](docs/CHANGELOG.uk.md)

### 0.5.2 — 2026-09-21

- Mark the VSIX manifest for public Marketplace availability instead of leaving manual uploads
  private.

### 0.5.1 — 2026-09-21

- Use the `codingEzio` Marketplace publisher identity so the extension can be published from the
  authorized Microsoft account.

### 0.5.0 — 2026-09-20

- Localize the README and Visual Studio Code settings for Traditional Chinese, Simplified Chinese,
  Korean, Japanese, Spanish, Russian, and Ukrainian while retaining English as the fallback.
- Document and verify Visual Studio Code as the supported host.

### 0.4.1 — 2026-09-20

- Replace the restricted-use Google Web Trillion Word Corpus derivative with common and exam
  vocabulary from the reviewed MIT-licensed ECDICT snapshot.
- Make the ECDICT extraction deterministic and checksum-guarded.

### 0.4.0 — 2026-09-15

- Rename the product to X-LocalAutoCompletion.
- Complete from the whole current file, not a nearby line window.
- Always include ranked offline English: common words first, then exam-only extras.
- Remove workspace indexing, learned choices, pinned words, completion-surface switching, CJK locale
  settings, and the experimental native benchmark backend.

### 0.3.2 — 2026-09-07

- Bound document reads before copying text and scan trailing identifiers without rescanning long
  lines.
- Keep inline suggestions compatible with typed casing and the selected completion menu item.

### 0.3.1 — 2026-09-07

- Keep the 250 most recently accepted records so a full history can still learn new choices.

### 0.3.0 — 2026-09-07

- Add opt-in offline English vocabulary with IELTS/TOEFL/GRE-tagged words.

### 0.2.1 — 2026-09-07

- Fix Command Palette contributions for the four user commands.

### 0.2.0 — 2026-09-03

- Workspace-local learning, explicit workspace indexing, and native completion-surface choice.

### 0.1.0 — 2026-09-03

- Initial nearby-document word completion.
