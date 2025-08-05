"use client";

import React, { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multi-select";
import { Filter } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

/**
 * STATE HOOK
 */
export const useFiltering = () => {
  const [types, setTypes] = useState<string[]>(["jutsu", "item", "consumable"]);
  const [name, setName] = useState<string>("");
  const [debouncedName, setDebouncedName] = useState<string>("");
  const [minCount, setMinCount] = useState<number>(1);

  // Debounce the name input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedName(name);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [name]);

  return {
    types,
    name,
    debouncedName,
    minCount,
    setTypes,
    setName,
    setMinCount,
  };
};

export type RankedLoadoutFilteringState = ReturnType<typeof useFiltering>;

interface RankedLoadoutFilteringProps {
  state: RankedLoadoutFilteringState;
}

/**
 * MAIN COMPONENT
 */
const RankedLoadoutFiltering: React.FC<RankedLoadoutFilteringProps> = (props) => {
  const { types, name, debouncedName, minCount, setTypes, setName, setMinCount } =
    props.state;
  const [isOpen, setIsOpen] = useState(false);

  // Count filters
  const numTypes = types.length > 0 ? types.length : 0;
  const numName = debouncedName.length > 0 ? 1 : 0;
  const numMinCount = minCount > 1 ? 1 : 0;
  const numFilters = numTypes + numName + numMinCount;

  const typeOptions = [
    { value: "jutsu", label: "Jutsu" },
    { value: "item", label: "Item" },
    { value: "consumable", label: "Consumable" },
  ];

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
          {/* Types */}
          <div>
            <Label>Types</Label>
            <MultiSelect
              selected={types}
              options={typeOptions}
              onChange={(e) => setTypes(e as string[])}
            />
          </div>

          {/* Name */}
          <div>
            <Label>Name</Label>
            <Input
              type="text"
              placeholder="Filter by name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={() => setIsOpen(true)}
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
              onFocus={() => setIsOpen(true)}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default RankedLoadoutFiltering;

/**
 * Combine filters into final object
 */
export const getFilter = (state: RankedLoadoutFilteringState) => {
  return {
    types: state.types.length > 0 ? state.types : undefined,
    name: state.debouncedName.length > 0 ? state.debouncedName : undefined,
    minCount: state.minCount,
  };
};
