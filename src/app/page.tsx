"use client";

import SearchForm from "@/components/SearchForm";
import SearchResult from "@/components/SearchResult";
import { useStore } from "@/store";
import { Suspense, useEffect, useState } from "react";
import { kv } from "@vercel/kv";
import FormBubble from "@/components/FormBubble";
import { NextRequest } from 'next/server'

const Home: React.FC = async () => {
  const results = useStore((state) => state.results);
  const getIp = useStore((state) => state.get_ip);
  const [visits, setVisits] = useState(0)

  useEffect(() => {
    getIp()
    .then(async ip => {
      const visits = (await kv.get<number>(ip)) ?? 0
      console.log(ip, visits)
      kv.set<number>(ip, visits + 1)
      return visits
    })
    .then(setVisits)
    .catch(console.error)
  }, [])
  return (
    <div className="container mx-auto max-w-md p-4">
      {
        (visits > 5) ? <FormBubble/> : null
      }
      <FormBubble/>
      <h1 className="text-2xl font-bold mb-4">Explain it Like I'm 5</h1>
      <h2 className="text-1xl font-regular mb-3">Choose an argument and learn it with very simple principles</h2>

      <SearchForm />
      {results.map((result) => <SearchResult key={result.message} result={result} />)}
    </div>
  );
};

export default Home;
