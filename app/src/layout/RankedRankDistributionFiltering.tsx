"use client";

import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Filter } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

/**
 * STATE HOOK
 */
export const useFiltering = () => {
  const [minCount, setMinCount] = useState<number>(1);
  const [minLevel, setMinLevel] = useState<number>(1);
  const [maxLevel, setMaxLevel] = useState<number>(100);

  return {
    minCount,
    minLevel,
    maxLevel,
    setMinCount,
    setMinLevel,
    setMaxLevel,
  };
};

export type RankedRankDistributionFilteringState = ReturnType<typeof useFiltering>;

interface RankedRankDistributionFilteringProps {
  state: RankedRankDistributionFilteringState;
}

/**
 * MAIN COMPONENT
 */
const RankedRankDistributionFiltering: React.FC<
  RankedRankDistributionFilteringProps
> = (props) => {
  const { minCount, minLevel, maxLevel, setMinCount, setMinLevel, setMaxLevel } =
    props.state;
  const [isOpen, setIsOpen] = useState(false);

  // Count filters
  const numMinCount = minCount > 1 ? 1 : 0;
  const numMinLevel = minLevel > 1 ? 1 : 0;
  const numMaxLevel = maxLevel < 100 ? 1 : 0;
  const numFilters = numMinCount + numMinLevel + numMaxLevel;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button count={numFilters}>
          <Filter className="sm:mr-2 h-6 w-6 hover:text-orange-500" />
          <p className="hidden sm:block">Filter</p>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="min-w-80">
        <div className="grid grid-cols-1 gap-4">
          {/* Minimum Count */}
          <div>
            <Label>Minimum Count</Label>
            <Input
              type="number"
              placeholder="Minimum count"
              min={1}
              value={minCount}
              onChange={(e) => setMinCount(Number(e.target.value) || 1)}
              onFocus={() => setIsOpen(true)}
            />
          </div>

          {/* Level Range */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Min Level</Label>
              <Input
                type="number"
                placeholder="Min level"
                min={1}
                max={100}
                value={minLevel}
                onChange={(e) => setMinLevel(Number(e.target.value) || 1)}
                onFocus={() => setIsOpen(true)}
              />
            </div>
            <div>
              <Label>Max Level</Label>
              <Input
                type="number"
                placeholder="Max level"
                min={1}
                max={100}
                value={maxLevel}
                onChange={(e) => setMaxLevel(Number(e.target.value) || 100)}
                onFocus={() => setIsOpen(true)}
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default RankedRankDistributionFiltering;

/**
 * Combine filters into final object
 */
export const getFilter = (state: RankedRankDistributionFilteringState) => {
  return {
    minCount: state.minCount,
    minLevel: state.minLevel > 1 ? state.minLevel : undefined,
    maxLevel: state.maxLevel < 100 ? state.maxLevel : undefined,
  };
};
