"use client";

import React from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { BattleTypes } from "@/drizzle/constants";
import type { BattleType } from "@/drizzle/constants";

/**
 * -----------------------------
 * STATE HOOK
 * -----------------------------
 */
export const useFiltering = () => {
  type None = "None";
  const [battleType, setBattleType] = useState<BattleType | None>("None");
  const now = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(now.getMonth() - 1);
  const [startDate, setStartDate] = useState<Date>(oneMonthAgo);
  const [endDate, setEndDate] = useState<Date>(now);

  return {
    battleType,
    setBattleType,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
  };
};

export type StatisticsFilteringState = ReturnType<typeof useFiltering>;

/**
 * -----------------------------
 * MAIN COMPONENT
 * -----------------------------
 */
interface StatisticsFilteringProps {
  state: StatisticsFilteringState;
}

const StatisticsFiltering: React.FC<StatisticsFilteringProps> = ({ state }) => {
  const { battleType, setBattleType, startDate, setStartDate, endDate, setEndDate } =
    state;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button id="filter-statistics">
          <Filter className="sm:mr-2 h-6 w-6 hover:text-orange-500" />
          <p className="hidden sm:block">Filter</p>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-52">
        <div className="grid grid-cols-1 gap-2">
          {/* Battle Type */}
          <div>
            <Label htmlFor="battleType">Battle Type</Label>
            <Select
              onValueChange={(v) => setBattleType(v as BattleType | "None")}
              value={battleType}
            >
              <SelectTrigger>
                <SelectValue placeholder={battleType} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem key="None" value="None">
                  All
                </SelectItem>
                {BattleTypes.map((bt) => (
                  <SelectItem key={bt} value={bt} className="capitalize">
                    {bt.toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Start Date */}
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <input
              id="startDate"
              type="date"
              className="border rounded px-2 py-1 w-full"
              value={startDate.toISOString().slice(0, 10)}
              onChange={(e) => setStartDate(new Date(e.target.value))}
            />
          </div>
          {/* End Date */}
          <div>
            <Label htmlFor="endDate">End Date</Label>
            <input
              id="endDate"
              type="date"
              className="border rounded px-2 py-1 w-full"
              value={endDate.toISOString().slice(0, 10)}
              onChange={(e) => setEndDate(new Date(e.target.value))}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default StatisticsFiltering;

/**
 * -----------------------------
 * Helper to combine filter state into a usable query/filter object
 * -----------------------------
 */
export const getFilter = (state: StatisticsFilteringState) => {
  return {
    battleType: state.battleType === "None" ? undefined : state.battleType,
    startDate: state.startDate.toISOString(),
    endDate: state.endDate.toISOString(),
  };
};
