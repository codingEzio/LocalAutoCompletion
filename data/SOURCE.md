# Vocabulary input

This source distribution contains no dictionary or CSV. Supply a CSV that you have the rights to use, and, if distributing the resulting VSIX, to redistribute. The project does not grant rights in your input or establish that any upstream dataset is cleared. Preserve any notices and satisfy the input license yourself.

The offline generator expects UTF-8 CSV with `word`, `tag`, and `frq` columns. `frq` is a positive frequency rank (lower is more frequent); zero or empty means absent. `tag` contains space-separated lowercase exam labels; `gre`, `ielts`, and `toefl` add exam extras. At most 10,000 ranked words plus exam extras are selected, case-insensitive duplicates are merged, and output is sorted for lookup. Different data gives different results and coverage. To reproduce the existing private dictionary exactly, the same source bytes are necessary; this candidate does not establish permission to distribute those bytes or their output.

```sh
deno task vocabulary /path/to/authorized.csv
deno task check
deno task package
deno task package:verify
```

Generation overwrites `data/english.json` and `data/vocabulary-receipt.json` in this checkout. The receipt contains input/output SHA-256 hashes, not permission evidence. Packaging fails without generated files or on a hash mismatch, and embeds the resulting vocabulary and receipt in the VSIX; inspect and authorize those contents before sharing. It does not embed the input CSV. No data is downloaded by the generator or extension. The source-only checkout cannot build or activate the extension until vocabulary is generated. The resulting VSIX retains the original extension ID; installing it may replace an existing installation.
