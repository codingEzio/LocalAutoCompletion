import metadata from "../package.json" with { type: "json" };

const root = new URL("../", import.meta.url);
const messageKeys = [
  "configuration.enabled.description",
  "configuration.minimumPrefixLength.description",
  "configuration.title",
  "extension.description",
  "extension.displayName",
];
const locales = ["", "zh-tw", "zh-cn", "ko", "ja", "es", "ru", "uk"];
const packageFiles = new Set<string>(
  JSON.parse(await Deno.readTextFile(new URL("package-files.json", root))).files,
);
const documents = ["zh-TW", "zh-CN", "ko", "ja", "es", "ru", "uk"];

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

Deno.test("manifest copy is localized through the VS Code NLS contract", () => {
  assert(metadata.displayName === "%extension.displayName%", "displayName must use NLS");
  assert(metadata.description === "%extension.description%", "description must use NLS");
  const configuration = metadata.contributes.configuration;
  assert(configuration.title === "%configuration.title%", "configuration title must use NLS");
  assert(
    configuration.properties["localAutoCompletion.enabled"].description ===
      "%configuration.enabled.description%",
    "enabled description must use NLS",
  );
  assert(
    configuration.properties["localAutoCompletion.minimumPrefixLength"].description ===
      "%configuration.minimumPrefixLength.description%",
    "minimum prefix description must use NLS",
  );
});

Deno.test("every supported locale has the complete message catalog", async () => {
  for (const locale of locales) {
    const suffix = locale ? `.${locale}` : "";
    assert(packageFiles.has(`package.nls${suffix}.json`), `VSIX omits package.nls${suffix}.json`);
    const messages = JSON.parse(
      await Deno.readTextFile(new URL(`package.nls${suffix}.json`, root)),
    );
    assert(
      JSON.stringify(Object.keys(messages).sort()) === JSON.stringify(messageKeys),
      `package.nls${suffix}.json has incomplete keys`,
    );
    for (const key of messageKeys) {
      assert(
        typeof messages[key] === "string" && messages[key].trim(),
        `${locale || "en"}: ${key}`,
      );
    }
  }
});

Deno.test("README routes to every full localization and documents VS Code only", async () => {
  const readme = await Deno.readTextFile(new URL("README.md", root));
  assert(!/Cursor/i.test(readme), "README must not claim unverified Cursor support");
  assert(
    readme.includes(
      `code --install-extension dist/x-local-auto-completion-${metadata.version}.vsix`,
    ),
    "README install command must match the package version",
  );
  for (const locale of documents) {
    const path = `docs/README.${locale}.md`;
    assert(readme.includes(path), `README does not link ${path}`);
    assert(packageFiles.has(path), `VSIX omits ${path}`);
    const localized = await Deno.readTextFile(new URL(path, root));
    assert(!/Cursor/i.test(localized), `${path} must document VS Code only`);
    assert(localized.includes("localAutoCompletion.enabled"), `${path} omits configuration`);
    assert(localized.includes("deno task check"), `${path} omits the check step`);
    assert(localized.includes("deno task package"), `${path} omits the package step`);
    assert(localized.includes("Trigger Suggest"), `${path} omits the command name`);
    assert(localized.includes("Ctrl+Space"), `${path} omits the default shortcut`);
    assert(localized.includes("macOS"), `${path} omits the macOS shortcut boundary`);
    assert(
      localized.includes(
        "https://marketplace.visualstudio.com/items?itemName=codingEzio.x-local-auto-completion",
      ),
      `${path} omits the public Marketplace link`,
    );
    assert(
      localized.includes(
        "https://vscode.dev/redirect?url=vscode%3Aextension%2FcodingEzio.x-local-auto-completion",
      ),
      `${path} omits the VS Code install link`,
    );

    const changelogPath = `docs/CHANGELOG.${locale}.md`;
    assert(packageFiles.has(changelogPath), `VSIX omits ${changelogPath}`);
    const changelog = await Deno.readTextFile(new URL(changelogPath, root));
    assert(changelog.includes("Visual Studio Code"), `${changelogPath} omits the verified host`);
    for (
      const version of [
        "0.5.2",
        "0.5.1",
        "0.5.0",
        "0.4.1",
        "0.4.0",
        "0.3.2",
        "0.3.1",
        "0.3.0",
        "0.2.1",
        "0.2.0",
        "0.1.0",
      ]
    ) {
      assert(changelog.includes(`${version} —`), `${changelogPath} omits ${version}`);
    }
  }
});
