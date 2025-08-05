import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multi-select";
import { Filter } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { RANKED_RANKS } from "@/drizzle/constants";
import type { RankedRank } from "@/drizzle/constants";

/**
 * STATE HOOK
 */
export const useFiltering = () => {
  const [rankedRanks, setRankedRanks] = useState<RankedRank[]>([]);
  const [minCount, setMinCount] = useState<number>(1);

  return {
    rankedRanks,
    minCount,
    setRankedRanks,
    setMinCount,
  };
};

export type QueueLengthFilteringState = ReturnType<typeof useFiltering>;

interface QueueLengthFilteringProps {
  state: QueueLengthFilteringState;
}

/**
 * MAIN COMPONENT
 */
const QueueLengthFiltering: React.FC<QueueLengthFilteringProps> = (props) => {
  const { rankedRanks, minCount, setRankedRanks, setMinCount } = props.state;

  // Count filters
  const numRankedRanks = rankedRanks.length;
  const numMinCount = minCount > 1 ? 1 : 0;
  const numFilters = numRankedRanks + numMinCount;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button count={numFilters}>
          <Filter className="sm:mr-2 h-6 w-6 hover:text-orange-500" />
          <p className="hidden sm:block">Filter</p>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="min-w-96">
        <div className="grid grid-cols-1 gap-4">
          {/* Ranked Ranks */}
          <div>
            <Label>Ranked Ranks</Label>
            <MultiSelect
              selected={rankedRanks}
              options={RANKED_RANKS.map((rank) => ({ value: rank, label: rank }))}
              onChange={(e) => setRankedRanks(e as RankedRank[])}
            />
          </div>

          {/* Minimum Count */}
          <div>
            <Label>Minimum Count</Label>
            <Input
              type="number"
              placeholder="Minimum count"
              min={1}
              value={minCount}
              onChange={(e) => setMinCount(Number(e.target.value) || 1)}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default QueueLengthFiltering;

/**
 * Combine filters into final object
 */
export const getFilter = (state: QueueLengthFilteringState) => {
  return {
    rankedRanks: state.rankedRanks.length > 0 ? state.rankedRanks : undefined,
    minCount: state.minCount,
  };
};
