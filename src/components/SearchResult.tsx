import { useStore } from "@/store";
import { useState } from "react";

interface SearchResultProps {
  result: {
    message: string;
  };
}

const SearchResult: React.FC<SearchResultProps> = ({ result }) => {
  const [loading, setLoading] = useState(false);
  

  return (
    <div className="flex items-center space-x-2 mb-2">
        <p dangerouslySetInnerHTML={{ __html: result.message }}></p>
    </div>
  );
};

export default SearchResult;
