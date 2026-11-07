import metadata from "../package.json" with { type: "json" };

Deno.test("the product is file plus English completion only", () => {
  const keys = Object.keys(metadata.contributes.configuration.properties).sort();
  if (
    JSON.stringify(keys) !==
      JSON.stringify(["localAutoCompletion.enabled", "localAutoCompletion.minimumPrefixLength"])
  ) {
    throw new Error(`unexpected settings: ${JSON.stringify(keys)}`);
  }
  if (metadata.contributes.commands) {
    throw new Error("this focused build should not contribute extra commands");
  }
  if (metadata.name !== "x-local-auto-completion") {
    throw new Error(`unexpected extension name: ${metadata.name}`);
  }
  if (metadata.publisher !== "codingEzio") {
    throw new Error(`unexpected Marketplace publisher: ${metadata.publisher}`);
  }
  if (metadata.version !== "0.5.2") {
    throw new Error(`unexpected release version: ${metadata.version}`);
  }
});

Deno.test("the public package points back to its GitHub project", () => {
  const repository = "https://github.com/codingEzio/X-LocalAutoCompletion";
  if (metadata.repository?.url !== `${repository}.git`) {
    throw new Error(`unexpected repository: ${JSON.stringify(metadata.repository)}`);
  }
  if (metadata.homepage !== `${repository}#readme`) {
    throw new Error(`unexpected homepage: ${metadata.homepage}`);
  }
  if (metadata.bugs?.url !== `${repository}/issues`) {
    throw new Error(`unexpected issue tracker: ${JSON.stringify(metadata.bugs)}`);
  }
});

Deno.test("the VSIX declares a content type for the extensionless license", async () => {
  const source = await Deno.readTextFile(new URL("../scripts/package.ts", import.meta.url));
  if (!source.includes('<Override PartName="/extension/LICENSE" ContentType="text/plain" />')) {
    throw new Error("VSIX content types must declare the extensionless LICENSE asset");
  }
});

Deno.test("the VSIX manifest requests public Marketplace availability", async () => {
  const source = await Deno.readTextFile(new URL("../scripts/package.ts", import.meta.url));
  if (!source.includes("<GalleryFlags>Public</GalleryFlags>")) {
    throw new Error("VSIX manifest must request public Marketplace availability");
  }
});
