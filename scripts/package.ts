const join = (...parts: string[]) => parts.join("/");
const dirname = (path: string) => path.slice(0, path.lastIndexOf("/")) || "/";

const root = await Deno.realPath(new URL("../", import.meta.url));
const verifyOnly = Deno.args.includes("--verify");
if (Deno.args.some((arg) => arg !== "--verify") || Deno.args.length > 1) {
  throw Error("Usage: deno task package [--verify]");
}
const selection = JSON.parse(await Deno.readTextFile(join(root, "package-files.json")));
const paths: string[] = selection.files;
if (
  selection.schemaVersion !== 1 || !Array.isArray(paths) || !paths.length ||
  new Set(paths).size !== paths.length
) {
  throw Error("Invalid package file selection");
}
const hash = async (bytes: Uint8Array) =>
  [...new Uint8Array(await crypto.subtle.digest("SHA-256", Uint8Array.from(bytes)))].map((n) =>
    n.toString(16).padStart(2, "0")
  ).join("");
const payload = new Map<string, Uint8Array>();
for (const path of paths) {
  if (
    typeof path !== "string" || !path || path.startsWith("/") || path.includes("\\") ||
    path.split("/").some((part) => !part || part === "." || part === "..") ||
    /^(?:Local|dist|\.git|\.env)(?:\/|$)/.test(path) ||
    /(?:^|\/)(?:AGENTS\.md|TASKS\.md|ERRORLOG\.txt)$/.test(path)
  ) throw Error(`Invalid package source path: ${path}`);
  const source = join(root, path);
  if (path === "data/english.json" || path === "data/vocabulary-receipt.json") {
    try {
      await Deno.lstat(source);
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        throw Error("Generate vocabulary first: deno task vocabulary PATH_TO_AUTHORIZED_CSV");
      }
      throw error;
    }
  }
  if (await Deno.realPath(source) !== source || !(await Deno.lstat(source)).isFile) {
    throw Error(`Package refuses non-regular or symlink input: ${path}`);
  }
  const bytes = await Deno.readFile(source);
  if (!bytes.includes(0)) {
    const text = new TextDecoder().decode(bytes);
    if (
      /(?:\/Users\/|\/home\/)[^\s/]+\/|~\/X\/|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\b(?:ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,})\b/
        .test(text)
    ) throw Error(`Review package input: ${path}; sensitive pattern contents suppressed`);
  }
  payload.set("extension/" + path, bytes);
}
function sourceText(path: string) {
  const bytes = payload.get("extension/" + path);
  if (!bytes) throw Error(`Required package input is missing: ${path}`);
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}
const metadata = JSON.parse(sourceText("package.json"));
const messages = JSON.parse(sourceText("package.nls.json"));
for (
  const file of [
    "LICENSE",
    "README.md",
    "CHANGELOG.md",
    "extension.js",
    "src/engine.js",
    "src/english.js",
    "assets/icon.png",
  ]
) {
  if (!payload.has("extension/" + file)) throw Error(`Required package input is missing: ${file}`);
}
const vocabulary = payload.get("extension/data/english.json");
const vocabularyReceipt = JSON.parse(sourceText("data/vocabulary-receipt.json"));
if (
  !vocabulary || vocabularyReceipt.schemaVersion !== 1 ||
  !/^[a-f0-9]{64}$/.test(vocabularyReceipt.sourceSHA256) ||
  await hash(vocabulary) !== vocabularyReceipt.outputSHA256
) {
  throw Error("Vocabulary bytes differ from the local generation receipt");
}
if (
  !/^[a-z0-9][a-z0-9-]*$/.test(metadata.name) ||
  !/^\d+\.\d+\.\d+(?:[-+][A-Za-z0-9.-]+)?$/.test(metadata.version)
) throw Error("Unsafe package identity/version");
const categories = Array.isArray(metadata.categories)
  ? metadata.categories.map((category: string) => escapeXML(category)).join(",")
  : "Other";
const outputDirectory = join(root, "dist");
const fileName = `${metadata.name}-${metadata.version}.vsix`;
const outputPath = join(outputDirectory, fileName);
function localized(value: string) {
  const match = /^%(.+)%$/.exec(value);
  return match ? messages[match[1]] ?? value : value;
}

function escapeXML(value: string) {
  return value.replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function vsixManifest() {
  const name = escapeXML(metadata.name);
  const publisher = escapeXML(metadata.publisher);
  const version = escapeXML(metadata.version);
  const displayName = escapeXML(localized(metadata.displayName));
  const description = escapeXML(localized(metadata.description));
  return `<?xml version="1.0" encoding="utf-8"?>
<PackageManifest Version="2.0.0" xmlns="http://schemas.microsoft.com/developer/vsx-schema/2011">
  <Metadata>
    <Identity Language="en-US" Id="${name}" Version="${version}" Publisher="${publisher}" />
    <DisplayName>${displayName}</DisplayName>
    <Description xml:space="preserve">${description}</Description>
    <Categories>${categories}</Categories>
    <GalleryFlags>Public</GalleryFlags>
  </Metadata>
  <Installation>
    <InstallationTarget Id="Microsoft.VisualStudio.Code" />
  </Installation>
  <Dependencies />
  <Assets>
    <Asset Type="Microsoft.VisualStudio.Code.Manifest" Path="extension/package.json" Addressable="true" />
    <Asset Type="Microsoft.VisualStudio.Services.Content.Details" Path="extension/README.md" Addressable="true" />
    <Asset Type="Microsoft.VisualStudio.Services.Content.Changelog" Path="extension/CHANGELOG.md" Addressable="true" />
    <Asset Type="Microsoft.VisualStudio.Services.Content.License" Path="extension/LICENSE" Addressable="true" />
    <Asset Type="Microsoft.VisualStudio.Services.Icons.Default" Path="extension/assets/icon.png" Addressable="true" />
  </Assets>
</PackageManifest>`;
}

const contentTypes = `<?xml version="1.0" encoding="utf-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="txt" ContentType="text/plain" />
  <Default Extension="json" ContentType="application/json" />
  <Default Extension="js" ContentType="application/javascript" />
  <Default Extension="md" ContentType="text/markdown" />
  <Default Extension="png" ContentType="image/png" />
  <Default Extension="svg" ContentType="image/svg+xml" />
  <Default Extension="xml" ContentType="text/xml" />
  <Default Extension="vsixmanifest" ContentType="text/xml" />
  <Override PartName="/extension/LICENSE" ContentType="text/plain" />
</Types>`;
payload.set("extension.vsixmanifest", new TextEncoder().encode(vsixManifest()));
payload.set("[Content_Types].xml", new TextEncoder().encode(contentTypes));
const files = await Promise.all(
  [...payload].sort(([a], [b]) => a.localeCompare(b)).map(async ([path, bytes]) => ({
    path,
    bytes: bytes.length,
    sha256: await hash(bytes),
    mode: "0644",
  })),
);
async function removeIfPresent(path: string) {
  try {
    await Deno.remove(path);
  } catch (error) {
    if (!(error instanceof Deno.errors.NotFound)) throw error;
  }
}
const staging = await Deno.realPath(
  await Deno.makeTempDir({ prefix: "delete_after_use_local_completion_" }),
);
async function command(name: string, args: string[], cwd?: string) {
  const result = await new Deno.Command(name, {
    args,
    cwd,
    env: { TZ: "UTC" },
    stdout: "piped",
    stderr: "piped",
  }).output();
  if (!result.success) throw Error(`${name} failed: ${new TextDecoder().decode(result.stderr)}`);
  return result.stdout;
}
async function verifyArchive(path: string) {
  const names = new TextDecoder().decode(await command("unzip", ["-Z1", path])).trimEnd().split(
    "\n",
  );
  const expected = [...payload.keys()].sort();
  if (JSON.stringify([...names].sort()) !== JSON.stringify(expected)) {
    throw Error("VSIX file collection differs from the explicit selection");
  }
  await command("unzip", ["-t", path]);
  const extracted = await Deno.makeTempDir({ dir: staging, prefix: "unpacked-" });
  await command("unzip", ["-q", path, "-d", extracted]);
  for (const entry of files) {
    const file = join(extracted, entry.path);
    const stat = await Deno.lstat(file);
    if (
      !stat.isFile || stat.isSymlink || await Deno.realPath(file) !== file ||
      (stat.mode !== null && (stat.mode & 0o777) !== 0o644)
    ) throw Error(`VSIX entry must be a regular 0644 file: ${entry.path}`);
    if (await hash(await Deno.readFile(file)) !== entry.sha256) {
      throw Error(`VSIX byte readback failed: ${entry.path}`);
    }
  }
  return {
    schemaVersion: 1,
    artifact: `dist/${fileName}`,
    artifactSHA256: await hash(await Deno.readFile(path)),
    extensionId: `${metadata.publisher}.${metadata.name}`,
    version: metadata.version,
    files,
    publication: "local-only; no upload performed",
  };
}
try {
  if (verifyOnly) {
    const receipt = await verifyArchive(outputPath);
    const retained = JSON.parse(await Deno.readTextFile(outputPath + ".receipt.json"));
    if (JSON.stringify(retained) !== JSON.stringify(receipt)) {
      throw Error("VSIX receipt differs from archive readback");
    }
    console.log(
      JSON.stringify({
        artifact: receipt.artifact,
        files: files.length,
        readback: "exact",
        artifactSHA256: receipt.artifactSHA256,
      }),
    );
  } else {
    const tree = join(staging, "tree");
    for (const [path, bytes] of payload) {
      const destination = join(tree, path);
      await Deno.mkdir(dirname(destination), { recursive: true });
      await Deno.writeFile(destination, bytes, { mode: 0o644 });
      await Deno.chmod(destination, 0o644);
      // Fixed ZIP timestamps make the same inputs reproducible; source mtimes stay intact.
      await Deno.utime(destination, 315532800, 315532800);
    }
    const candidate = join(staging, fileName);
    await command("zip", ["-X", "-q", candidate, ...[...payload.keys()].sort()], tree);
    const receipt = await verifyArchive(candidate);
    await Deno.mkdir(outputDirectory, { recursive: true });
    if (
      await Deno.realPath(outputDirectory) !== outputDirectory ||
      !(await Deno.lstat(outputDirectory)).isDirectory
    ) throw Error("Output directory must not be a symlink");
    const targets = [outputPath, outputPath + ".receipt.json"];
    const present = [];
    for (const target of targets) {
      try {
        const info = await Deno.lstat(target);
        if (!info.isFile || info.isSymlink) {
          throw Error("Existing package output must be a regular file");
        }
        present.push(true);
      } catch (error) {
        if (!(error instanceof Deno.errors.NotFound)) throw error;
        present.push(false);
      }
    }
    if (present.some(Boolean)) {
      if (!present.every(Boolean)) {
        throw Error(
          "Incomplete package output pair; inspect and preserve existing files before retrying",
        );
      }
      const existing = await verifyArchive(outputPath).catch((error: unknown) => {
        throw new Error(
          "Existing package output cannot be verified against current inputs; preserve it and use a separate checkout or version",
          { cause: error },
        );
      });
      const stored = JSON.parse(await Deno.readTextFile(targets[1]));
      if (
        JSON.stringify(stored) !== JSON.stringify(existing) ||
        existing.artifactSHA256 !== receipt.artifactSHA256
      ) {
        throw Error(
          "Existing package output differs; preserve it and use a separate checkout or version",
        );
      }
      console.log(
        JSON.stringify({
          artifact: existing.artifact,
          files: files.length,
          readback: "exact; existing pair retained",
          artifactSHA256: existing.artifactSHA256,
        }),
      );
    } else {
      const pending = await Deno.makeTempFile({
        dir: outputDirectory,
        prefix: "delete_after_use_package_",
      });
      let pendingReceipt: string | undefined;
      try {
        pendingReceipt = await Deno.makeTempFile({
          dir: outputDirectory,
          prefix: "delete_after_use_receipt_",
        });
        await Deno.copyFile(candidate, pending);
        if (await hash(await Deno.readFile(pending)) !== receipt.artifactSHA256) {
          throw Error("Candidate copy differs before publication to dist");
        }
        await Deno.writeTextFile(pendingReceipt, JSON.stringify(receipt, null, 2) + "\n");
        // Publish the receipt first so the installable VSIX path appears only
        // after its receipt exists. A crash may leave a receipt without a VSIX;
        // the next run rejects the incomplete pair and preserves it for review.
        await Deno.link(pendingReceipt, outputPath + ".receipt.json");
        await Deno.link(pending, outputPath);
        if (
          await hash(await Deno.readFile(outputPath)) !== receipt.artifactSHA256 ||
          JSON.stringify(JSON.parse(await Deno.readTextFile(outputPath + ".receipt.json"))) !==
            JSON.stringify(receipt)
        ) throw Error("Final package/receipt readback failed");
      } finally {
        await removeIfPresent(pending);
        if (pendingReceipt) await removeIfPresent(pendingReceipt);
      }
      console.log(
        JSON.stringify({
          artifact: receipt.artifact,
          files: files.length,
          readback: "exact",
          artifactSHA256: receipt.artifactSHA256,
        }),
      );
    }
  }
} finally {
  await Deno.remove(staging, { recursive: true });
}
