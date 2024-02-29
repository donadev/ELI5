import { create } from "zustand";

type SearchResult = {
  title: string;
  message: string;
};

type SearchQuery = {
  query: string;
};

type QueryStore = {
  results: SearchResult[];
  search: (query: SearchQuery) => void;
  clear: () => void;
};

const URL = process.env.NEXT_PUBLIC_VERCEL_URL
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/api`
  : "http://localhost:3000/api";

export const useStore = create<QueryStore>((set) => ({
  results: [],
  clear: () => {
    set((state) => ({ results: [] }));
  },
  search: async (query) => {
    try {
      const response = await fetch(`${URL}/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(query),
      });
      await stream(response, (value) => {
        const result = {title: query.query, message: value}
        set((state) => ({ results: [result, ...state.results] }));
      })
    } catch (error) {
      console.error("Error creating todo:", error);
    }
  }
}));
async function stream(response : Response, handler: (value: string) => void) {
  const reader = response.body!.getReader();
  let chunks = "";
  
  let done, value;
  while (!done) {
    ({ value, done } = await reader.read());
    if (done) {
      return;
    }
    if (value) {
      let decoded = new TextDecoder().decode(value)
      handler(decoded)
    }
  }
}