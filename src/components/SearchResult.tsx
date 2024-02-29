import { useStore } from "@/store";
import { useState } from "react";

interface SearchResultProps {
  result: {
    title: string,
    message: string;
  };
}

const SearchResult: React.FC<SearchResultProps> = ({ result }) => {
  const [loading, setLoading] = useState(false);
  

  return (
    <div className="flex flex-col items-center space-x-2 mb-2">
        <h1 className="text-xl font-bold mb-4">{result.title}</h1>
        <p dangerouslySetInnerHTML={{ __html: result.message }}></p>
    </div>
  );
};

export default SearchResult;
