import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multi-select";
import { Filter } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { BattleTypes } from "@/drizzle/constants";
import type { BattleType } from "@/drizzle/constants";

/**
 * STATE HOOK
 */
export const useFiltering = () => {
  const [battleTypes, setBattleTypes] = useState<BattleType[]>([
    "RANKED_PVP",
    "COMBAT",
  ]);
  const [minCount, setMinCount] = useState<number>(1);
  const [minWinnerLevel, setMinWinnerLevel] = useState<number>(1);
  const [maxWinnerLevel, setMaxWinnerLevel] = useState<number>(100);
  const [minLoserLevel, setMinLoserLevel] = useState<number>(1);
  const [maxLoserLevel, setMaxLoserLevel] = useState<number>(100);

  return {
    battleTypes,
    minCount,
    minWinnerLevel,
    maxWinnerLevel,
    minLoserLevel,
    maxLoserLevel,
    setBattleTypes,
    setMinCount,
    setMinWinnerLevel,
    setMaxWinnerLevel,
    setMinLoserLevel,
    setMaxLoserLevel,
  };
};

export type BattleLengthFilteringState = ReturnType<typeof useFiltering>;

interface BattleLengthFilteringProps {
  state: BattleLengthFilteringState;
}

/**
 * MAIN COMPONENT
 */
const BattleLengthFiltering: React.FC<BattleLengthFilteringProps> = (props) => {
  const {
    battleTypes,
    minCount,
    minWinnerLevel,
    maxWinnerLevel,
    minLoserLevel,
    maxLoserLevel,
    setBattleTypes,
    setMinCount,
    setMinWinnerLevel,
    setMaxWinnerLevel,
    setMinLoserLevel,
    setMaxLoserLevel,
  } = props.state;

  // Count filters
  const numBattleTypes = battleTypes.length;
  const numMinCount = minCount > 1 ? 1 : 0;
  const numWinnerLevel = minWinnerLevel > 1 || maxWinnerLevel < 100 ? 1 : 0;
  const numLoserLevel = minLoserLevel > 1 || maxLoserLevel < 100 ? 1 : 0;
  const numFilters = numBattleTypes + numMinCount + numWinnerLevel + numLoserLevel;

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
          {/* Battle Types */}
          <div>
            <Label>Battle Types</Label>
            <MultiSelect
              selected={battleTypes}
              options={BattleTypes.map((type) => ({ value: type, label: type }))}
              onChange={(e) => setBattleTypes(e as BattleType[])}
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

          {/* Winner Level Range */}
          <div>
            <Label>Winner Level Range</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min"
                min={1}
                max={100}
                value={minWinnerLevel}
                onChange={(e) => setMinWinnerLevel(Number(e.target.value) || 1)}
              />
              <Input
                type="number"
                placeholder="Max"
                min={1}
                max={100}
                value={maxWinnerLevel}
                onChange={(e) => setMaxWinnerLevel(Number(e.target.value) || 100)}
              />
            </div>
          </div>

          {/* Loser Level Range */}
          <div>
            <Label>Loser Level Range</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min"
                min={1}
                max={100}
                value={minLoserLevel}
                onChange={(e) => setMinLoserLevel(Number(e.target.value) || 1)}
              />
              <Input
                type="number"
                placeholder="Max"
                min={1}
                max={100}
                value={maxLoserLevel}
                onChange={(e) => setMaxLoserLevel(Number(e.target.value) || 100)}
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default BattleLengthFiltering;

/**
 * Combine filters into final object
 */
export const getFilter = (state: BattleLengthFilteringState) => {
  return {
    battleTypes: state.battleTypes.length > 0 ? state.battleTypes : undefined,
    minCount: state.minCount,
    minWinnerLevel: state.minWinnerLevel > 1 ? state.minWinnerLevel : undefined,
    maxWinnerLevel: state.maxWinnerLevel < 100 ? state.maxWinnerLevel : undefined,
    minLoserLevel: state.minLoserLevel > 1 ? state.minLoserLevel : undefined,
    maxLoserLevel: state.maxLoserLevel < 100 ? state.maxLoserLevel : undefined,
  };
};
