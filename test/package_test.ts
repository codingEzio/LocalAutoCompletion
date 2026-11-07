const assert = {
  equal(actual: unknown, expected: unknown, message = "values differ") {
    if (actual !== expected) throw Error(message);
  },
  notEqual(actual: unknown, expected: unknown, message = "values unexpectedly match") {
    if (actual === expected) throw Error(message);
  },
  deepEqual(actual: Uint8Array, expected: Uint8Array, message = "bytes differ") {
    if (
      actual.length !== expected.length || !actual.every((byte, index) => byte === expected[index])
    ) throw Error(message);
  },
};
const join = (...parts: string[]) => parts.join("/");
const dirname = (path: string) => path.slice(0, path.lastIndexOf("/")) || "/";

Deno.test("VSIX packaging is explicit, reproducible and preserves prior output on failure", async () => {
  const root = await Deno.realPath(new URL("../", import.meta.url));
  await Deno.mkdir(join(root, "Local"), { recursive: true });
  const temporary = await Deno.makeTempDir({
    dir: join(root, "Local"),
    prefix: "delete_after_use_package_",
  });
  const fixture = join(temporary, "source with spaces");
  await Deno.mkdir(fixture);
  const selection = JSON.parse(await Deno.readTextFile(join(root, "package-files.json")));
  for (const path of [...selection.files, "package-files.json", "scripts/package.ts"]) {
    const destination = join(fixture, path);
    await Deno.mkdir(dirname(destination), { recursive: true });
    await Deno.copyFile(join(root, path), destination);
  }
  const metadata = JSON.parse(await Deno.readTextFile(join(fixture, "package.json")));
  const output = join(fixture, "dist", `${metadata.name}-${metadata.version}.vsix`);
  const run = async (...args: string[]) =>
    await new Deno.Command("deno", {
      cwd: fixture,
      args: [
        "run",
        "--no-config",
        "--no-lock",
        "--allow-read",
        "--allow-write",
        "--allow-run=zip,unzip",
        "scripts/package.ts",
        ...args,
      ],
      stdout: "piped",
      stderr: "piped",
    }).output();
  const success = (result: Deno.CommandOutput) =>
    assert.equal(result.code, 0, new TextDecoder().decode(result.stderr));
  try {
    await Deno.writeTextFile(join(fixture, "docs", "unselected-private.md"), "private fixture");
    success(await run());
    const original = await Deno.readFile(output);
    const receipt = await Deno.readTextFile(output + ".receipt.json");
    success(await run("--verify"));
    success(await run());
    assert.deepEqual(
      await Deno.readFile(output),
      original,
      "same selected inputs produce identical ZIP bytes",
    );
    const recorded = JSON.parse(receipt);
    assert.equal(recorded.files.length, selection.files.length + 2);
    assert.equal(
      recorded.files.some((f: { path: string }) => f.path.includes("unselected-private")),
      false,
    );
    const badFile = join(fixture, "injected.txt");
    await Deno.writeTextFile(badFile, "extra");
    const inject = await new Deno.Command("zip", {
      args: ["-q", "-j", output, badFile],
      stdout: "piped",
      stderr: "piped",
    }).output();
    success(inject);
    assert.notEqual((await run("--verify")).code, 0, "extra ZIP entry must fail");
    await Deno.writeFile(output, original);
    await Deno.writeTextFile(output + ".receipt.json", "{}\n");
    assert.notEqual((await run("--verify")).code, 0, "receipt mismatch must fail");
    await Deno.writeTextFile(output + ".receipt.json", receipt);
    const readme = join(fixture, "README.md");
    const readmeBytes = await Deno.readFile(readme);
    await Deno.remove(readme);
    await Deno.symlink("docs/README.es.md", readme);
    assert.notEqual((await run()).code, 0, "symlink input must fail");
    assert.deepEqual(await Deno.readFile(output), original, "failure preserves prior VSIX");
    await Deno.remove(readme);
    await Deno.writeFile(readme, readmeBytes);
    const vocabulary = join(fixture, "data/english.json");
    const vocabularyBytes = await Deno.readFile(vocabulary);
    await Deno.writeTextFile(vocabulary, "[]\n");
    assert.notEqual((await run()).code, 0, "changed dictionary provenance must fail");
    assert.deepEqual(await Deno.readFile(output), original);
    await Deno.writeFile(vocabulary, vocabularyBytes);
    await Deno.rename(join(fixture, "dist"), join(fixture, "retained-dist"));
    await Deno.symlink("retained-dist", join(fixture, "dist"));
    assert.notEqual((await run()).code, 0, "symlink output directory must fail");
    assert.deepEqual(
      await Deno.readFile(
        join(fixture, "retained-dist", `${metadata.name}-${metadata.version}.vsix`),
      ),
      original,
    );
  } finally {
    await Deno.remove(temporary, { recursive: true });
  }
});
