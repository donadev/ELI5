import { useStore } from "@/store";
import { useState } from "react";

export default function SearchForm() {
  const searchQuery = useStore((state) => state.search);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  const handleSearchQuery = async () => {
    if (query.length === 0) return alert("Query input must not be empty");
    try {
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
      />
      <button
        disabled={loading}
        className={`px-2 py-1 text-white rounded ${
          loading ? "bg-gray-400" : "bg-green-500"
        }`}
        onClick={handleSearchQuery}
      >
        Search
      </button>
    </div>
  );
}
