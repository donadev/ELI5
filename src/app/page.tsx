"use client";

import SearchForm from "@/components/SearchForm";
import SearchResult from "@/components/SearchResult";
import { useStore } from "@/store";
import { useEffect } from "react";

const Home: React.FC = () => {
  const results = useStore((state) => state.results);

  return (
    <div className="container mx-auto max-w-md p-4">
      <h1 className="text-2xl font-bold mb-4">Explain it Like I'm 5</h1>
      <h2 className="text-1xl font-regular mb-3">Choose an argument and learn it with very simple principles</h2>

      <SearchForm />
      {results.length === 0 ? (
        <p className="text-center">Search</p>
      ) : (
        results.map((result) => <SearchResult key={result.message} result={result} />)
      )}
    </div>
  );
};

export default Home;
