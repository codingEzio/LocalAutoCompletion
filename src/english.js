(function attachLocalAutoCompletionEnglish(root) {
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

  function displayWord(word, prefix) {
    if (prefix === prefix.toUpperCase()) return word.toUpperCase();
    if (/^[A-Z][a-z-]*$/.test(prefix)) return word[0].toUpperCase() + word.slice(1);
    return word;
  }

  function createVocabularyLookup(loadEntries) {
    let entries;
    function loaded() {
      entries ??= loadEntries().map(([word, rank]) => ({
        word,
        key: String(word).toLowerCase(),
        rank: Number(rank) || Number.POSITIVE_INFINITY,
      })).sort((left, right) => left.key < right.key ? -1 : left.key > right.key ? 1 : 0);
      return entries;
    }

    function wordsFor(prefix) {
      if (typeof prefix !== "string" || !/^[A-Za-z][A-Za-z-]*$/.test(prefix)) {
        return [];
      }
      const key = prefix.toLowerCase();
      const matches = [];
      const all = loaded();
      for (let index = lowerBound(all, key); index < all.length; index++) {
        const entry = all[index];
        if (!entry.key.startsWith(key)) break;
        if (entry.key.length <= key.length) continue;
        matches.push({ word: displayWord(entry.word, prefix), rank: entry.rank });
      }
      return matches.sort((left, right) => left.rank - right.rank);
    }

    wordsFor.preload = loaded;
    return wordsFor;
  }

  const api = { createVocabularyLookup };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.LocalAutoCompletionEnglish = api;
})(globalThis);
