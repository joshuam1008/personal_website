import MiniSearch from 'minisearch';
import type { Options, SearchResult } from 'minisearch';
import { useEffect, useMemo, useState } from 'react';

type SearchDoc = {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  type: 'Project' | 'Writing';
  url: string;
  content: string;
};

type Entry = SearchResult | SearchDoc;

const miniSearchOptions: Options<SearchDoc> = {
  fields: ['title', 'summary', 'content', 'tags'],
  storeFields: ['title', 'summary', 'tags', 'type', 'url'],
  searchOptions: {
    boost: { title: 4, tags: 2 },
    fuzzy: 0.2,
    prefix: true,
  },
};

function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [docs, setDocs] = useState<SearchDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const miniSearch = useMemo(() => new MiniSearch(miniSearchOptions), []);

  useEffect(() => {
    const controller = new AbortController();

    fetch('/search-index.json', { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load search index');
        const data = (await res.json()) as SearchDoc[];
        miniSearch.addAll(data);
        setDocs(data);
        setIsLoading(false);
      })
      .catch((err: Error) => {
        if (err.name === 'AbortError') return;
        setError(err.message);
        setIsLoading(false);
      });

    return () => controller.abort();
  }, [miniSearch]);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    setResults(miniSearch.search(query));
  }, [miniSearch, query]);

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
    docs,
  };
}

function isSearchResult(entry: Entry): entry is SearchResult {
  return (entry as SearchResult).score !== undefined;
}

function ResultList({ entries }: { entries: Entry[] }) {
  if (entries.length === 0) {
    return <p className="text-sm text-neutral-400">Nothing to show yet. Come back after I publish a bit more.</p>;
  }

  return (
    <ul className="space-y-4">
      {entries.map((entry) => {
        const doc = isSearchResult(entry) ? (entry as SearchResult) : (entry as SearchDoc);
        return (
          <li
            key={doc.id}
            className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-white/30 hover:bg-white/10"
          >
            <div className="mb-2 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-neutral-500">
              <span>{doc.type}</span>
              {doc.tags?.[0] && <span>{doc.tags[0]}</span>}
            </div>
            <a href={doc.url} className="text-base font-semibold text-white hover:underline">
              {doc.title}
            </a>
            <p className="mt-2 text-sm text-neutral-300">{doc.summary}</p>
          </li>
        );
      })}
    </ul>
  );
}

export default function SearchPanel() {
  const { query, setQuery, results, isLoading, error, docs } = useSearch();

  const entries: Entry[] = results.length > 0 ? results : docs.slice(0, 4);

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center gap-3 rounded-full border border-white/15 bg-black/30 px-5 py-3">
        <span className="text-neutral-500">⌕</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search projects and writing"
          className="flex-1 bg-transparent text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-neutral-300 transition hover:bg-white/20"
          >
            Clear
          </button>
        )}
      </div>

      {isLoading && <p className="text-sm text-neutral-400">Loading index…</p>}
      {error && <p className="text-sm text-red-300">{error}</p>}

      {!isLoading && !error && <ResultList entries={entries} />}
    </div>
  );
}
