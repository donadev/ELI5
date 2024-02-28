import { create } from "zustand";

type SearchResult = {
  id: number;
  title: string;
};

type SearchQuery = {
  title: string;
};

type QueryStore = {
  results: SearchResult[];
  search: (query: SearchQuery) => void;
};

const URL = process.env.NEXT_PUBLIC_VERCEL_URL
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/api`
  : "http://localhost:3000/api";

export const useStore = create<QueryStore>((set) => ({
  results: [],
  search: async (query) => {
    try {
      const response = await fetch(`${URL}/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(query),
      });
      const searchResult = await response.json();
      set((state) => ({ results: [...state.results, searchResult] }));
    } catch (error) {
      console.error("Error creating todo:", error);
    }
  }
}));
