(function attachLocalAutoCompletionEngine(root) {
  const wordPattern = /[\p{L}\p{N}_-]+/gu;
  const endingWordPattern = /[\p{L}\p{N}_-]+$/u;

  function characterCount(text) {
    return [...text].length;
  }

  function* wordEntries(text) {
    for (const match of text.matchAll(wordPattern)) {
      yield { word: match[0], index: match.index ?? 0 };
    }
  }

  function wordsInText(text) {
    return [...wordEntries(text)];
  }

  function betterDisplay(current, word, prefix) {
    if (!current) return true;
    const currentMatchesCase = current.startsWith(prefix);
    const wordMatchesCase = word.startsWith(prefix);
    return (
      (!currentMatchesCase && wordMatchesCase) ||
      (currentMatchesCase === wordMatchesCase && word.length < current.length) ||
      (currentMatchesCase === wordMatchesCase &&
        word.length === current.length &&
        word.localeCompare(current) < 0)
    );
  }

  function pickForm(forms, prefix) {
    let chosen = "";
    for (const word of forms) {
      if (betterDisplay(chosen, word, prefix)) chosen = word;
    }
    return chosen;
  }

  function indexText(text) {
    const byKey = new Map();
    for (const { word } of wordEntries(text)) {
      const key = word.toLocaleLowerCase();
      const entry = byKey.get(key);
      if (entry) {
        entry.count += 1;
        entry.forms.add(word);
      } else {
        byKey.set(key, { key, count: 1, forms: new Set([word]) });
      }
    }
    return [...byKey.values()].sort((left, right) => left.key < right.key ? -1 : 1);
  }

  function lowerBound(entries, key) {
    let low = 0;
    let high = entries.length;
    while (low < high) {
      const middle = low + Math.floor((high - low) / 2);
      if (entries[middle].key < key) low = middle + 1;
      else high = middle;
    }
    return low;
  }

  function matchingEntries(entries, prefixIdentity) {
    const matches = [];
    for (let index = lowerBound(entries, prefixIdentity); index < entries.length; index++) {
      const entry = entries[index];
      if (!entry.key.startsWith(prefixIdentity)) break;
      matches.push(entry);
    }
    return matches;
  }

  function wordBefore(text) {
    let size = 256;
    while (true) {
      let start = Math.max(0, text.length - size);
      const code = text.charCodeAt(start);
      if (start > 0 && code >= 0xdc00 && code <= 0xdfff) start--;
      const tail = text.slice(start);
      const word = tail.match(endingWordPattern)?.[0] ?? "";
      if (start === 0 || word.length < tail.length) return word;
      size *= 2;
    }
  }

  function suggest(prefix, options = {}) {
    if (!prefix) return [];

    const prefixIdentity = prefix.toLocaleLowerCase();
    const prefixLength = characterCount(prefix);
    const candidates = new Map();
    const fileWords = options.fileWords ??
      (typeof options.text === "string" ? indexText(options.text) : []);

    function add(word, source) {
      const identity = word.toLocaleLowerCase();
      if (!word || !identity.startsWith(prefixIdentity) || characterCount(word) <= prefixLength) {
        return;
      }
      const candidate = candidates.get(identity) ?? {
        word,
        sameCase: false,
        fileCount: 0,
        dictionaryRank: Number.POSITIVE_INFINITY,
      };
      const fromFile = (source.fileCount ?? 0) > 0;
      if (fromFile) {
        if (candidate.fileCount === 0 || betterDisplay(candidate.word, word, prefix)) {
          candidate.word = word;
        }
      } else if (candidate.fileCount === 0 && betterDisplay(candidate.word, word, prefix)) {
        candidate.word = word;
      }
      candidate.sameCase ||= word.startsWith(prefix);
      candidate.fileCount += source.fileCount ?? 0;
      if (Number.isFinite(source.dictionaryRank)) {
        candidate.dictionaryRank = Math.min(candidate.dictionaryRank, source.dictionaryRank);
      }
      candidates.set(identity, candidate);
    }

    for (const entry of matchingEntries(fileWords, prefixIdentity)) {
      add(pickForm(entry.forms, prefix), { fileCount: entry.count });
    }
    for (const record of options.dictionaryWords ?? []) {
      add(record.word, { dictionaryRank: record.rank });
    }

    const limit = Math.min(8, Math.max(1, Math.floor(options.limit ?? 1)));
    return [...candidates.values()]
      .filter((candidate) =>
        !options.requiredPrefix ||
        (candidate.word.startsWith(options.requiredPrefix) &&
          candidate.word.length > options.requiredPrefix.length)
      )
      .sort((left, right) => (
        Number(right.fileCount > 0) - Number(left.fileCount > 0) ||
        Number(right.sameCase) - Number(left.sameCase) ||
        right.fileCount - left.fileCount ||
        left.dictionaryRank - right.dictionaryRank ||
        characterCount(left.word) - characterCount(right.word) ||
        left.word.localeCompare(right.word)
      ))
      .slice(0, limit);
  }

  const api = {
    characterCount,
    indexText,
    matchingEntries,
    suggest,
    wordBefore,
    wordsInText,
  };
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  } else {
    root.LocalAutoCompletionEngine = api;
  }
})(globalThis);
