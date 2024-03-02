import { create } from "zustand";
import io from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

type SearchResult = {
  query: string;
  message: string;
  status: string;
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
  search: async (body) => {
    const clientId = uuidv4()
    console.log("Asking", body.query, "clientId", clientId)
    const socket = io(`http://localhost:3000/updates`);  // Adjust URL accordingly

    socket.on('connect', () => {
      console.log('WebSocket connected');
      fetch("/api/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({query: body.query, clientId: clientId}),
        })
        .then(console.log)
        .catch(console.error)
    });
    return new Promise((resolve, reject) => {

      socket.on(clientId, (event) => {
        set((state) => ({ results: [{query: body.query, message: event.data as string, status: event.status as string}] }));
        if(event.status == "end") resolve();
      });
      socket.on('error', (error) => {
        console.error("error", error)
        reject(error)
      });

    })
    socket.on("disconnect", () => {
      console.log("disconnected"); // undefined
    });
  }
}));