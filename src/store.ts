import { create } from "zustand";
import Pusher from 'pusher-js';

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
  get_ip: () => Promise<string>;
  search: (query: SearchQuery) => void;
  clear: () => void;
  toggleModal: (open: boolean) => void
  modalOpen: boolean,
  openForm: () => void
};

const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
: "http://localhost:3000";


    var pusher = new Pusher('63825740c4c965adde6c', {
      cluster: 'mt1'
    });

export const useStore = create<QueryStore>((set) => ({
  results: [],
  ip: "",
  get_ip: async () => {
    const response = await fetch("/api/ip");
    const json = await response.json();
    return json.requester_ip
  },
  clear: () => {
    set((state) => ({ results: [] }));
  },
  search: async (body) => {
    const clientId = uuidv4()
    console.log("Asking", body.query, "clientId", clientId, baseUrl)

    fetch("/api/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({query: body.query, clientId: clientId}),
    })
    .then(console.log)
    .catch(console.error)

    const channel = pusher.subscribe("updates");

    return new Promise((resolve, reject) => {

      channel.bind(clientId, (event: { data: string; status: string; }) => {
        set((state) => ({ results: [{query: body.query, message: event.data, status: event.status}] }));
        if(event.status == "ended") resolve();
      });

    })
  },
  toggleModal: (open) => {
    set((state) => ({ modalOpen: open}));
  },
  modalOpen: false,
  openForm: () => {
    location.href = "https://docs.google.com/forms/d/18NAYuR19t0uqjYnsJUQQ8Vk66rtKKPup3EtWaJfMdRk/edit?ts=65e19a4c"
  }
}));