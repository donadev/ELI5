import { baseUrl, useStore } from "@/store";
import { useState } from "react";

interface SearchResultProps {
  result: {
    query: string,
    status: string,
    message: string;
  };
}

const SearchResult: React.FC<SearchResultProps> = ({ result }) => {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false)
  
  function share() {

    navigator.clipboard.writeText(baseUrl + "?q=" + encodeURIComponent(result.query));
    setCopied(true)
  }

  return (
    <div className="flex flex-col items-center space-x-2 mb-2">
        <h1 className="text-xl font-bold mb-4">{result.query}</h1>
        <p dangerouslySetInnerHTML={{ __html: result.message }}></p>
        <br/>
        { result.status == "ended" ? 
        (<button className="px-2 py-1 text-white rounded bg-sky-500" onClick={share}>{copied ? "Copied" : "Share link"}</button>) : null
        }
        <br/>
    </div>
  );
};

export default SearchResult;
