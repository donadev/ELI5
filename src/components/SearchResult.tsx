import { useStore } from "@/store";
import { useState } from "react";

interface SearchResultProps {
  result: {
    id: number;
    title: string;
  };
}

const SearchResult: React.FC<SearchResultProps> = ({ result }) => {
  const [loading, setLoading] = useState(false);
  

  return (
    <div className="flex items-center space-x-2 mb-2">
        {result.title}
    </div>
  );
};

export default SearchResult;
