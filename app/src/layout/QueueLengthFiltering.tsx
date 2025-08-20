import {
  ContentFiltering,
  useContentFiltering,
  buildFilter,
  defineFilteringSchema,
  toOptions,
} from "@/layout/ContentFiltering";
import { RANKED_RANKS } from "@/drizzle/constants";

interface QueueLengthFilteringProps {
  state: QueueLengthFilteringState;
}

const makeSchema = () =>
  defineFilteringSchema({
    fields: [
      {
        id: "rankedRanks",
        label: "Ranked Ranks",
        type: "multi-select",
        defaultValue: [],
        options: toOptions(RANKED_RANKS),
      },
      {
        id: "minCount",
        label: "Minimum Count",
        type: "number",
        defaultValue: undefined,
      },
    ] as const,
  });

const QueueLengthFiltering: React.FC<QueueLengthFilteringProps> = (props) => {
  return (
    <ContentFiltering
      schema={makeSchema()}
      state={props.state.cf}
      triggerButtonId="filter-queue-length"
    />
  );
};

export default QueueLengthFiltering;

export const getFilter = (state: QueueLengthFilteringState) =>
  buildFilter(state.cf, makeSchema());

export const useFiltering = () => {
  const cf = useContentFiltering(makeSchema());
  return {
    ...cf.values,
    cf,
    setRankedRanks: cf.setters.rankedRanks,
    setMinCount: cf.setters.minCount,
  };
};

export type QueueLengthFilteringState = ReturnType<typeof useFiltering>;
