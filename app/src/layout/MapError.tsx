import React from "react";
import { Globe, RefreshCw } from "lucide-react";

const MapError: React.FC = () => {
  return (
    <div className="w-full min-h-96 flex flex-col items-center justify-center">
      <Globe className="w-40 h-40 p-3 m-3 bg-popover rounded-full animate-pulse" />
      <p className="text-red-500 font-bold">Network error loading the map data.</p>
      <p className="text-muted-foreground">Please try reloading the page.</p>
      <p
        className="hover:text-orange-500 hover:cursor-pointer animate-pulse mt-2"
        onClick={() => location.reload()}
      >
        Refresh <RefreshCw className="w-5 h-5 inline" />
      </p>
    </div>
  );
};

export default MapError;
