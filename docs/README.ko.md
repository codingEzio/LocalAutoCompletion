# X-LocalAutoCompletion

이 소스에는 어휘 데이터가 없습니다. 빌드 전에 사용 및 재배포 권한이 있는 호환 CSV를 준비하세요. [입력 설명](../data/SOURCE.md). 생성된 패키지에는 어휘가 포함됩니다.

<p><img src="../assets/icon.png" width="96" height="96" alt="X-LocalAutoCompletion"></p>

Visual Studio Code 전용의 빠르고 개인정보 보호에 초점을 둔 단어 완성 기능입니다. 모델, 계정, API 키
또는 네트워크를 사용하지 않습니다.

`archive`가 들어 있는 파일에서 `ar`를 입력하거나 어디서든 `th`를 입력하면 `archive` 또는 `the`를
제안할 수 있습니다. 제품 기능은 여기까지입니다.

## 기능

- 현재 파일 어디에든 이미 있는 단어를 완성 후보로 제시합니다.
- 직접 제공한 CSV에서 생성한 오프라인 어휘도 사용하며 파일 일치 항목이 우선합니다.
- 입력하는 동안 고스트 텍스트를 표시합니다. VS Code 기본 **Trigger Suggest** 단축키인 `Ctrl+Space`를
  사용하면 순위가 매겨진 후보를 최대 8개 표시합니다. macOS가 이 키 조합을 예약하지 않은 경우에만 이
  단축키를 사용할 수 있습니다.

## 지원하지 않는 기능

- 문장, 다음 줄 또는 의미 기반 코드 완성을 제공하지 않습니다.
- 워크스페이스를 탐색하지 않으며, 학습 캐시, 고정 단어 또는 CJK 전용 모드도 없습니다.
- 클라우드 요청, 텔레메트리 또는 언어 모델을 사용하지 않습니다.

## 설치

[Visual Studio Marketplace에서 설치](https://marketplace.visualstudio.com/items?itemName=codingEzio.x-local-auto-completion) ·
[Visual Studio Code에서 열기](https://vscode.dev/redirect?url=vscode%3Aextension%2FcodingEzio.x-local-auto-completion)

```sh
deno task vocabulary /path/to/authorized.csv
deno task check
deno task package
code --install-extension dist/x-local-auto-completion-0.5.2.vsix
```

업데이트된 VSIX를 설치한 뒤 **Developer: Reload Window**를 실행하세요.
`editor.inlineSuggest.enabled`는 계속 켜 두어야 합니다.

## 설정

```jsonc
{
  "localAutoCompletion.enabled": true,
  "localAutoCompletion.minimumPrefixLength": 2
}
```

## 개발

```sh
deno task check
deno task package
unzip -t dist/x-local-auto-completion-0.5.2.vsix
```

[어휘 출처](../data/SOURCE.md).


```sh
deno task vocabulary /path/to/authorized.csv
deno task check
deno task package
```
