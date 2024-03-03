import { useStore } from "@/store";
import { useEffect, useState } from "react";
import { Dots } from "react-activity";
import "react-activity/dist/library.css";
import { useSearchParams } from 'next/navigation'
import { kv } from "@vercel/kv";
import mixpanel from 'mixpanel-browser';

export default function SearchForm() {
  const searchParams = useSearchParams()
  const queryParam = searchParams.get('q')

  const searchQuery = useStore((state) => state.search);
  const ip = useStore((state) => state.ip);
  const clear = useStore((state) => state.clear);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState(queryParam ?? "");

  useEffect(() => {
    if(queryParam != null) {
      handleSearchQuery();
    }
  }, []);

  const handleKeyDown = (e : any) => {
    if (e.key === 'Enter') {
      handleSearchQuery()
    }
  }
  const handleSearchQuery = async () => {
    if (query.length === 0) return alert("Query input must not be empty");
    try {
      mixpanel.track("search", {query: query})
      const hits = (await kv.get<number>(query)) ?? 0
      await kv.set<number>(query, hits + 1)
      const visits = (await kv.get<number>(ip)) ?? 0
      await kv.set<number>(ip, visits + 1)
      setLoading(true);
      await searchQuery({query: query});
      setQuery("");
    } catch (error) {
      console.error("Error searching query:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-2 mb-4">
      <input
        type="text"
        value={query}
        placeholder="Relativity Theory"
        onChange={(e) => setQuery(e.target.value)}
        className="border rounded px-2 py-1 flex-1"
        onKeyDown={handleKeyDown}
      />
      {loading ? (<Dots/>) :
        (<button
          disabled={loading}
          className={`px-2 py-1 text-white rounded ${
            loading ? "bg-gray-400" : "bg-sky-500"
          }`}
          onClick={handleSearchQuery}
        >
          Search
        </button>)
      }
      
    </div>
  );
}
