import { create } from "zustand";
import Pusher from 'pusher-js';

import { v4 as uuidv4 } from 'uuid';

export type SearchResult = {
  query: string;
  id: string;
  message: string;
  status: string;
};

type SearchQuery = {
  query: string;
};

type QueryStore = {
  results: SearchResult[];
  visits: number,
  ip: string;
  get_ip: () => Promise<string>;
  search: (query: SearchQuery) => void;
  clear: () => void;
  toggleModal: (open: boolean) => void
  modalOpen: boolean,
  convertUser: (email: string) => void
  incrementVisits: () => Promise<number>
  setFeedback: (result: SearchResult, useful: boolean) => Promise<void>
};

export const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
: "http://localhost:3000";


    var pusher = new Pusher('63825740c4c965adde6c', {
      cluster: 'mt1'
    });

export const useStore = create<QueryStore>((set) => ({
  results: [],
  visits: 0,
  ip: "",
  get_ip: async () => {
    const response = await fetch("/api/ip");
    const json = await response.json();
    const ip = json.requester_ip
    set((state) => ({ ip: ip }));
    return ip
  },
  clear: () => {
    set((state) => ({ results: [] }));
  },
  search: async (body) => {
    const queryId = uuidv4()
    console.log("Asking", body.query, "queryId", queryId, baseUrl)

    fetch("/api/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({query: body.query, clientId: queryId}),
    })
    .then(console.log)
    .catch(console.error)

    const channel = pusher.subscribe("updates");

    return new Promise((resolve, reject) => {

      channel.bind(queryId, (event: { data: string; status: string; }) => {
        const payload = {query: body.query, id: queryId, message: event.data, status: event.status}
        set((state) => {
          let results = state.results ?? []
          const index = results.findIndex(v => v.id == queryId);
          if (index == -1) {
            results.unshift(payload)
          } else {
            results[index] = payload
          }
          return { results: [...results] }
        });
        if(event.status == "ended") resolve();
      });

    })
  },
  toggleModal: (open) => {
    set((state) => ({ modalOpen: open}));
  },
  modalOpen: false,
  convertUser: (email : string) => {
    fetch('/api/addEmail', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({email: email}),
    })
      .then(console.log)
  },
  incrementVisits: async () : Promise<number> => {
    const response = await fetch('/api/visits', {
      method: "POST"
    })
    const json = await response.json()
    const visits = json.visits as number
    set((state) => ({ visits: visits }));
    return visits
  },
  setFeedback: async (result, useful) : Promise<void> => {
    fetch('/api/feedback', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({feedback: useful, query: result.query, body: result.message}),
    })
      .then(console.log)
  },
}));