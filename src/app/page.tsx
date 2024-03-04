"use client";

import SearchForm from "@/components/SearchForm";
import SearchResult from "@/components/SearchResult";
import { useStore } from "@/store";
import { Suspense, useEffect, useState } from "react";
import FormBubble from "@/components/FormBubble";
import { NextRequest } from 'next/server'
import mixpanel from 'mixpanel-browser';

const Home: React.FC = () => {
  const results = useStore((state) => state.results);
  const visits = useStore((state) => state.visits);
  const getIp = useStore((state) => state.get_ip);
  const inc = useStore((state) => state.incrementVisits);

  useEffect(() => {
    mixpanel.init('4aa70294625b8c4f16a456d1bafa5ee9', {debug: process.env.DEBUG == "1", track_pageview: true, persistence: 'localStorage'});
    getIp()
    .then(async ip => {
      await inc()
      mixpanel.identify(ip)
    })
    .catch(console.error)
  }, [])
  return (
    <div className="container mx-auto max-w-md p-4">
      {
        (visits > 2) ? <FormBubble/> : null
      }
      <h1 className="text-2xl font-bold mb-4">Explain it Like I'm 5</h1>
      <h2 className="text-1xl font-regular mb-3">Search for an argument and learn it with very simple principles.</h2>
      <p className="text-xs text-slate-400 italic mb-3">For an optimal experience, prefer arguments formed by 2-3 words max.</p>


      <SearchForm />
      {results.map((result) => <SearchResult key={result.id} result={result} />)}
    </div>
  );
};

export default Home;
