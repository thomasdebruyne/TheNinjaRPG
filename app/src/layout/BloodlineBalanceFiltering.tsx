import {
  ContentFiltering,
  useContentFiltering,
  buildFilter,
  defineFilteringSchema,
  toOptions,
} from "@/layout/ContentFiltering";
import { BattleTypes, LetterRanks, StatTypes } from "@/drizzle/constants";

interface BloodlineBalanceFilteringProps {
  state: BloodlineBalanceFilteringState;
}

const makeSchema = () =>
  defineFilteringSchema({
    fields: [
      {
        id: "battleTypes",
        label: "Battle Types",
        type: "multi-select",
        defaultValue: ["COMBAT", "SPARRING"],
        options: toOptions(BattleTypes),
      },
      {
        id: "minCount",
        label: "Minimum Count",
        type: "number",
        defaultValue: undefined,
      },
      {
        id: "bloodlineRanks",
        label: "Bloodline Ranks",
        type: "multi-select",
        defaultValue: [],
        options: toOptions(LetterRanks),
      },
      {
        id: "statClassifications",
        label: "Stat Classifications",
        type: "multi-select",
        defaultValue: [],
        options: toOptions(StatTypes),
      },
    ] as const,
  });

const BloodlineBalanceFiltering: React.FC<BloodlineBalanceFilteringProps> = (props) => {
  return (
    <ContentFiltering
      schema={makeSchema()}
      state={props.state.cf}
      triggerButtonId="filter-bloodline-balance"
    />
  );
};

export default BloodlineBalanceFiltering;

export const getFilter = (state: BloodlineBalanceFilteringState) =>
  buildFilter(state.cf, makeSchema());

export const useFiltering = () => {
  const cf = useContentFiltering(makeSchema());
  return {
    ...cf.values,
    cf,
    setBattleTypes: cf.setters.battleTypes,
    setMinCount: cf.setters.minCount,
    setBloodlineRanks: cf.setters.bloodlineRanks,
    setStatClassifications: cf.setters.statClassifications,
  };
};

export type BloodlineBalanceFilteringState = ReturnType<typeof useFiltering>;
