import { baseUrl, useStore, SearchResult } from "@/store";
import mixpanel from "mixpanel-browser";
import { use, useState } from "react";
import ThumbButton from "./ThumbButton";

interface SearchResultProps {
  result: SearchResult;
}

const SearchResult: React.FC<SearchResultProps> = ({ result }) => {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false)
  const [useful, setUseful] = useState<boolean | undefined>(undefined)
  const setFeedback = useStore((state) => state.setFeedback)
  
  function share() {

    navigator.clipboard.writeText(baseUrl + "?q=" + encodeURIComponent(result.query));
    setCopied(true)
  }
  function feedback(useful : boolean) {
    mixpanel.track("answer_feedback", {query: result.query, feedback: useful})
    setUseful(useful)
    setFeedback(result, useful)
  } 

  function footer() {
    if (result.status != "ended") return;
    return (
      <div className="flex justify-between w-full px-10">
        <button className="px-2 py-1 text-white rounded bg-sky-500" onClick={share}>{copied ? "Copied" : "Share link"}</button>
        <div className="flex justify-end">
          <ThumbButton selected={useful === false} up={false}  onClick={() => feedback(false)}/>
          <ThumbButton selected={useful === true} up={true} onClick={() => feedback(true)}/>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center space-x-2 mb-2">
        <h1 className="text-xl font-bold mb-4">{result.query}</h1>
        <p dangerouslySetInnerHTML={{ __html: result.message }}></p>
        <br/>
        {footer()}
        <br/>
    </div>
  );
};

export default SearchResult;
